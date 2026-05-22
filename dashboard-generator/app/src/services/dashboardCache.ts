import { createClient } from '@supabase/supabase-js'
import type { UserAnswers, DashboardData } from '../types'

function getClient() {
  const raw = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!raw || !key) {
    throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas no .env')
  }
  // remove trailing /rest/v1/ ou /rest/v1 caso o usuario tenha colado a URL completa
  const url = raw.replace(/\/rest\/v1\/?$/, '')
  return createClient(url, key)
}

export async function buscarSimilar(embedding: number[]): Promise<DashboardData | null> {
  const supabase = getClient()

  const { data, error } = await supabase.rpc('match_dashboards', {
    query_embedding: embedding,
    match_threshold: 0.85,
    match_count: 1,
  })

  if (error) {
    console.warn('[cache] Erro na busca:', error.message)
    return null
  }

  const row = (data as Array<{ html_gerado: string }> | null)?.[0]
  if (!row?.html_gerado) return null

  try {
    return JSON.parse(row.html_gerado) as DashboardData
  } catch {
    console.warn('[cache] Falha ao parsear dashboard cacheado')
    return null
  }
}

export async function salvarDashboard(
  answers: UserAnswers,
  embedding: number[],
  data: DashboardData
): Promise<void> {
  const supabase = getClient()

  const { error } = await supabase.from('dashboards').insert({
    segmento:    answers.segmento,
    objetivo:    answers.objetivo,
    decisao:     answers.decisao,
    comparacoes: answers.comparacoes,
    metricas:    answers.metricas,
    embedding,
    html_gerado: JSON.stringify(data),
    criado_em:   new Date().toISOString(),
  })

  if (error) {
    console.warn('[cache] Erro ao salvar:', error.message)
  }
}
