import type { ChartConfig, DashboardData, TableData } from '../types'
import { acharEstado } from './brasil'

// Filtros do cabecalho. Os dados sao gerados ja agregados, entao o filtro recorta o que esta
// desenhado (periodos, UFs/regioes, categorias) em vez de recalcular. Os KPIs nao mudam.

export interface FiltrosAtivos {
  periodo: number | null // ultimos N pontos das series temporais
  regiao: string | null
  dimensoes: Record<string, string> // rotulo do filtro -> opcao escolhida
}

export const SEM_FILTROS: FiltrosAtivos = { periodo: null, regiao: null, dimensoes: {} }

export const temFiltro = (f: FiltrosAtivos) => f.periodo !== null || f.regiao !== null || Object.keys(f.dimensoes).length > 0

/* ── Regioes ── */

export const REGIOES: Record<string, string[]> = {
  'Norte': ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
  'Sul': ['PR', 'RS', 'SC'],
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const NOME_REGIAO = new Map(Object.keys(REGIOES).map((r) => [semAcento(r), r]))

function regiaoDaUF(uf: string): string | null {
  for (const [r, ufs] of Object.entries(REGIOES)) if (ufs.includes(uf)) return r
  return null
}

// "SP", "São Paulo", "Nordeste", "Belém - PA" -> regiao; o resto -> null
function regiaoDoTexto(texto: string): string | null {
  const t = texto.trim()
  const r = NOME_REGIAO.get(semAcento(t))
  if (r) return r
  const e = t.length <= 25 ? acharEstado(t) : undefined
  if (e) return regiaoDaUF(e.uf)
  const uf = t.match(/[-–/,]\s*([A-Z]{2})$/)?.[1] // "Belém - PA"
  return uf ? regiaoDaUF(uf) : null
}

const maioria = (itens: string[], teste: (s: string) => boolean) =>
  itens.length > 0 && itens.filter(teste).length / itens.length >= 0.6

/* ── Periodo ── */

const MES = /^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?(\s*\/?\s*\d{2,4})?$/i
const TEMPO = [
  MES,
  /^[1-4]\s?T\s?(\d{2}|\d{4})?$/i, // 1T26, 3T
  /^Q[1-4](\s?\d{2,4})?$/i,
  /^(19|20)\d{2}$/,
  /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/,
  /^(sem(ana)?|s)\.?\s?\d{1,2}$/i,
  /^\d{1,2}h$/i,
]
const ehTempo = (l: string) => TEMPO.some((re) => re.test(l.trim()))

export function serieTemporal(c: ChartConfig): boolean {
  return ['line', 'area', 'bar', 'stackedBar'].includes(c.type) && c.labels.length >= 4 && maioria(c.labels, ehTempo)
}

/* ── O que cada filtro alcanca ── */

export interface OpcoesFiltro {
  periodos: Array<{ valor: number; rotulo: string }>
  regioes: string[]
  dimensoes: Array<{ label: string; options: string[] }>
}

function graficoGeografico(c: ChartConfig) {
  if (c.type === 'mapUF' || c.type === 'routeMap') return true
  return maioria(c.labels, (l) => !!regiaoDoTexto(l)) || maioria(c.datasets.map((d) => d.label), (l) => !!regiaoDoTexto(l))
}

function tabelaColunaGeo(t: TableData): number {
  return t.columns.findIndex((_, j) => maioria(t.rows.map((r) => r[j] ?? ''), (v) => !!regiaoDoTexto(v)))
}

export function opcoesDisponiveis(data: DashboardData): OpcoesFiltro {
  const charts = data.tabs.flatMap((t) => t.charts)
  const tabelas = data.tabs.flatMap((t) => t.tables)

  const temporais = charts.filter(serieTemporal)
  const maior = Math.max(0, ...temporais.map((c) => c.labels.length))
  const meses = temporais.length > 0 && maioria(temporais.flatMap((c) => c.labels), (l) => MES.test(l.trim()))
  const unidade = meses ? 'meses' : 'períodos'
  const periodos = [3, 6, 12].filter((n) => n < maior).map((n) => ({ valor: n, rotulo: `Últimos ${n} ${unidade}` }))

  const presentes = new Set<string>()
  for (const c of charts) {
    if (c.type === 'mapUF') c.labels.forEach((l) => { const r = regiaoDoTexto(l); if (r) presentes.add(r) })
    else if (c.type === 'routeMap') (c.routes ?? []).forEach((rt) => [rt.from, rt.to].forEach((uf) => { const r = regiaoDaUF(uf); if (r) presentes.add(r) }))
    else if (graficoGeografico(c)) [...c.labels, ...c.datasets.map((d) => d.label)].forEach((l) => { const r = regiaoDoTexto(l); if (r) presentes.add(r) })
  }
  for (const t of tabelas) {
    const j = tabelaColunaGeo(t)
    if (j >= 0) t.rows.forEach((r) => { const g = regiaoDoTexto(r[j] ?? ''); if (g) presentes.add(g) })
  }
  const regioes = Object.keys(REGIOES).filter((r) => presentes.has(r))

  // filtro de dimensao so entra se alguma opcao aparece em grafico ou tabela
  const dimensoes = (data.filters ?? [])
    .map((f) => ({ label: f.label, options: [...new Set(f.options.map(String))] }))
    .filter((f) => f.options.length >= 2 && (charts.some((c) => indiceDimensao(c, f.options) !== 'nenhum') || tabelas.some((t) => colunaDimensao(t, f.options) >= 0)))
    .slice(0, 3)

  return { periodos, regioes: regioes.length >= 2 ? regioes : [], dimensoes }
}

/* ── Aplicacao ── */

function indiceDimensao(c: ChartConfig, options: string[]): 'labels' | 'datasets' | 'nenhum' {
  const set = new Set(options.map(semAcento))
  const conta = (xs: string[]) => xs.filter((x) => set.has(semAcento(x))).length
  if (conta(c.labels) >= 2) return 'labels'
  if (conta(c.datasets.map((d) => d.label)) >= 2) return 'datasets'
  return 'nenhum'
}

function colunaDimensao(t: TableData, options: string[]): number {
  const set = new Set(options.map(semAcento))
  return t.columns.findIndex((_, j) => maioria(t.rows.map((r) => r[j] ?? ''), (v) => set.has(semAcento(v))))
}

function manterRotulos(c: ChartConfig, manter: (label: string) => boolean): ChartConfig {
  const idx = c.labels.map((l, i) => (manter(l) ? i : -1)).filter((i) => i >= 0)
  return { ...c, labels: idx.map((i) => c.labels[i]), datasets: c.datasets.map((d) => ({ ...d, data: idx.map((i) => d.data[i]) })) }
}

export interface GraficoFiltrado {
  chart: ChartConfig
  filtrado: boolean // algum filtro mudou este grafico
  vazio: boolean // o filtro nao deixou nada para desenhar
}

export function filtrarGrafico(original: ChartConfig, f: FiltrosAtivos, opcoes: OpcoesFiltro): GraficoFiltrado {
  let c = original
  // cascata e funil sao decomposicoes / etapas: recortar quebraria a leitura
  if (c.type === 'waterfall' || c.type === 'funnel') return { chart: c, filtrado: false, vazio: false }

  if (f.periodo && serieTemporal(c) && c.labels.length > f.periodo) {
    const n = f.periodo
    c = { ...c, labels: c.labels.slice(-n), datasets: c.datasets.map((d) => ({ ...d, data: d.data.slice(-n) })) }
  }

  if (f.regiao) {
    const naRegiao = (texto: string) => regiaoDoTexto(texto) === f.regiao
    if (c.type === 'routeMap') {
      c = { ...c, routes: (c.routes ?? []).filter((r) => regiaoDaUF(r.from) === f.regiao || regiaoDaUF(r.to) === f.regiao) }
    } else if (c.type === 'mapUF' || maioria(c.labels, (l) => !!regiaoDoTexto(l))) {
      c = manterRotulos(c, naRegiao)
    } else if (maioria(c.datasets.map((d) => d.label), (l) => !!regiaoDoTexto(l))) {
      c = { ...c, datasets: c.datasets.filter((d) => naRegiao(d.label)) }
    }
  }

  for (const dim of opcoes.dimensoes) {
    const valor = f.dimensoes[dim.label]
    if (!valor) continue
    const onde = indiceDimensao(c, dim.options)
    const igual = (x: string) => semAcento(x) === semAcento(valor)
    if (onde === 'labels') c = manterRotulos(c, igual)
    else if (onde === 'datasets') c = { ...c, datasets: c.datasets.filter((d) => igual(d.label)) }
  }

  const filtrado = c !== original
  const vazio = c.type === 'routeMap' ? (c.routes ?? []).length === 0 : c.labels.length === 0 || c.datasets.length === 0
  return { chart: c, filtrado, vazio }
}

export function filtrarTabela(t: TableData, f: FiltrosAtivos, opcoes: OpcoesFiltro): TableData {
  let rows = t.rows
  if (f.regiao) {
    const j = tabelaColunaGeo(t)
    if (j >= 0) rows = rows.filter((r) => regiaoDoTexto(r[j] ?? '') === f.regiao)
  }
  for (const dim of opcoes.dimensoes) {
    const valor = f.dimensoes[dim.label]
    if (!valor) continue
    const j = colunaDimensao(t, dim.options)
    if (j >= 0) rows = rows.filter((r) => semAcento(r[j] ?? '') === semAcento(valor))
  }
  return rows === t.rows ? t : { ...t, rows }
}

/* ── Grade sem buracos ── */

// Grade de 2 colunas: um visual de meia largura que ficaria sozinho na linha (o proximo ocupa a linha
// inteira, ou ele e o ultimo) passa a ocupar a linha toda. Assim 3 visuais viram 2 + 1 largo, sem buraco.
export function completarGrade<T extends { span?: 1 | 2 }>(itens: T[]): Array<T & { span: 1 | 2 }> {
  const out: Array<T & { span: 1 | 2 }> = []
  let coluna = 0
  itens.forEach((it, i) => {
    let span: 1 | 2 = it.span === 2 ? 2 : 1
    if (span === 1 && coluna === 0) {
      const proximo = itens[i + 1]
      if (!proximo || proximo.span === 2) span = 2
    }
    if (span === 2 && coluna === 1) {
      // largo depois de um meia largura: o anterior vira largo para fechar a linha
      out[out.length - 1].span = 2
      coluna = 0
    }
    out.push({ ...it, span })
    coluna = span === 2 ? 0 : (coluna + 1) % 2
  })
  return out
}
