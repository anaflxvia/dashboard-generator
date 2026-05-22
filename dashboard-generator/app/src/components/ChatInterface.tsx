import { useState, type Dispatch, type SetStateAction } from 'react'
import type { UserAnswers } from '../types'

const EXEMPLOS_OBJETIVO: Record<string, string[]> = {
  'Financeiro':         ['Ter controle do fluxo de caixa', 'Entender por que o EBITDA caiu', 'Ver centros de custo acima do orçado'],
  'CRM / Vendas':       ['Ter controle do pipeline de vendas', 'Ver quais vendedores estão abaixo da meta', 'Identificar gargalos no funil'],
  'Recursos Humanos':   ['Ter controle de headcount e turnover', 'Entender por que o turnover aumentou', 'Ver departamentos com mais absenteísmo'],
  'Advocacia':          ['Ter controle de casos e prazos', 'Ver casos com prazos críticos', 'Entender tempo gasto por tipo de processo'],
  'Observabilidade TI': ['Ter controle de operações e ferramentas', 'Identificar serviços com mais incidentes', 'Ver degradação de latência ao longo do mês'],
  'FinOps':             ['Ter controle de custos de cloud', 'Entender por que o cloud spend aumentou', 'Ver equipes consumindo mais orçamento'],
  'Gerencial / PMO':    ['Ter controle de projetos e OKRs', 'Ver saúde geral dos projetos', 'Identificar OKRs em risco'],
  'Jurídico':           ['Ter controle de contratos e processos', 'Ver contratos prestes a vencer', 'Acompanhar valor provisionado em litígios'],
  'Educação':           ['Ter controle de matrículas e evasão', 'Entender quais turmas têm maior evasão', 'Ver desempenho acadêmico por disciplina'],
  'Logística':          ['Ter controle de entregas e estoque', 'Identificar rotas com mais atrasos', 'Ver quais SKUs têm maior giro'],
  'SLA / Suporte':      ['Ter controle de SLA e chamados', 'Ver clientes com SLA em risco', 'Identificar tickets com maior tempo de resolução'],
  'Outro':              ['Ter controle geral da operação', 'Identificar onde estão os principais problemas', 'Monitorar desempenho por área'],
}

const EXEMPLOS_DECISAO = [
  'Decidir se abro novas vagas',
  'Cortar custos em áreas deficitárias',
  'Redistribuir budget entre canais',
  'Priorizar clientes com risco de churn',
]

const EXEMPLOS_COMPARACOES = [
  'Variação mês a mês',
  'Ranking por categoria',
  'Comparativo por região',
  'Meta vs realizado',
]

const EXEMPLOS_METRICAS = [
  'Taxa de conversão',
  'Margem por produto',
  'Ticket médio',
  'CAC e LTV',
]

const SEGMENTS = [
  { val: 'Financeiro',        icon: '💰' },
  { val: 'CRM / Vendas',      icon: '📈' },
  { val: 'Recursos Humanos',  icon: '👥' },
  { val: 'Advocacia',         icon: '⚖️' },
  { val: 'Observabilidade TI',icon: '🔌' },
  { val: 'FinOps',            icon: '☁️' },
  { val: 'Gerencial / PMO',   icon: '🎯' },
  { val: 'Jurídico',          icon: '📝' },
  { val: 'Educação',          icon: '🏫' },
  { val: 'Logística',         icon: '🚚' },
  { val: 'SLA / Suporte',     icon: '📋' },
  { val: 'Outro',             icon: '＋' },
]

interface Props {
  onComplete: (answers: UserAnswers) => void
  isGenerating: boolean
  error: string | null
}

