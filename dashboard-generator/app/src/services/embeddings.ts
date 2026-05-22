import type { UserAnswers } from '../types'

function buildText(answers: UserAnswers): string {
  return [
    `Segmento: ${answers.segmento}`,
    answers.objetivo    && `Objetivo: ${answers.objetivo}`,
    answers.decisao     && `Decisao: ${answers.decisao}`,
    answers.comparacoes && `Comparacoes: ${answers.comparacoes}`,
    answers.metricas    && `Metricas: ${answers.metricas}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function geminiConfigurado(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY
}

export async function gerarEmbedding(answers: UserAnswers): Promise<number[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY não configurada no .env')

  // tenta text-embedding-004 primeiro, cai para embedding-001 se indisponível
  const models = ['text-embedding-004', 'embedding-001']

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: buildText(answers) }] },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } }
      const msg = err.error?.message ?? ''
      // se o modelo não existe, tenta o próximo
      if (msg.includes('not found') || msg.includes('not supported')) continue
      throw new Error(msg || `Gemini embedding: HTTP ${response.status}`)
    }

    const data = await response.json() as { embedding?: { values?: number[] } }
    const values = data.embedding?.values
    if (!Array.isArray(values)) throw new Error('Resposta de embedding inválida')
    return values
  }

  throw new Error('Nenhum modelo de embedding disponível para esta chave do Gemini')
}
