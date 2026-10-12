import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import Dashboard from './components/Dashboard'
import BrandSettings from './components/BrandSettings'
import { clearBrand, loadSavedBrand, type Brand } from './lib/brand'
import { temaDoSegmento } from './lib/segmentThemes'
import { generateDashboard } from './lib/gemini'
import { gerarEmbedding } from './services/embeddings'
import AccessGate from './components/AccessGate'
import { codigoSalvo, ErroAcesso } from './services/acesso'
import { buscarSimilar, salvarDashboard } from './services/dashboardCache'
import type { DashboardData, UserAnswers } from './types'
import { DEMOS } from './lib/demos'

// ?demo=logistica|financeiro|vendas|rh abre direto um dashboard de exemplo (com a marca da demo, se tiver)
const DEMO = DEMOS[new URLSearchParams(window.location.search).get('demo') ?? ''] ?? null

type AppState = 'chat' | 'dashboard' | 'brand'

// demos (?demo=) ficam abertas; gerar com a IA exige o codigo de acesso
const PRECISA_CODIGO = !DEMO

export default function App() {
  const [state, setState] = useState<AppState>(DEMO ? 'dashboard' : 'chat')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(DEMO?.data ?? null)
  const [fromCache, setFromCache] = useState(false)
  const [liberado, setLiberado] = useState(() => !PRECISA_CODIGO || !!codigoSalvo())
  const [avisoAcesso, setAvisoAcesso] = useState<string | null>(null)
  // marca salva pelo usuario; sem ela, vale o tema do segmento (skill ui-ux-pro-max)
  const [savedBrand, setSavedBrand] = useState<Brand | null>(loadSavedBrand)
  const [segmento, setSegmento] = useState<string | undefined>(DEMO?.data.segment)
  const segmentoAtual = segmento ?? dashboardData?.segment
  // a marca da demo vale ate o usuario salvar ou escolher outra
  const [usarMarcaDemo, setUsarMarcaDemo] = useState(!!DEMO?.brand)
  const brand: Brand = (usarMarcaDemo ? DEMO?.brand : undefined) ?? savedBrand ?? temaDoSegmento(segmentoAtual).brand

  async function handleChatComplete(answers: UserAnswers) {
    setSegmento(answers.segmento)
    setIsGenerating(true)
    setError(null)
    setFromCache(false)

    try {
      let data: DashboardData

      try {
        // 1. gera embedding das respostas
        const embedding = await gerarEmbedding(answers)

        // 2. busca no cache por dashboard similar (threshold 0.85)
        const cached = await buscarSimilar(embedding)
        if (cached) {
          setDashboardData(cached)
          setFromCache(true)
          setState('dashboard')
          return
        }

        // 3. cache miss — gera via Gemini
        data = await generateDashboard(answers)

        // 4. salva no cache em segundo plano (nao bloqueia o fluxo)
        salvarDashboard(answers, embedding, data).catch((err: unknown) =>
          console.warn('[cache] Falha ao salvar:', err)
        )
      } catch (embErr) {
        if (embErr instanceof ErroAcesso) throw embErr
        // embedding ou cache indisponivel — gera sem cache
        console.warn('[cache] Embedding indisponível, gerando sem cache:', embErr)
        data = await generateDashboard(answers)
      }

      setDashboardData(data)
      setState('dashboard')
    } catch (err) {
      if (err instanceof ErroAcesso) {
        // codigo trocado ou revogado: volta para a tela de codigo
        setAvisoAcesso('Seu código de acesso não vale mais. Digite de novo.')
        setLiberado(false)
        return
      }
      const message = err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  function handleBack() {
    setDashboardData(null)
    setError(null)
    setFromCache(false)
    setState('chat')
  }

  if (!liberado) {
    return <AccessGate aviso={avisoAcesso} onGranted={() => { setAvisoAcesso(null); setLiberado(true) }} />
  }

  if (state === 'brand') {
    return (
      <BrandSettings
        initial={brand}
        segmento={segmentoAtual}
        usandoTemaDoSegmento={!savedBrand}
        onSaved={(b) => { setSavedBrand(b); setUsarMarcaDemo(false) }}
        onUsarTemaDoSegmento={() => { clearBrand(); setSavedBrand(null); setUsarMarcaDemo(false) }}
        onBack={() => setState(dashboardData ? 'dashboard' : 'chat')}
      />
    )
  }

  if (state === 'dashboard' && dashboardData) {
    return (
      <Dashboard
        data={dashboardData}
        brand={brand}
        onBack={handleBack}
        onOpenBrand={() => setState('brand')}
        fromCache={fromCache}
      />
    )
  }

  return (
    <ChatInterface
      onComplete={handleChatComplete}
      isGenerating={isGenerating}
      error={error}
      onOpenBrand={() => setState('brand')}
    />
  )
}
