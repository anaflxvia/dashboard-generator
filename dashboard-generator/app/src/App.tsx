import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import Dashboard from './components/Dashboard'
import BrandSettings from './components/BrandSettings'
import { loadBrand, type Brand } from './lib/brand'
import { generateDashboard } from './lib/gemini'
import { gerarEmbedding, geminiConfigurado } from './services/embeddings'
import { buscarSimilar, salvarDashboard } from './services/dashboardCache'
import type { DashboardData, UserAnswers } from './types'

type AppState = 'chat' | 'dashboard' | 'brand'

export default function App() {
  const [state, setState] = useState<AppState>('chat')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [brand, setBrand] = useState<Brand>(loadBrand)

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

  if (state === 'brand') {
    return (
      <BrandSettings
        initial={brand}
        onSaved={setBrand}
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
