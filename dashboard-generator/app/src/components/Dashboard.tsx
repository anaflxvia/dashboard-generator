import { useState, useMemo, useEffect, type CSSProperties } from 'react'
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
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import type { DashboardData, DashboardTab, ChartConfig } from '../types'
import { type Brand, type Modo, type Tokens, derivarTokens, cssVars, carregarFonte, siglaMarca } from '../lib/brand'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const SIDEBAR_ICONS = [
  // BarChart
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>,
  // TrendingUp
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>,
  // Users
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>,
  // DocumentText
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>,
  // Cog
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
]

const DATE_FILTERS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 90 dias', 'Este ano', 'Personalizado']

/* cores dos graficos vem dos tokens da marca; textos usam tokens de texto, nunca a cor da serie */
function getChartOptions(type: string, t: Tokens, fonte: string) {
  const isArc = type === 'pie' || type === 'doughnut'
  const font = { family: `'${fonte}', Arial, sans-serif`, size: 11 }
  return {
    responsive: true,
    maintainAspectRatio: false,
    ...(type === 'line' && { interaction: { mode: 'index' as const, intersect: false } }),
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: t['text-2'], font: { ...font, size: 12 }, padding: 16, boxWidth: 8, boxHeight: 8, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t['border-strong'],
        borderWidth: 1,
        titleColor: t.text,
        bodyColor: t['text-2'],
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        titleFont: font,
        bodyFont: font,
      },
    },
    ...(!isArc && {
      scales: {
        x: {
          ticks: { color: t.muted, font },
          grid: { display: false },
          border: { color: t['border-strong'] },
        },
        y: {
          ticks: { color: t.muted, font },
          grid: { color: t.grid },
          border: { display: false },
        },
      },
    }),
  }
}

function buildChartData(chart: ChartConfig, t: Tokens) {
  const isArc = chart.type === 'pie' || chart.type === 'doughnut'
  const cor = (i: number) => t.series[i % t.series.length]

  if (isArc) {
    return {
      labels: chart.labels,
      datasets: chart.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.data.map((_, i) => cor(i)),
        borderColor: t.surface,
        borderWidth: 2,
        hoverOffset: 6,
      })),
    }
  }

  return {
    labels: chart.labels,
    datasets: chart.datasets.map((ds, idx) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: chart.type === 'bar' ? cor(idx) : cor(idx) + '22',
      borderColor: cor(idx),
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: chart.type === 'line' ? 5 : 0,
      pointBackgroundColor: cor(idx),
      pointHoverBorderColor: t.surface,
      pointHoverBorderWidth: 2,
      tension: 0.3,
      fill: chart.type === 'line' && chart.datasets.length === 1,
      // so a ponta da barra e arredondada: a base fica reta no eixo (borderSkipped padrao)
      borderRadius: chart.type === 'bar' ? 4 : 0,
      maxBarThickness: 40,
    })),
  }
}

function ChartRenderer({ chart, tokens, fonte }: { chart: ChartConfig; tokens: Tokens; fonte: string }) {
  const data = useMemo(() => buildChartData(chart, tokens), [chart, tokens])
  const options = useMemo(() => getChartOptions(chart.type, tokens, fonte), [chart.type, tokens, fonte])

  return (
    <div className="h-56">
      {chart.type === 'bar' && <Bar data={data} options={options} />}
      {chart.type === 'line' && <Line data={data} options={options} />}
      {chart.type === 'pie' && <Pie data={data} options={options} />}
      {chart.type === 'doughnut' && <Doughnut data={data} options={options} />}
    </div>
  )
}

/* a seta mostra a direcao da mudanca; a cor mostra se ela e favoravel ao indicador */
function KPICard({ kpi }: { kpi: DashboardTab['kpis'][0] }) {
  const isUp = kpi.trend === 'up'
  const isDown = kpi.trend === 'down'
  const goodWhen = kpi.goodWhen ?? 'up'
  const favoravel = (isUp && goodWhen === 'up') || (isDown && goodWhen === 'down')
  const cor = kpi.trend === 'neutral' ? 'text-[var(--muted)]' : favoravel ? 'text-[var(--success)]' : 'text-[var(--danger)]'

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-strong)] transition-colors">
      <p className="text-[var(--muted)] text-xs font-semibold uppercase tracking-wide">{kpi.label}</p>
      <p className="text-[28px] leading-tight font-bold text-[var(--text)] mt-2 mb-3 tabular-nums">{kpi.value}</p>
      <div className={`flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-semibold ${cor}`}>
        {isUp && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        )}
        {isDown && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        )}
        <span className="whitespace-nowrap">{kpi.change}</span>
        <span className="text-[var(--muted)] font-normal whitespace-nowrap">vs período anterior</span>
      </div>
    </div>
  )
}

const STATUS_BADGE: { valores: string[]; cor: string; icone: string }[] = [
  { valores: ['Ativo', 'Concluído', 'Aprovado', 'Pago', 'No prazo'], cor: 'success', icone: '✓' },
  { valores: ['Inativo', 'Cancelado', 'Reprovado', 'Atrasado', 'Crítico'], cor: 'danger', icone: '✕' },
  { valores: ['Pendente', 'Em andamento', 'Em análise', 'Em risco', 'Atenção'], cor: 'warning', icone: '!' },
]

