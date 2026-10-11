import type { DashboardData, UserAnswers } from '../types'
import { REGRAS_VISUALIZACAO } from './dashboardGuide'

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY não configurada no .env')
  }
  return apiKey
}

function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
}

export async function generateDashboard(answers: UserAnswers): Promise<DashboardData> {
  const apiKey = getApiKey()

  const prompt = `Gere dados de dashboard realistas e fictícios baseados no contexto abaixo.

Segmento: ${answers.segmento}
Objetivo: ${answers.objetivo}
Decisão estratégica: ${answers.decisao}
Comparações desejadas: ${answers.comparacoes}
Métricas importantes: ${answers.metricas}

Retorne SOMENTE um JSON válido com esta estrutura exata (sem markdown, sem explicações):
{
  "title": "Título do Dashboard",
  "segment": "Nome do Segmento",
  "summary": "Resumo de 1-2 frases do dashboard",
  "tabs": [
    {
      "name": "Nome da Aba",
      "kpis": [
        { "label": "Nome do KPI", "value": "1.234", "change": "+12,3%", "trend": "up", "sparkline": [980, 1010, 1050, 1032, 1120, 1180, 1234] },
        { "label": "Nome do KPI", "value": "R$ 45.2K", "change": "-3,1%", "trend": "down", "sparkline": [48.1, 47.6, 47.9, 46.8, 46.2, 45.9, 45.2] },
        { "label": "Nome do KPI", "value": "98,5%", "change": "+0,5%", "trend": "up", "sparkline": [97.6, 97.9, 98.0, 97.8, 98.1, 98.3, 98.5] },
        { "label": "Nome do KPI", "value": "234", "change": "0,0%", "trend": "neutral", "sparkline": [231, 236, 233, 235, 232, 236, 234] }
      ],
      "charts": [
        {
          "title": "Título do Gráfico",
          "type": "bar",
          "labels": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
          "datasets": [
            { "label": "Série A", "data": [120, 145, 132, 167, 153, 189] },
            { "label": "Série B", "data": [98, 112, 108, 134, 121, 145] }
          ]
        },
        {
          "title": "Título do Gráfico 2",
          "type": "horizontalBar",
          "labels": ["Categoria A", "Categoria B", "Categoria C", "Categoria D", "Categoria E", "Categoria F"],
          "datasets": [
            { "label": "Métrica Principal", "data": [312, 268, 241, 197, 154, 98] }
          ]
        }
      ],
      "tables": [
        {
          "title": "Título da Tabela",
          "columns": ["Coluna 1", "Coluna 2", "Coluna 3", "Coluna 4", "Status"],
          "rows": [
            ["Valor A1", "Valor B1", "Valor C1", "Valor D1", "Ativo"],
            ["Valor A2", "Valor B2", "Valor C2", "Valor D2", "Pendente"],
            ["Valor A3", "Valor B3", "Valor C3", "Valor D3", "Ativo"],
            ["Valor A4", "Valor B4", "Valor C4", "Valor D4", "Inativo"],
            ["Valor A5", "Valor B5", "Valor C5", "Valor D5", "Ativo"],
            ["Valor A6", "Valor B6", "Valor C6", "Valor D6", "Pendente"]
          ]
        }
      ]
    }
  ]
}

Crie exatamente 5 abas relevantes para o segmento "${answers.segmento}".
Use dados brasileiros realistas (moeda em R$, datas em pt-BR, nomes brasileiros nas tabelas).
Os valores devem ser plausíveis para um negócio real.
trend deve ser "up", "down" ou "neutral".
type dos charts deve ser "bar", "horizontalBar", "line", "area", "pie" ou "doughnut".
Para pie/doughnut, use apenas 1 dataset com 2 ou 3 itens.

${REGRAS_VISUALIZACAO}`

  const models = ['gemini-2.5-pro', 'gemini-2.5-flash']
  const body = JSON.stringify({
    systemInstruction: {
      parts: [{ text: 'Você é um especialista em business intelligence. Gere dados fictícios realistas para dashboards brasileiros. Retorne APENAS JSON válido, sem markdown, sem código, sem explicações.' }],
    },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  })

  let text: string | undefined
  let lastError = ''

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}) as Record<string, unknown>) as { error?: { message?: string } }
      lastError = err.error?.message ?? `Gemini: HTTP ${response.status}`
      if (response.status === 503 || response.status === 429) continue
      throw new Error(lastError)
    }

    const result = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    text = result.candidates?.[0]?.content?.parts?.[0]?.text
    break
  }

  if (!text) throw new Error(lastError || 'Resposta inválida do Gemini')

  try {
    const cleaned = cleanJSON(text)
    return JSON.parse(cleaned) as DashboardData
  } catch {
    throw new Error('Não foi possível processar os dados gerados. Tente novamente.')
  }
}
