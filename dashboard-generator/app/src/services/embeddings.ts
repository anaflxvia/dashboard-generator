import type { UserAnswers } from '../types'
import { chamarServidor } from './acesso'

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

export async function gerarEmbedding(answers: UserAnswers): Promise<number[]> {
  // tenta text-embedding-004 primeiro, cai para embedding-001 se indisponível
  const models = ['text-embedding-004', 'embedding-001']

  for (const model of models) {
    const response = await chamarServidor({
      kind: 'embed',
      model,
      payload: { content: { parts: [{ text: buildText(answers) }] } },
    })

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
