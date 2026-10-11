export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

export interface UserAnswers {
  segmento: string
  objetivo: string
  decisao: string
  comparacoes: string
  metricas: string
}

export interface KPI {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral' // direcao da mudanca
  goodWhen?: 'up' | 'down' // sentido favoravel: custo, tempo e atraso sao 'down'
  icon?: string // nome de icone da lista ICON_NAMES (lib/icons.ts)
  sparkline?: number[] // historico recente; opcional (dashboards antigos do cache nao tem)
}

export interface ChartDataset {
  label: string
  data: number[]
}

export type ChartType =
  | 'bar'
  | 'horizontalBar'
  | 'stackedBar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'waterfall'
  | 'bullet'
  | 'funnel'
  | 'heatmap'
  | 'mapUF'
  | 'routeMap'

// trecho do mapa de rotas: origem e destino sao siglas de UF
export interface RouteLink {
  from: string
  to: string
  value: number
}

export interface ChartConfig {
  title: string
  subtitle?: string
  type: ChartType
  labels: string[]
  datasets: ChartDataset[]
  routes?: RouteLink[] // so no routeMap
  unit?: string // "R$", "%", "km", "viagens"... usado em tooltips, legendas e rotulos
  span?: 1 | 2 // 2 = ocupa a linha inteira da grade
  goodWhen?: 'up' | 'down' // cascata: em custos, queda e ganho (verde)
}

export interface TableData {
  title: string
  columns: string[]
  rows: string[][]
}

export interface DashboardTab {
  name: string
  description?: string // uma frase sob o titulo da aba
  icon?: string
  kpis: KPI[]
  charts: ChartConfig[]
  tables: TableData[]
}

// filtro de dimensao: as opcoes aparecem como rotulos em graficos ou celulas de tabelas
export interface DimensionFilter {
  label: string // ex.: "Canal"
  options: string[] // ex.: ["Inbound", "Outbound", "Parceiros"]
}

export interface DashboardData {
  version?: number // versao do formato; o cache ignora dashboards de versoes antigas
  generatedAt?: string // ISO; mostrado como "Atualizado em"
  filters?: DimensionFilter[]
  title: string
  segment: string
  summary: string
  tabs: DashboardTab[]
}
