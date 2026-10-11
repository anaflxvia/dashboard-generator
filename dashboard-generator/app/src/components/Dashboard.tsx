import { useState, useMemo } from 'react'
import type { DashboardData, DashboardTab } from '../types'
import { brandStyle, deriveTokens, mix, type Brand, type BrandTokens } from '../lib/brand'
import { resolveIcon } from '../lib/icons'
import VisualCard from './visuals/VisualCard'

// tons 400 so passam contraste em fundo escuro; em fundo claro usa os 700
const STATUS_DARK = {
  success: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  error: 'bg-red-900/40 text-red-400 border-red-800/50',
  warning: 'bg-amber-900/40 text-amber-400 border-amber-800/50',
  successText: 'text-emerald-400',
  errorText: 'text-red-400',
}
const STATUS_LIGHT = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  successText: 'text-emerald-700',
  errorText: 'text-red-700',
}
type StatusClasses = typeof STATUS_DARK

const ICONE_CONFIG = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

function TabIcon({ name, label }: { name?: string; label: string }) {
  const Icon = resolveIcon(name, label)
  return <Icon className="w-5 h-5" strokeWidth={1.8} />
}

const DATE_FILTERS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 90 dias', 'Este ano', 'Personalizado']

// linha limpa, sem eixos nem marcadores — so o contexto historico do KPI
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${26 - ((v - min) / range) * 24}`)
    .join(' ')
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-7 mt-3" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function KPICard({ kpi, status, tokens }: { kpi: DashboardTab['kpis'][0]; status: StatusClasses; tokens: BrandTokens }) {
  const Icon = resolveIcon(kpi.icon, kpi.label)
  // seta = direcao da mudanca; cor = se a mudanca e boa (custo caindo e verde)
  const favoravel = kpi.trend === 'neutral' ? null : kpi.trend === (kpi.goodWhen ?? 'up')
  const corVariacao = favoravel === null ? 'text-(--brand-muted)' : favoravel ? status.successText : status.errorText

  return (
    <div className="bg-(--brand-surface) border border-(--brand-border) rounded-xl p-5 hover:border-(--brand-muted) transition-colors flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <p className="text-(--brand-muted) text-xs font-medium uppercase tracking-wide leading-snug">{kpi.label}</p>
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: mix(tokens.primary, tokens.surface, 0.16), color: tokens.primary }}
          aria-hidden="true"
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </span>
      </div>
      <p className="text-2xl font-bold text-(--brand-text) mt-1 mb-2 tabular-nums">{kpi.value}</p>
      <div className={`flex flex-wrap items-center gap-x-1 text-xs font-medium ${corVariacao}`}>
        {kpi.trend === 'up' && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        )}
        {kpi.trend === 'down' && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        )}
        <span>{kpi.change}</span>
        <span className="text-(--brand-muted) font-normal whitespace-nowrap">vs período ant.</span>
      </div>
      {kpi.sparkline && <div className="mt-auto"><Sparkline values={kpi.sparkline} /></div>}
    </div>
  )
}

interface Props {
  data: DashboardData
  brand: Brand
  onBack: () => void
  onOpenBrand: () => void
  fromCache?: boolean
}

export default function Dashboard({ data, brand, onBack, onOpenBrand, fromCache = false }: Props) {
  const tokens = useMemo(() => deriveTokens(brand), [brand])
  const status = tokens.dark ? STATUS_DARK : STATUS_LIGHT
  const [activeTab, setActiveTab] = useState(0)
  const [dateFilter, setDateFilter] = useState('Últimos 30 dias')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const tab = data.tabs[activeTab] ?? data.tabs[0]

  return (
    <div style={brandStyle(tokens)} className="flex h-screen bg-(--brand-bg) text-(--brand-text) overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-(--brand-surface) border-r border-(--brand-border) flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-(--brand-border)">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name || 'Logo'}
              className={`h-8 object-contain shrink-0 ${sidebarOpen ? 'max-w-[140px]' : 'w-8'}`}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-(--brand-primary) flex items-center justify-center text-(--brand-on-primary) text-xs font-bold shrink-0">
              AI
            </div>
          )}
          {sidebarOpen && !brand.logo && (
            <span className="text-(--brand-text) font-semibold text-sm truncate">{brand.name || data.title}</span>
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
                  ? 'bg-(--brand-primary) text-(--brand-on-primary)'
                  : 'text-(--brand-muted) hover:text-(--brand-text) hover:bg-(--brand-surface-hover)'
              }`}
            >
              <span className="shrink-0"><TabIcon name={t.icon} label={t.name} /></span>
              {sidebarOpen && <span className="truncate text-left">{t.name}</span>}
            </button>
          ))}
        </nav>

        {/* Back button */}
        <div className="p-2 border-t border-(--brand-border) space-y-1">
          <button
            onClick={onOpenBrand}
            title="Identidade visual"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-(--brand-muted) hover:text-(--brand-text) hover:bg-(--brand-surface-hover) transition-colors"
          >
            <span className="shrink-0">{ICONE_CONFIG}</span>
            {sidebarOpen && <span>Identidade visual</span>}
          </button>
          <button
            onClick={onBack}
            title="Novo dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-(--brand-muted) hover:text-(--brand-text) hover:bg-(--brand-surface-hover) transition-colors"
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
        <header className="h-14 bg-(--brand-surface) border-b border-(--brand-border) flex items-center gap-4 px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-(--brand-muted) hover:text-(--brand-text) transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-(--brand-muted) text-sm hidden sm:block">{data.segment}</span>
            <span className="text-(--brand-muted) hidden sm:block">/</span>
            <h2 className="text-(--brand-text) font-medium text-sm truncate">{tab.name}</h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Cache badge */}
            {fromCache && (
              <span className={`flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-full ${status.success}`}>
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
              className="bg-(--brand-surface) border border-(--brand-border) text-(--brand-text) text-xs rounded-lg px-3 py-1.5 outline-none focus:border-(--brand-primary) transition-colors cursor-pointer"
            >
              {DATE_FILTERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Refresh */}
            <button className="p-1.5 text-(--brand-muted) hover:text-(--brand-text) hover:bg-(--brand-surface-hover) rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            {/* Export */}
            <button className="flex items-center gap-1.5 bg-(--brand-primary) hover:opacity-90 text-(--brand-on-primary) text-xs px-3 py-1.5 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-(--brand-bg) p-6 space-y-6">
          {/* Summary banner */}
          <div className="bg-(--brand-surface) border border-(--brand-border) rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-(--brand-primary) shrink-0" />
            <p className="text-(--brand-muted) text-sm">{data.summary}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {tab.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} status={status} tokens={tokens} />
            ))}
          </div>

          {/* Visuais: grade de 2 colunas; span 2 ocupa a linha inteira */}
          {tab.charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tab.charts.map((chart, i) => (
                <VisualCard key={`${activeTab}-${i}`} chart={chart} tokens={tokens} />
              ))}
            </div>
          )}

          {/* Tables */}
          {tab.tables.map((table, i) => (
            <div key={i} className="bg-(--brand-surface) border border-(--brand-border) rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-(--brand-border) flex items-center justify-between">
                <h3 className="text-(--brand-text) font-medium text-sm">{table.title}</h3>
                <span className="text-(--brand-muted) text-xs">{table.rows.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-(--brand-border)">
                      {table.columns.map((col, j) => (
                        <th
                          key={j}
                          className="text-left px-5 py-3 text-(--brand-muted) text-xs font-medium uppercase tracking-wide whitespace-nowrap"
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
                        className="border-b border-(--brand-border) hover:bg-(--brand-surface-hover) transition-colors"
                      >
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-5 py-3 text-(--brand-text) text-sm whitespace-nowrap">
                            {/* Color-code common status values */}
                            {['Ativo', 'Concluído', 'Aprovado', 'Pago'].includes(cell) ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${status.success}`}>
                                {cell}
                              </span>
                            ) : ['Inativo', 'Cancelado', 'Reprovado', 'Atrasado'].includes(cell) ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${status.error}`}>
                                {cell}
                              </span>
                            ) : ['Pendente', 'Em andamento', 'Em análise'].includes(cell) ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${status.warning}`}>
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
