import { useState, useMemo, type CSSProperties } from 'react'
import { fontFamily, siglaMarca, useGoogleFont } from '../lib/fonts'
import type { DashboardData, DashboardTab, TableData } from '../types'
import { SEM_FILTROS, completarGrade, filtrarGrafico, filtrarTabela, opcoesDisponiveis, temFiltro, type FiltrosAtivos } from '../lib/filters'
import { brandStyle, deriveTokens, mix, type Brand, type BrandTokens } from '../lib/brand'
import Icone from './visuals/Icone'
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
          <Icone name={kpi.icon} label={kpi.label} className="w-[18px] h-[18px]" />
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

function TabelaCard({ table, status }: { table: TableData; status: StatusClasses }) {
  return (
    <div className="bg-(--brand-surface) border border-(--brand-border) rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-(--brand-border) flex items-center justify-between">
        <h3 className="text-(--brand-text) font-medium text-sm">{table.title}</h3>
        <span className="text-(--brand-muted) text-xs">{table.rows.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--brand-border)">
              {table.columns.map((col, j) => (
                <th key={j} className="text-left px-5 py-3 text-(--brand-muted) text-xs font-medium uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 && (
              <tr>
                <td colSpan={table.columns.length} className="px-5 py-6 text-center text-sm text-(--brand-muted)">
                  Nenhum registro para os filtros escolhidos
                </td>
              </tr>
            )}
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-(--brand-border) hover:bg-(--brand-surface-hover) transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-5 py-3 text-(--brand-text) text-sm whitespace-nowrap">
                    {['Ativo', 'Concluído', 'Aprovado', 'Pago'].includes(cell) ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${status.success}`}>{cell}</span>
                    ) : ['Inativo', 'Cancelado', 'Reprovado', 'Atrasado'].includes(cell) ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${status.error}`}>{cell}</span>
                    ) : ['Pendente', 'Em andamento', 'Em análise'].includes(cell) ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${status.warning}`}>{cell}</span>
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
  )
}

// select do cabecalho: fica destacado na cor da marca quando tem filtro escolhido
function FiltroSelect({ rotulo, valor, onChange, opcoes }: {
  rotulo: string
  valor: string
  onChange: (v: string) => void
  opcoes: Array<{ valor: string; rotulo: string }>
}) {
  const ativo = valor !== ''
  return (
    <label className="flex items-center">
      <span className="sr-only">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs rounded-lg pl-3 pr-8 py-1.5 border outline-none cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-(--brand-primary) ${
          ativo
            ? 'border-(--brand-primary) bg-(--tab-hover) text-(--brand-text) font-medium'
            : 'border-(--brand-border) bg-(--brand-surface) text-(--brand-muted) hover:border-(--brand-muted) hover:text-(--brand-text)'
        }`}
      >
        <option value="">{rotulo}: todos</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
    </label>
  )
}

const BOTAO_ICONE =
  'p-2 rounded-lg text-(--brand-muted) cursor-pointer transition-colors duration-200 hover:text-(--brand-primary) hover:bg-(--tab-hover) focus-visible:outline-2 focus-visible:outline-(--brand-primary)'

