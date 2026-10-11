import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import type { ChartConfig } from '../../types'
import type { BrandTokens } from '../../lib/brand'
import { formatValue } from '../../lib/format'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

// as duas primeiras series usam primaria e secundaria da marca
const EXTRA_CHART_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899']

function chartColors(t: BrandTokens): string[] {
  return [t.primary, t.secondary, ...EXTRA_CHART_COLORS]
}

// ganho / perda na cascata: tons que passam contraste no fundo atual
function polaridade(t: BrandTokens) {
  return t.dark ? { ganho: '#34d399', perda: '#f87171' } : { ganho: '#047857', perda: '#b91c1c' }
}

const isArcType = (type: ChartConfig['type']) => type === 'pie' || type === 'doughnut'

// barras horizontais sao rankings: sempre ordenadas do maior para o menor (pelo 1o dataset)
function normalizeChart(chart: ChartConfig): ChartConfig {
  if (chart.type !== 'horizontalBar' || !chart.datasets[0]) return chart
  const order = chart.labels
    .map((_, i) => i)
    .sort((x, y) => (chart.datasets[0].data[y] ?? 0) - (chart.datasets[0].data[x] ?? 0))
  return {
    ...chart,
    labels: order.map((i) => chart.labels[i]),
    datasets: chart.datasets.map((ds) => ({ ...ds, data: order.map((i) => ds.data[i]) })),
  }
}

// cascata: 1o valor e o total inicial, os demais sao variacoes; o total final e calculado aqui
function waterfallData(chart: ChartConfig, t: BrandTokens) {
  const valores = chart.datasets[0]?.data ?? []
  const { ganho, perda } = polaridade(t)
  const barras: Array<[number, number]> = []
  const cores: string[] = []
  let acumulado = 0
  valores.forEach((v, i) => {
    if (i === 0) {
      barras.push([0, v])
      cores.push(t.primary)
      acumulado = v
    } else {
      barras.push([acumulado, acumulado + v])
      const bom = chart.goodWhen === 'down' ? v <= 0 : v >= 0
      cores.push(bom ? ganho : perda)
      acumulado += v
    }
  })
  barras.push([0, acumulado])
  cores.push(t.primary)
  return {
    labels: [...chart.labels.slice(0, valores.length), 'Total'].map(quebrar),
    deltas: [...valores, acumulado],
    datasets: [{ label: chart.datasets[0]?.label ?? '', data: barras, backgroundColor: cores, borderRadius: 4, borderSkipped: false }],
  }
}

function getChartOptions(chart: ChartConfig, t: BrandTokens, deltas?: number[]) {
  const isArc = isArcType(chart.type)
  const horizontal = chart.type === 'horizontalBar'
  const stacked = chart.type === 'stackedBar'
  const fmt = (v: number) => formatValue(v, chart.unit)
  // data-ink: sem bordas de eixo, grade so no eixo de valor e bem discreta
  const valueAxis = {
    // zero obrigatorio em barras e areas (cortar o eixo distorce); linhas podem focar na variacao
    beginAtZero: chart.type !== 'line',
    stacked,
    ticks: { color: t.textMuted, font: { size: 11 }, maxTicksLimit: 6, maxRotation: 0, callback: (v: number | string) => fmt(Number(v)) },
    grid: { color: t.surfaceHover },
    border: { display: false },
  }
  const categoryAxis = {
    stacked,
    // rotulos longos quebram em duas linhas em vez de girar
    ticks: { color: t.textMuted, font: { size: 11 }, maxRotation: 35, autoSkip: chart.labels.length > 8 },
    grid: { display: false },
    border: { display: false },
  }
  // cascata de variacao (deltas pequenos perto do total): o eixo parte de perto do menor nivel,
  // senao as variacoes somem. E a unica excecao a regra do zero; o eixo mostra o valor inicial.
  if (chart.type === 'waterfall' && deltas && deltas.length > 1) {
    let nivel = deltas[0]
    const niveis = [nivel]
    for (const d of deltas.slice(1, -1)) { nivel += d; niveis.push(nivel) }
    const maiorDelta = Math.max(...deltas.slice(1, -1).map(Math.abs))
    const lo = Math.min(...niveis)
    const hi = Math.max(...niveis)
    if (maiorDelta < Math.abs(hi) * 0.15) {
      const bruto = lo - (hi - lo) * 0.6 - maiorDelta
      const passo = 10 ** Math.floor(Math.log10(Math.abs(bruto) || 1) - 1) // arredonda para um valor redondo
      Object.assign(valueAxis, { beginAtZero: false, min: Math.floor(bruto / passo) * passo })
    }
  }
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: (isArc ? 'nearest' : 'index') as 'nearest' | 'index', intersect: isArc },
    ...(horizontal && { indexAxis: 'y' as const }),
    ...(chart.type === 'doughnut' && { cutout: '65%' }),
    plugins: {
      legend: {
        // com uma serie so, o titulo do grafico ja diz o que e - legenda vira tinta extra
        display: (isArc || chart.datasets.length > 1) && chart.type !== 'waterfall',
        position: 'bottom' as const,
        labels: { color: t.textMuted, font: { size: 12 }, padding: 16, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t.border,
        borderWidth: 1,
        titleColor: t.text,
        bodyColor: t.textMuted,
        callbacks: {
          label: (ctx: TooltipItem<'bar' | 'line' | 'pie' | 'doughnut'>) => {
            if (deltas) {
              const d = deltas[ctx.dataIndex]
              const ultimo = ctx.dataIndex === deltas.length - 1
              return ctx.dataIndex === 0 || ultimo ? fmt(d) : `${d >= 0 ? '+' : ''}${fmt(d)}`
            }
            const p = ctx.parsed as unknown as { x: number; y: number }
            const valor = isArc ? Number(ctx.raw) : horizontal ? p.x : p.y
            return `${ctx.dataset.label ? ctx.dataset.label + ': ' : ''}${fmt(valor)}`
          },
        },
      },
    },
    ...(!isArc && {
      scales: horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
    }),
  }
}

