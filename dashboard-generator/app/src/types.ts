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
  trend: 'up' | 'down' | 'neutral'
  sparkline?: number[] // historico recente; opcional (dashboards antigos do cache nao tem)
}

export interface ChartDataset {
  label: string
  data: number[]
}

export interface ChartConfig {
  title: string
  type: 'bar' | 'horizontalBar' | 'line' | 'area' | 'pie' | 'doughnut'
  labels: string[]
  datasets: ChartDataset[]
}

export interface TableData {
  title: string
  columns: string[]
  rows: string[][]
}

export interface DashboardTab {
  name: string
  kpis: KPI[]
  charts: ChartConfig[]
  tables: TableData[]
}

export interface DashboardData {
  title: string
  segment: string
  summary: string
  tabs: DashboardTab[]
}