export default function Dashboard({ data, brand, onBack, onOpenBrand, fromCache = false }: Props) {
  const tokens = useMemo(() => deriveTokens(brand), [brand])
  useGoogleFont(brand.font)
  const status = tokens.dark ? STATUS_DARK : STATUS_LIGHT
  const [activeTab, setActiveTab] = useState(0)
  const [filtros, setFiltros] = useState<FiltrosAtivos>(SEM_FILTROS)
  const [abertoEm] = useState(() => new Date())

  const tab = data.tabs[activeTab] ?? data.tabs[0]
  const opcoes = useMemo(() => opcoesDisponiveis(data), [data])
  const algumFiltro = temFiltro(filtros)

  const visuais = useMemo(() => {
    const filtrados = tab.charts.map((c) => ({ ...filtrarGrafico(c, filtros, opcoes), span: c.span }))
    return completarGrade(filtrados)
  }, [tab, filtros, opcoes])
  const tabelas = useMemo(() => tab.tables.map((t) => filtrarTabela(t, filtros, opcoes)), [tab, filtros, opcoes])

  const atualizado = new Date(data.generatedAt ?? abertoEm)
  const atualizadoTexto = `${atualizado.toLocaleDateString('pt-BR')} às ${atualizado.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

  // tom suave da primaria para hover das abas, filtros ativos e botoes
  const estilo = {
    ...brandStyle(tokens),
    '--tab-hover': mix(tokens.primary, tokens.surface, 0.14),
    fontFamily: fontFamily(brand.font),
  } as CSSProperties

  return (
    <div style={estilo} className="flex flex-col h-screen bg-(--brand-bg) text-(--brand-text) overflow-hidden">
      {/* Cabecalho: so logo e nome da empresa */}
      <header className="h-16 bg-(--brand-surface) border-b border-(--brand-border) shrink-0 flex items-center px-4 sm:px-6">
          <div className="flex items-center gap-3 shrink-0">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name || 'Logo'} className="h-8 max-w-[140px] object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-(--brand-primary) flex items-center justify-center text-(--brand-on-primary) text-xs font-bold">
                {siglaMarca(brand.name || data.title)}
              </div>
            )}
            {/* nome sempre ao lado do logo; sem nome cadastrado, usa o titulo do dashboard */}
            <span className="text-(--brand-text) font-semibold text-sm truncate">{brand.name || data.title}</span>
          </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-(--brand-bg)">
        {/* Titulo do dashboard e acoes */}
        <div className="px-4 sm:px-6 pt-6 flex flex-wrap items-center gap-3">
          <h1 className="flex-1 min-w-0 text-xl sm:text-2xl font-semibold text-(--brand-text) tracking-tight">
            {data.segment} · {data.title}
          </h1>
          <div className="flex items-center gap-1 shrink-0">
            {fromCache && (
              <span className={`hidden lg:flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-full mr-1 ${status.success}`}>
                Do cache
              </span>
            )}
            <button onClick={onOpenBrand} title="Identidade visual" aria-label="Identidade visual" className={BOTAO_ICONE}>
              {ICONE_CONFIG}
            </button>
            <button onClick={onBack} title="Novo dashboard" aria-label="Novo dashboard" className={BOTAO_ICONE}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              onClick={() => window.print()}
              className="ml-1 flex items-center gap-1.5 bg-(--brand-primary) text-(--brand-on-primary) text-xs font-medium px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand-primary)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Filtros e atualizacao */}
        <div className="px-4 sm:px-6 pt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-(--brand-muted) mr-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filtros
          </span>
          {opcoes.periodos.length > 0 && (
            <FiltroSelect
              rotulo="Período"
              valor={filtros.periodo ? String(filtros.periodo) : ''}
              onChange={(v) => setFiltros((f) => ({ ...f, periodo: v ? Number(v) : null }))}
              opcoes={opcoes.periodos.map((p) => ({ valor: String(p.valor), rotulo: p.rotulo }))}
            />
          )}
          {opcoes.regioes.length > 0 && (
            <FiltroSelect
              rotulo="Região"
              valor={filtros.regiao ?? ''}
              onChange={(v) => setFiltros((f) => ({ ...f, regiao: v || null }))}
              opcoes={opcoes.regioes.map((r) => ({ valor: r, rotulo: r }))}
            />
          )}
          {opcoes.dimensoes.map((d) => (
            <FiltroSelect
              key={d.label}
              rotulo={d.label}
              valor={filtros.dimensoes[d.label] ?? ''}
              onChange={(v) =>
                setFiltros((f) => {
                  const dimensoes = { ...f.dimensoes }
                  if (v) dimensoes[d.label] = v
                  else delete dimensoes[d.label]
                  return { ...f, dimensoes }
                })
              }
              opcoes={d.options.map((o) => ({ valor: o, rotulo: o }))}
            />
          ))}
          {opcoes.periodos.length + opcoes.regioes.length + opcoes.dimensoes.length === 0 && (
            <span className="text-xs text-(--brand-muted)">Este dashboard não tem dimensões para filtrar</span>
          )}
          <button
            onClick={() => setFiltros(SEM_FILTROS)}
            disabled={!algumFiltro}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 text-(--brand-primary) hover:bg-(--tab-hover) disabled:text-(--brand-muted) disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar filtros
          </button>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-(--brand-muted)">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Atualizado em {atualizadoTexto}
          </span>
        </div>

        {/* Abas: ficam presas no topo ao rolar */}
        <div className="sticky top-0 z-10 bg-(--brand-bg) border-b border-(--brand-border) px-4 sm:px-6 py-2.5 mt-4">
          <nav role="tablist" aria-label="Abas do dashboard" className="flex items-center gap-1 overflow-x-auto">
            {data.tabs.map((t, i) => {
              const ativa = i === activeTab
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => setActiveTab(i)}
                  className={`group shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-(--brand-primary) ${
                    ativa
                      ? 'bg-(--brand-primary) text-(--brand-on-primary) font-medium shadow-sm'
                      : 'text-(--brand-muted) hover:text-(--brand-primary) hover:bg-(--tab-hover)'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${ativa ? '' : 'group-hover:scale-110'}`}>
                    <Icone name={t.icon} label={t.name} className="w-4 h-4" />
                  </span>
                  <span className="whitespace-nowrap">{t.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div key={activeTab} className="space-y-6 animate-entrada p-4 sm:p-6">
          <div className="bg-(--brand-surface) border border-(--brand-border) rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-(--brand-primary) shrink-0" />
            <p className="text-(--brand-muted) text-sm">{data.summary}</p>
          </div>

          {algumFiltro && (
            <p className="text-xs text-(--brand-muted)" role="status">
              Filtros aplicados aos gráficos e tabelas. Os indicadores do topo mostram o período completo.
            </p>
          )}

          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {tab.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} status={status} tokens={tokens} />
            ))}
          </div>

          {visuais.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visuais.map((v, i) => (
                <VisualCard key={i} chart={{ ...v.chart, span: v.span }} tokens={tokens} filtrado={v.filtrado} vazio={v.vazio} />
              ))}
            </div>
          )}

          {tabelas.map((table, i) => (
            <TabelaCard key={i} table={table} status={status} />
          ))}
        </div>
      </main>
    </div>
  )
}
