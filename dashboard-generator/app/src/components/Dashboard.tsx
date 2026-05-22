import { useState, useMemo } from 'react'
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

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899',
]

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

function getChartOptions(type: string) {
  const isArc = type === 'pie' || type === 'doughnut'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 12 }, padding: 16, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      },
    },
    ...(!isArc && {
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { size: 11 } },
          grid: { color: '#1e293b' },
          border: { color: '#334155' },
        },
        y: {
          ticks: { color: '#94a3b8', font: { size: 11 } },
          grid: { color: '#1e293b' },
          border: { color: '#334155' },
        },
      },
    }),
  }
}

function buildChartData(chart: ChartConfig) {
  const isArc = chart.type === 'pie' || chart.type === 'doughnut'

  if (isArc) {
    return {
      labels: chart.labels,
      datasets: chart.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: CHART_COLORS.slice(0, ds.data.length).map((c) => c + 'cc'),
        borderColor: CHART_COLORS.slice(0, ds.data.length),
        borderWidth: 1,
      })),
    }
  }

  return {
    labels: chart.labels,
    datasets: chart.datasets.map((ds, idx) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: chart.type === 'bar'
        ? CHART_COLORS[idx % CHART_COLORS.length] + '99'
        : CHART_COLORS[idx % CHART_COLORS.length] + '22',
      borderColor: CHART_COLORS[idx % CHART_COLORS.length],
      borderWidth: 2,
      pointRadius: chart.type === 'line' ? 4 : 0,
      pointBackgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
      tension: 0.4,
      fill: chart.type === 'line',
      borderRadius: chart.type === 'bar' ? 4 : 0,
    })),
  }
}

function ChartRenderer({ chart }: { chart: ChartConfig }) {
  const data = useMemo(() => buildChartData(chart), [chart])
  const options = useMemo(() => getChartOptions(chart.type), [chart.type])

  return (
    <div className="h-56">
      {chart.type === 'bar' && <Bar data={data} options={options} />}
      {chart.type === 'line' && <Line data={data} options={options} />}
      {chart.type === 'pie' && <Pie data={data} options={options} />}
      {chart.type === 'doughnut' && <Doughnut data={data} options={options} />}
    </div>
  )
}

function KPICard({ kpi }: { kpi: DashboardTab['kpis'][0] }) {
  const isUp = kpi.trend === 'up'
  const isDown = kpi.trend === 'down'

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{kpi.label}</p>
      <p className="text-2xl font-bold text-white mt-2 mb-3">{kpi.value}</p>
      <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
        {isUp && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        )}
        {isDown && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        )}
        <span>{kpi.change} vs período anterior</span>
      </div>
    </div>
  )
}

interface Props {
  data: DashboardData
  onBack: () => void
  fromCache?: boolean
}

export default function Dashboard({ data, onBack, fromCache = false }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [dateFilter, setDateFilter] = useState('Últimos 30 dias')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const tab = data.tabs[activeTab] ?? data.tabs[0]

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            AI
          </div>
          {sidebarOpen && (
            <span className="text-white font-semibold text-sm truncate">{data.title}</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {data.tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              title={t.name}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                i === activeTab
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{SIDEBAR_ICONS[i % SIDEBAR_ICONS.length]}</span>
              {sidebarOpen && <span className="truncate text-left">{t.name}</span>}
            </button>
          ))}
        </nav>

        {/* Back button */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={onBack}
            title="Novo dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {sidebarOpen && <span>Novo dashboard</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center gap-4 px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-500 text-sm hidden sm:block">{data.segment}</span>
            <span className="text-slate-600 hidden sm:block">/</span>
            <h2 className="text-white font-medium text-sm truncate">{tab.name}</h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Cache badge */}
            {fromCache && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Dashboard recuperado do cache
              </span>
            )}

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {DATE_FILTERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Refresh */}
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            {/* Export */}
            <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
          {/* Summary banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
            <p className="text-slate-400 text-sm">{data.summary}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tab.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} />
            ))}
          </div>

          {/* Charts */}
          {tab.charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tab.charts.map((chart, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-slate-200 font-medium text-sm mb-4">{chart.title}</h3>
                  <ChartRenderer chart={chart} />
                </div>
              ))}
            </div>
          )}

          {/* Tables */}
          {tab.tables.map((table, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-slate-200 font-medium text-sm">{table.title}</h3>
                <span className="text-slate-500 text-xs">{table.rows.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {table.columns.map((col, j) => (
                        <th
                          key={j}
                          className="text-left px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-5 py-3 text-slate-300 text-sm whitespace-nowrap">
                            {/* Color-code common status values */}
                            {['Ativo', 'Concluído', 'Aprovado', 'Pago'].includes(cell) ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
                                {cell}
                              </span>
                            ) : ['Inativo', 'Cancelado', 'Reprovado', 'Atrasado'].includes(cell) ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-red-900/40 text-red-400 border border-red-800/50">
                                {cell}
                              </span>
                            ) : ['Pendente', 'Em andamento', 'Em análise'].includes(cell) ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-amber-900/40 text-amber-400 border border-amber-800/50">
                                {cell}
                              </span>
                            ) : (
                              cell
                            )}
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
