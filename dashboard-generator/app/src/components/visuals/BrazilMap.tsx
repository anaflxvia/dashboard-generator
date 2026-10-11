import { useMemo, useState } from 'react'
import type { ChartConfig } from '../../types'
import { mix, type BrandTokens } from '../../lib/brand'
import { ESTADOS, VIEWBOX, acharEstado, type Estado } from '../../lib/brasil'
import { formatValue } from '../../lib/format'
import { HoverTip, useHoverTip } from './HoverTip'

interface Props {
  chart: ChartConfig
  tokens: BrandTokens
}

interface Item {
  label: string
  value: number
}

// lista ao lado do mapa: o mapa mostra onde, a lista mostra quanto
function Ranking({ items, unit, tokens }: { items: Item[]; unit?: string; tokens: BrandTokens }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ol className="flex-1 min-w-[150px] space-y-2.5 self-center">
      {items.map((it) => (
        <li key={it.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-(--brand-text) truncate">{it.label}</span>
            <span className="text-(--brand-muted) tabular-nums shrink-0">{formatValue(it.value, unit)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full" style={{ background: tokens.surfaceHover }}>
            <div className="h-full rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: tokens.primary }} />
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ── Mapa coropletico: intensidade por UF ── */

export function ChoroplethMap({ chart, tokens }: Props) {
  const { ref, tip, show, hide } = useHoverTip()
  const valores = useMemo(() => {
    const m = new Map<string, number>()
    chart.labels.forEach((label, i) => {
      const e = acharEstado(label)
      const v = chart.datasets[0]?.data[i]
      if (e && Number.isFinite(v)) m.set(e.uf, v)
    })
    return m
  }, [chart])

  const nums = [...valores.values()]
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const neutro = mix(tokens.text, tokens.surface, 0.07)
  // escala sequencial de uma cor so: claro -> primaria
  const cor = (v: number) => mix(tokens.primary, neutro, 0.18 + 0.82 * ((v - min) / (max - min || 1)))

  const ranking = [...valores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uf, value]) => ({ label: ESTADOS.find((e) => e.uf === uf)?.nome ?? uf, value }))

  return (
    <div ref={ref} className="relative flex flex-wrap items-stretch gap-5 h-full">
      <div className="flex flex-col items-center gap-2">
        <svg viewBox={VIEWBOX} className="h-60 w-auto" role="img" aria-label={chart.title}>
          {ESTADOS.map((e) => {
            const v = valores.get(e.uf)
            return (
              <path
                key={e.uf}
                d={e.path}
                fill={v === undefined ? neutro : cor(v)}
                stroke={tokens.surface}
                strokeWidth={1.2}
                className="transition-opacity hover:opacity-80 cursor-default"
                onMouseMove={(ev) =>
                  show(ev, (
                    <>
                      <p className="text-(--brand-text) font-medium">{e.nome}</p>
                      <p className="text-(--brand-muted)">{v === undefined ? 'Sem dados' : formatValue(v, chart.unit)}</p>
                    </>
                  ))
                }
                onMouseLeave={hide}
              />
            )
          })}
        </svg>
        {/* legenda da escala */}
        <div className="flex items-center gap-2 text-[11px] text-(--brand-muted) tabular-nums">
          <span>{formatValue(min, chart.unit)}</span>
          <div className="h-1.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${cor(min)}, ${cor(max)})` }} />
          <span>{formatValue(max, chart.unit)}</span>
        </div>
      </div>
      <Ranking items={ranking} unit={chart.unit} tokens={tokens} />
      <HoverTip tip={tip} />
    </div>
  )
}

/* ── Mapa de rotas: fluxos de origem para destino entre UFs ── */

interface Rota {
  de: Estado
  para: Estado
  value: number
}

function curva(a: Estado, b: Estado): string {
  const dx = b.cx - a.cx
  const dy = b.cy - a.cy
  // ponto de controle deslocado na perpendicular: arcos em vez de retas sobrepostas
  const k = 0.22
  const mx = (a.cx + b.cx) / 2 - dy * k
  const my = (a.cy + b.cy) / 2 + dx * k
  return `M${a.cx},${a.cy} Q${mx},${my} ${b.cx},${b.cy}`
}

export function RouteMap({ chart, tokens }: Props) {
  const { ref, tip, show, hide } = useHoverTip()
  const [ativa, setAtiva] = useState<number | null>(null)

  const rotas = useMemo<Rota[]>(
    () =>
      (chart.routes ?? [])
        .map((r) => ({ de: acharEstado(r.from), para: acharEstado(r.to), value: Number(r.value) }))
        .filter((r): r is Rota => !!r.de && !!r.para && r.de.uf !== r.para.uf && Number.isFinite(r.value))
        .sort((a, b) => a.value - b.value), // maiores por cima
    [chart.routes]
  )

  const max = Math.max(...rotas.map((r) => r.value), 1)
  const volumePorUf = new Map<string, number>()
  for (const r of rotas) {
    volumePorUf.set(r.de.uf, (volumePorUf.get(r.de.uf) ?? 0) + r.value)
    volumePorUf.set(r.para.uf, (volumePorUf.get(r.para.uf) ?? 0) + r.value)
  }
  const maxUf = Math.max(...volumePorUf.values(), 1)
  const neutro = mix(tokens.text, tokens.surface, 0.07)
  const tocado = mix(tokens.primary, neutro, 0.1)

  const ranking = [...rotas]
    .reverse()
    .slice(0, 5)
    .map((r) => ({ label: `${r.de.uf} → ${r.para.uf}`, value: r.value }))

  const dica = (r: Rota) => (
    <>
      <p className="text-(--brand-text) font-medium">{r.de.nome} → {r.para.nome}</p>
      <p className="text-(--brand-muted)">{formatValue(r.value, chart.unit)}</p>
    </>
  )

  return (
    <div ref={ref} className="relative flex flex-wrap items-stretch gap-5 h-full">
      <svg viewBox={VIEWBOX} className="h-72 w-auto" role="img" aria-label={chart.title}>
        {ESTADOS.map((e) => (
          <path
            key={e.uf}
            d={e.path}
            fill={volumePorUf.has(e.uf) ? tocado : neutro}
            stroke={tokens.surface}
            strokeWidth={1.2}
          />
        ))}
        {rotas.map((r, i) => {
          const d = curva(r.de, r.para)
          const w = 2 + 4 * (r.value / max)
          const apagada = ativa !== null && ativa !== i
          return (
            <g key={i} opacity={apagada ? 0.2 : 1} className="transition-opacity">
              <path d={d} fill="none" stroke={tokens.primary} strokeOpacity={0.9} strokeWidth={w} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {/* tracejado em movimento indica o sentido origem -> destino */}
              <path d={d} fill="none" stroke={tokens.onPrimary} strokeOpacity={0.7} strokeWidth={Math.max(1, w / 3)} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="route-flow" />
              {/* area de toque maior que o traco */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                vectorEffect="non-scaling-stroke"
                onMouseMove={(ev) => { setAtiva(i); show(ev, dica(r)) }}
                onMouseLeave={() => { setAtiva(null); hide() }}
              />
            </g>
          )
        })}
        {[...volumePorUf.entries()].map(([uf, vol]) => {
          const e = ESTADOS.find((s) => s.uf === uf)!
          return (
            <g key={uf} pointerEvents="none">
              <circle cx={e.cx} cy={e.cy} r={9 + 9 * (vol / maxUf)} fill={tokens.primary} stroke={tokens.surface} strokeWidth={4} />
              <text x={e.cx} y={e.cy - 14 - 9 * (vol / maxUf)} textAnchor="middle" fontSize={24} fontWeight={600} fill={tokens.text}>
                {uf}
              </text>
            </g>
          )
        })}
      </svg>
      <Ranking items={ranking} unit={chart.unit} tokens={tokens} />
      <HoverTip tip={tip} />
    </div>
  )
}
