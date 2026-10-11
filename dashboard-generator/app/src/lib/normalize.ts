import type { ChartConfig, ChartType, DashboardData, DashboardTab, KPI } from '../types'
import { acharEstado } from './brasil'

// Versao do formato do JSON. Sobe quando o prompt passa a gerar campos novos,
// para o cache semantico nao devolver dashboards no formato antigo.
export const SCHEMA_VERSION = 2

const TIPOS: ChartType[] = [
  'bar', 'horizontalBar', 'stackedBar', 'line', 'area', 'pie', 'doughnut',
  'waterfall', 'bullet', 'funnel', 'heatmap', 'mapUF', 'routeMap',
]

// KPIs em que cair e bom, quando a IA nao manda goodWhen
const MENOR_E_MELHOR = /custo|despesa|gasto|tempo|prazo m[eé]dio|atraso|churn|turnover|evas[aã]o|inadimpl|erro|incidente|backlog|lat[eê]ncia|mttr|absente[ií]smo|devolu|ocios|risco|provis/i

const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function normalizarKpi(k: KPI): KPI {
  return {
    ...k,
    trend: k.trend === 'up' || k.trend === 'down' ? k.trend : 'neutral',
    goodWhen: k.goodWhen === 'up' || k.goodWhen === 'down' ? k.goodWhen : MENOR_E_MELHOR.test(k.label) ? 'down' : 'up',
    sparkline: Array.isArray(k.sparkline) ? k.sparkline.map(num) : undefined,
  }
}

// Garante que cada grafico tem o que o componente precisa; se nao tiver, converte para
// um tipo que funcione com os dados (ou descarta). Nao depende da IA obedecer o prompt.
function normalizarGrafico(c: ChartConfig): ChartConfig | null {
  const labels = Array.isArray(c.labels) ? c.labels.map(String) : []
  const datasets = (Array.isArray(c.datasets) ? c.datasets : []).map((d) => ({
    label: String(d.label ?? ''),
    data: labels.map((_, i) => num(d.data?.[i])),
  }))
  let chart: ChartConfig = { ...c, type: TIPOS.includes(c.type) ? c.type : 'bar', labels, datasets }

  switch (chart.type) {
    case 'routeMap': {
      const routes = (c.routes ?? [])
        .map((r) => ({ from: acharEstado(r.from)?.uf ?? '', to: acharEstado(r.to)?.uf ?? '', value: num(r.value) }))
        .filter((r) => r.from && r.to && r.from !== r.to)
      return routes.length >= 2 ? { ...chart, labels: [], datasets: [], routes } : null
    }
    case 'mapUF': {
      const validos = labels.filter((l) => acharEstado(l)).length
      if (validos < 3) chart = { ...chart, type: 'horizontalBar' }
      break
    }
    case 'pie':
    case 'doughnut':
      // pizza/rosca so com 2 ou 3 fatias; com mais, ranking ordenado
      if (labels.length > 3) chart = { ...chart, type: 'horizontalBar', datasets: datasets.slice(0, 1) }
      break
    case 'bullet':
      if (datasets.length < 2) chart = { ...chart, type: 'horizontalBar' }
      break
  }

  if (chart.type !== 'routeMap' && (labels.length === 0 || datasets.length === 0)) return null
  return chart
}

function normalizarAba(t: DashboardTab): DashboardTab {
  return {
    ...t,
    kpis: (t.kpis ?? []).map(normalizarKpi),
    charts: (t.charts ?? []).map(normalizarGrafico).filter((c): c is ChartConfig => c !== null),
    tables: t.tables ?? [],
  }
}

export function normalizarDashboard(d: DashboardData): DashboardData {
  const filters = (Array.isArray(d.filters) ? d.filters : [])
    .filter((f) => f && typeof f.label === 'string' && Array.isArray(f.options))
    .map((f) => ({ label: f.label, options: f.options.map(String) }))
  return { ...d, version: SCHEMA_VERSION, filters, tabs: (d.tabs ?? []).map(normalizarAba) }
}