export default function ChatInterface({ onComplete, isGenerating, error }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [segmento, setSegmento] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [decisao, setDecisao] = useState('')
  const [comparacoes, setComparacoes] = useState('')
  const [metricas, setMetricas] = useState('')
  const [segError, setSegError] = useState(false)

  function handleNext() {
    if (!segmento) { setSegError(true); return }
    setSegError(false)
    setStep(2)
  }

  function handleSubmit() {
    onComplete({ segmento, objetivo, decisao, comparacoes, metricas })
  }

  /* ── Step indicator ── */
  function StepDots() {
    const steps = [
      { n: 1, label: 'Segmento' },
      { n: 2, label: 'Contexto' },
      { n: 3, label: 'Dashboard' },
    ]
    const current = isGenerating ? 3 : step
    return (
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              current > s.n
                ? 'bg-emerald-900/60 border border-emerald-600 text-emerald-400'
                : current === s.n
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-700 text-slate-500'
            }`}>
              {current > s.n ? '✓' : s.n}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-12 transition-colors ${current > s.n + 0.5 ? 'bg-emerald-700' : 'bg-slate-800'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  /* ── Chips de exemplo ── */
  function Chips({ examples, onPick }: { examples: string[]; onPick: (v: string) => void }) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            className="px-2.5 py-1 bg-slate-800 border border-slate-700 hover:border-slate-500 hover:text-slate-200 text-slate-400 text-xs rounded-md transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    )
  }

  function appendEx(setter: Dispatch<SetStateAction<string>>, val: string) {
    setter((prev) => (prev ? (prev.endsWith('\n') ? prev + val : prev + '\n' + val) : val))
  }

  /* ── Loading (step 3) ── */
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-full max-w-lg px-6 text-center">
          <StepDots />
          <div className="w-12 h-12 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-white font-semibold text-lg mb-2">Gerando seu dashboard...</h2>
          <p className="text-slate-400 text-sm">A IA está montando os KPIs e gráficos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
        <div>
          <h1 className="text-white font-semibold text-sm">Dashboard Generator</h1>
          <p className="text-slate-500 text-xs">Powered by Claude</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <StepDots />

          {/* ── STEP 1: Segmento ── */}
          {step === 1 && (
            <div>
              <h2 className="text-white text-2xl font-semibold tracking-tight mb-1">Configure seu dashboard</h2>
              <p className="text-slate-400 text-sm mb-8">Selecione o segmento e preencha o contexto. Quanto mais detalhe, melhor o resultado.</p>

              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                1 — Qual o segmento da empresa?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-1">
                {SEGMENTS.map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => { setSegmento(s.val); setSegError(false) }}
                    className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border text-center transition-all ${
                      segmento === s.val
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl leading-none">{s.icon}</span>
                    <span className="text-xs font-medium leading-tight">{s.val}</span>
                  </button>
                ))}
              </div>
              {segError && (
                <p className="text-red-400 text-xs mt-2 mb-4">Selecione um segmento para continuar.</p>
              )}

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Contexto ── */}
          {step === 2 && (
            <div>
              <h2 className="text-white text-2xl font-semibold tracking-tight mb-1">Contexto do dashboard</h2>
              <p className="text-slate-400 text-sm mb-8">
                Segmento selecionado:{' '}
                <span className="text-indigo-400 font-medium">{segmento}</span>
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    2 — O que você quer descobrir com esse dashboard?
                  </label>
                  <textarea
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    placeholder="Descreva o que quer monitorar ou entender..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none outline-none transition-colors"
                  />
                  <Chips
                    examples={EXEMPLOS_OBJETIVO[segmento] ?? EXEMPLOS_OBJETIVO['Outro']}
                    onPick={(v) => appendEx(setObjetivo, v)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    3 — Que decisão estratégica esse dashboard vai suportar?
                  </label>
                  <textarea
                    value={decisao}
                    onChange={(e) => setDecisao(e.target.value)}
                    placeholder="Ex: decidir se contrato mais vendedores, cortar custos em áreas deficitárias..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none outline-none transition-colors"
                  />
                  <Chips examples={EXEMPLOS_DECISAO} onPick={(v) => appendEx(setDecisao, v)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    4 — Quais comparações fazem sentido para você?
                  </label>
                  <textarea
                    value={comparacoes}
                    onChange={(e) => setComparacoes(e.target.value)}
                    placeholder="Ex: mês a mês, por região, por equipe, meta vs realizado..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none outline-none transition-colors"
                  />
                  <Chips examples={EXEMPLOS_COMPARACOES} onPick={(v) => appendEx(setComparacoes, v)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    5 — Métricas que não podem faltar{' '}
                    <span className="text-slate-600 normal-case font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={metricas}
                    onChange={(e) => setMetricas(e.target.value)}
                    placeholder="Ex: taxa de conversão, margem por produto, ticket médio, CAC e LTV..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none outline-none transition-colors"
                  />
                  <Chips examples={EXEMPLOS_METRICAS} onPick={(v) => appendEx(setMetricas, v)} />
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3">
                  <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                >
                  Gerar dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
