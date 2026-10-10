import type { DashboardData, UserAnswers } from '../types'

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
        { "label": "Nome do KPI", "value": "1.234", "change": "+12,3%", "trend": "up", "goodWhen": "up" },
        { "label": "Nome do KPI", "value": "R$ 45.2K", "change": "-3,1%", "trend": "down", "goodWhen": "down" },
        { "label": "Nome do KPI", "value": "98,5%", "change": "+0,5%", "trend": "up", "goodWhen": "up" },
        { "label": "Nome do KPI", "value": "234", "change": "0,0%", "trend": "neutral", "goodWhen": "up" }
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
          "type": "line",
          "labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
          "datasets": [
            { "label": "Métrica Principal", "data": [85, 92, 88, 96] }
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
trend deve ser "up", "down" ou "neutral" (direcao da mudanca).
goodWhen indica o sentido favoravel do KPI: "up" quando maior e melhor (receita, conversao, OTIF), "down" quando menor e melhor (custo, tempo, atraso, churn, inadimplencia).
type dos charts deve ser "bar", "line", "pie" ou "doughnut".
Para pie/doughnut, use apenas 1 dataset com 5-7 itens.`

  // gemini-2.5-* deixou de aceitar chaves novas; 3.6 Flash fica como reserva
  const models = ['gemini-3.8-flash', 'gemini-3.6-flash']
  const body = JSON.stringify({
    systemInstruction: {
      parts: [{ text: 'Você é um especialista em business intelligence. Gere dados fictícios realistas para dashboards brasileiros. Retorne APENAS JSON válido, sem markdown, sem código, sem explicações.' }],
    },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      // o raciocinio consome tokens de saida: limite folgado e thinking baixo evitam JSON cortado
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingLevel: 'low' },
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
      const modeloIndisponivel = response.status === 404 || /not found|no longer available|not supported/i.test(lastError)
      if (response.status === 503 || response.status === 429 || modeloIndisponivel) continue
      throw new Error(lastError)
    }

    const result = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>
    }
    text = (result.candidates?.[0]?.content?.parts ?? []).filter(p => p.text && !p.thought).map(p => p.text).join('') || undefined
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
