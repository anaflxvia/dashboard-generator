import { useEffect, useState } from 'react'
import ChatInterface from './components/ChatInterface'
import Dashboard from './components/Dashboard'
import { generateDashboard } from './lib/anthropic'
import { gerarEmbedding, geminiConfigurado } from './services/embeddings'
import { buscarSimilar, salvarDashboard } from './services/dashboardCache'
import type { DashboardData, UserAnswers } from './types'
import { carregarBrand, salvarBrand, type Brand } from './lib/brand'

type AppState = 'chat' | 'dashboard'

export default function App() {
  const [state, setState] = useState<AppState>('chat')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [brand, setBrand] = useState<Brand>(carregarBrand)

  // a marca e so apresentacao: nao entra no prompt nem no cache, e fica salva no navegador
  useEffect(() => { salvarBrand(brand) }, [brand])

  async function handleChatComplete(answers: UserAnswers) {
    setIsGenerating(true)
    setError(null)
    setFromCache(false)

    try {
      let data: DashboardData

      if (geminiConfigurado()) {
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
          // embedding indisponível para esta chave — gera sem cache
          console.warn('[cache] Embedding indisponível, gerando sem cache:', embErr)
          data = await generateDashboard(answers)
        }
      } else {
        // sem Gemini configurado — gera direto sem cache
        data = await generateDashboard(answers)
      }

      setDashboardData(data)
      setState('dashboard')
    } catch (err) {
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

  if (state === 'dashboard' && dashboardData) {
    return <Dashboard data={dashboardData} onBack={handleBack} fromCache={fromCache} brand={brand} />
  }

  return (
    <ChatInterface
      onComplete={handleChatComplete}
      isGenerating={isGenerating}
      error={error}
      brand={brand}
      setBrand={setBrand}
    />
  )
}