// "Entregues no prazo" -> ["Entregues no", "prazo"]: o Chart.js desenha cada item numa linha
function quebrar(label: string): string | string[] {
  if (label.length <= 12 || !label.includes(' ')) return label
  const palavras = label.split(' ')
  const meio = Math.ceil(palavras.length / 2)
  return [palavras.slice(0, meio).join(' '), palavras.slice(meio).join(' ')]
}

function buildChartData(chart: ChartConfig, t: BrandTokens) {
  const CHART_COLORS = chartColors(t)

  if (isArcType(chart.type)) {
    return {
      labels: chart.labels,
      datasets: chart.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: CHART_COLORS.slice(0, ds.data.length),
        borderColor: t.surface,
        borderWidth: 2,
        hoverOffset: 6,
      })),
    }
  }

  const isBar = chart.type === 'bar' || chart.type === 'horizontalBar' || chart.type === 'stackedBar'
  return {
    labels: chart.type === 'horizontalBar' ? chart.labels : chart.labels.map(quebrar),
    datasets: chart.datasets.map((ds, idx) => {
      const color = CHART_COLORS[idx % CHART_COLORS.length]
      return {
        label: ds.label,
        data: ds.data,
        backgroundColor: isBar ? color : color + (chart.datasets.length > 1 ? '1a' : '33'),
        borderColor: isBar ? t.surface : color,
        // empilhadas: 2px na cor da superficie separam os segmentos
        borderWidth: chart.type === 'stackedBar' ? { top: 2 } : isBar ? 0 : 2,
        pointRadius: 0,
        pointHoverRadius: isBar ? 0 : 4,
        pointBackgroundColor: color,
        tension: 0.35,
        fill: chart.type === 'area',
        borderRadius: isBar && chart.type !== 'stackedBar' ? 4 : 0,
        maxBarThickness: 36,
      }
    }),
  }
}

export default function ChartJsChart({ chart, tokens }: { chart: ChartConfig; tokens: BrandTokens }) {
  const normalized = useMemo(() => normalizeChart(chart), [chart])
  const wf = useMemo(() => (chart.type === 'waterfall' ? waterfallData(chart, tokens) : null), [chart, tokens])
  const data = useMemo(() => wf ?? buildChartData(normalized, tokens), [wf, normalized, tokens])
  const options = useMemo(() => getChartOptions(normalized, tokens, wf?.deltas), [normalized, tokens, wf])

  // os tipos do react-chartjs-2 nao aceitam a uniao de configuracoes montada acima
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const d = data as any
  const o = options as any
  /* eslint-enable @typescript-eslint/no-explicit-any */

  switch (chart.type) {
    case 'line':
    case 'area':
      return <Line data={d} options={o} />
    case 'pie':
      return <Pie data={d} options={o} />
    case 'doughnut':
      return <Doughnut data={d} options={o} />
    default:
      return <Bar data={d} options={o} />
  }
}