function Celula({ valor }: { valor: string }) {
  const s = STATUS_BADGE.find((b) => b.valores.includes(valor))
  if (!s) return <>{valor}</>
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `color-mix(in srgb, var(--${s.cor}) 14%, transparent)`, color: `var(--${s.cor})` }}
    >
      <span className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px]" style={{ background: `var(--${s.cor})`, color: 'var(--surface)' }}>{s.icone}</span>
      {valor}
    </span>
  )
}

interface Props {
  data: DashboardData
  onBack: () => void
  fromCache?: boolean
  brand: Brand
  /* modo previa: altura fixa e tema controlado de fora */
  embedded?: boolean
  modo?: Modo
}

export default function Dashboard({ data, onBack, fromCache = false, brand, embedded = false, modo }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [dateFilter, setDateFilter] = useState('Últimos 30 dias')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modoLocal, setModoLocal] = useState<Modo>(brand.ativo ? brand.tema : 'dark')
  const modoAtual = modo ?? modoLocal

  const fonte = brand.ativo ? brand.fonte : 'Inter'
  useEffect(() => { carregarFonte(fonte) }, [fonte])

  const tokens = useMemo(() => derivarTokens(brand, modoAtual), [brand, modoAtual])
  const estilo = useMemo(() => ({ ...cssVars(tokens, fonte), fontFamily: 'var(--font)', colorScheme: modoAtual }) as CSSProperties, [tokens, fonte, modoAtual])

  const tab = data.tabs[activeTab] ?? data.tabs[0]
  const nomeMarca = brand.ativo && brand.nome.trim() ? brand.nome.trim() : data.title
  const logo = brand.ativo ? brand.logo : ''

  return (
    <div
      data-theme={modoAtual}
      style={estilo}
      className={`flex ${embedded ? 'h-[720px] rounded-xl border border-[var(--border-strong)]' : 'h-screen'} bg-[var(--bg)] text-[var(--text)] overflow-hidden transition-colors`}
    >
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] min-h-[65px]">
          {logo ? (
            <img src={logo} alt={nomeMarca} className={`${sidebarOpen ? 'max-w-[120px]' : 'max-w-8'} max-h-8 object-contain shrink-0`} />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-xs font-bold shrink-0">
              {brand.ativo ? siglaMarca(nomeMarca) : 'AI'}
            </div>
          )}
          {sidebarOpen && !(logo && brand.nome.trim()) && (
            <span className="font-semibold text-sm truncate">{nomeMarca}</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {data.tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              title={t.name}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors border-l-[3px] ${
                i === activeTab
                  ? 'bg-[var(--primary-soft)] text-[var(--text)] font-semibold border-[var(--primary)]'
                  : 'text-[var(--text-2)] border-transparent hover:text-[var(--text)] hover:bg-[var(--hover)]'
              }`}
            >
              <span className="shrink-0">{SIDEBAR_ICONS[i % SIDEBAR_ICONS.length]}</span>
              {sidebarOpen && <span className="truncate text-left">{t.name}</span>}
            </button>
          ))}
        </nav>

        {/* Back button */}
        <div className="p-2 border-t border-[var(--border)]">
          <button
            onClick={onBack}
            title="Novo dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {sidebarOpen && <span>{embedded ? 'Voltar' : 'Novo dashboard'}</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center gap-4 px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Recolher menu"
            className="text-[var(--text-2)] hover:text-[var(--text)] transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[var(--muted)] text-sm hidden sm:block">{data.segment}</span>
            <span className="text-[var(--muted)] hidden sm:block">/</span>
            <h2 className="font-semibold text-sm truncate">{tab.name}</h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Cache badge */}
            {fromCache && (
              <span
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ color: 'var(--success)', background: 'color-mix(in srgb, var(--success) 14%, transparent)' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Recuperado do cache
              </span>
            )}

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filtro demonstrativo: os dados gerados nao sao recalculados"
              className="bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text)] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
            >
              {DATE_FILTERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Tema claro/escuro */}
            {!modo && (
              <button
                onClick={() => setModoLocal(modoAtual === 'dark' ? 'light' : 'dark')}
                aria-label={modoAtual === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
                title={modoAtual === 'dark' ? 'Tema claro' : 'Tema escuro'}
                className="p-1.5 text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--hover)] border border-[var(--border-strong)] rounded-lg transition-colors"
              >
                {modoAtual === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
                )}
              </button>
            )}

            {/* Export */}
            <button className="flex items-center gap-1.5 bg-[var(--primary)] text-[var(--on-primary)] hover:brightness-110 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="@container flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary banner */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
            <p className="text-[var(--text-2)] text-sm">{data.summary}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4 gap-4">
            {tab.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} />
            ))}
          </div>

          {/* Charts */}
          {tab.charts.length > 0 && (
            <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-4">
              {tab.charts.map((chart, i) => (
                <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                  <h3 className="font-semibold text-sm mb-4">{chart.title}</h3>
                  <ChartRenderer chart={chart} tokens={tokens} fonte={fonte} />
                </div>
              ))}
            </div>
          )}

          {/* Tables */}
          {tab.tables.map((table, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold text-sm">{table.title}</h3>
                <span className="text-[var(--muted)] text-xs">{table.rows.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full tabular-nums">
                  <thead>
                    <tr className="border-b border-[var(--border-strong)]">
                      {table.columns.map((col, j) => (
                        <th
                          key={j}
                          className="text-left px-5 py-3 text-[var(--muted)] text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-5 py-3 text-[var(--text-2)] text-sm whitespace-nowrap">
                            <Celula valor={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
