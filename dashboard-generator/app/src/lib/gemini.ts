import type { DashboardData, UserAnswers } from '../types'
import { CATALOGO_VISUAIS, REGRAS_VISUALIZACAO } from './dashboardGuide'
import { playbookParaPrompt } from './segmentPlaybooks'
import { normalizarDashboard } from './normalize'
import { chamarServidor } from '../services/acesso'

function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
}

export async function generateDashboard(answers: UserAnswers): Promise<DashboardData> {
  const prompt = `Gere dados de dashboard realistas e fictícios baseados no contexto abaixo.

CONTEXTO DO USUÁRIO:
Segmento: ${answers.segmento}
Objetivo: ${answers.objetivo}
Decisão estratégica: ${answers.decisao}
Comparações desejadas: ${answers.comparacoes}
Métricas importantes: ${answers.metricas}

${playbookParaPrompt(answers.segmento)}

${CATALOGO_VISUAIS}

${REGRAS_VISUALIZACAO}

FORMATO DE SAÍDA: retorne SOMENTE um JSON válido (sem markdown, sem explicações) com esta estrutura.
Os valores abaixo mostram o formato de cada campo, não o conteúdo: escolha abas, KPIs e visuais pelo segmento e pelo objetivo.
{
  "title": "Título do dashboard",
  "segment": "${answers.segmento}",
  "summary": "1 ou 2 frases com o principal insight",
  "filters": [{ "label": "Canal", "options": ["Inbound", "Outbound", "Parceiros"] }],
  "tabs": [
    {
      "name": "Nome da aba",
      "description": "Uma frase dizendo o que esta aba responde",
      "icon": "nome-do-icone",
      "kpis": [
        { "label": "Nome do KPI", "value": "R$ 3,78", "change": "-2,1%", "trend": "down", "goodWhen": "down", "icon": "nome-do-icone", "sparkline": [4.1, 4.0, 3.95, 3.9, 3.86, 3.8, 3.78] }
      ],
      "charts": [
        { "title": "Insight do gráfico", "subtitle": "O que está sendo medido", "type": "um tipo do catálogo", "unit": "R$", "labels": ["..."], "datasets": [{ "label": "...", "data": [0] }] }
      ],
      "tables": [
        { "title": "Título", "columns": ["Coluna 1", "Status"], "rows": [["Valor", "Ativo"]] }
      ]
    }
  ]
}

Crie exatamente 5 abas relevantes para o segmento e o objetivo.
Use dados brasileiros realistas (moeda em R$, números em pt-BR nos textos, nomes brasileiros nas tabelas).
Nos arrays "data", "sparkline" e "value" das rotas use números puros (ponto decimal, sem R$ nem %).
Status nas tabelas: Ativo, Concluído, Aprovado, Pago, Pendente, Em andamento, Em análise, Inativo, Cancelado, Reprovado ou Atrasado.`

  // gemini-2.5-* deixou de aceitar chaves novas; 3.6 Flash fica como reserva
  const models = ['gemini-3.8-flash', 'gemini-3.6-flash']
  const payload = {
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
  }

  let text: string | undefined
  let lastError = ''

  // 503 (alta demanda) e 429 (limite) costumam passar em segundos: tenta os dois modelos em ate 3 rodadas,
  // esperando entre elas. Modelo que nao existe mais (404) sai da lista na hora.
  const ESPERAS_MS = [0, 3000, 8000]
  let disponiveis = [...models]
  let sobrecarga = false
  for (const espera of ESPERAS_MS) {
    if (text || disponiveis.length === 0) break
    if (espera) await new Promise((r) => setTimeout(r, espera))
    sobrecarga = false
    for (const model of [...disponiveis]) {
      // a chave do Gemini fica no servidor (api/gemini.ts), que tambem confere o codigo de acesso
      const response = await chamarServidor({ kind: 'generate', model, payload })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}) as Record<string, unknown>) as { error?: { message?: string } }
        lastError = err.error?.message ?? `Gemini: HTTP ${response.status}`
        const modeloIndisponivel = response.status === 404 || /not found|no longer available|not supported/i.test(lastError)
        if (modeloIndisponivel) { disponiveis = disponiveis.filter((m) => m !== model); continue }
        if (response.status === 503 || response.status === 429) { sobrecarga = true; continue }
        throw new Error(lastError)
      }

      const result = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>
      }
      // junta todas as partes de texto, ignorando as partes de raciocinio
      text = (result.candidates?.[0]?.content?.parts ?? []).filter((p) => p.text && !p.thought).map((p) => p.text).join('') || undefined
      break
    }
  }

  if (!text && sobrecarga) {
    throw new Error('O Gemini está com alta demanda agora. Tentamos 3 vezes em cada modelo; aguarde um ou dois minutos e gere de novo.')
  }
  if (!text) throw new Error(lastError || 'Resposta inválida do Gemini')

  try {
    const cleaned = cleanJSON(text)
    // garante campos e tipos que os componentes esperam (mapa sem UF valida vira ranking etc.)
    return normalizarDashboard({ ...(JSON.parse(cleaned) as DashboardData), generatedAt: new Date().toISOString() })
  } catch {
    throw new Error('Não foi possível processar os dados gerados. Tente novamente.')
  }
}
