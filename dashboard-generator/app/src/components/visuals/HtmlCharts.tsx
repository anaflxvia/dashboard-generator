import type { ChartConfig } from '../../types'
import { mix, type BrandTokens } from '../../lib/brand'
import { formatValue } from '../../lib/format'
import { HoverTip } from './HoverTip'
import { useHoverTip } from './useHoverTip'

interface Props {
  chart: ChartConfig
  tokens: BrandTokens
}

/* ── Bullet: realizado (barra) vs meta (marca vertical), com faixas qualitativas ao fundo ── */

export function BulletChart({ chart, tokens }: Props) {
  const real = chart.datasets[0]?.data ?? []
  const meta = chart.datasets[1]?.data ?? []
  const escala = Math.max(...real, ...meta, 1) * 1.1
  // faixas ruim / regular / bom em cinzas, relativas a meta de cada linha
  const faixas = [mix(tokens.text, tokens.surface, 0.05), mix(tokens.text, tokens.surface, 0.1), mix(tokens.text, tokens.surface, 0.15)]

  return (
    <div className="flex flex-col justify-center gap-4 h-full">
      {chart.labels.map((label, i) => {
        const r = real[i] ?? 0
        const m = meta[i]
        const pct = m ? Math.round((r / m) * 100) : null
        return (
          <div key={label} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3">
            <span className="text-xs text-(--brand-text) truncate" title={label}>{label}</span>
            <div className="relative h-5 rounded overflow-hidden" title={`${label}: ${formatValue(r, chart.unit)}${m ? ` de ${formatValue(m, chart.unit)}` : ''}`}>
              {m !== undefined && (
                <div className="absolute inset-0 flex">
                  <div style={{ width: `${((m * 0.7) / escala) * 100}%`, background: faixas[2] }} />
                  <div style={{ width: `${((m * 0.25) / escala) * 100}%`, background: faixas[1] }} />
                  <div className="flex-1" style={{ background: faixas[0] }} />
                </div>
              )}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-r" style={{ width: `${(r / escala) * 100}%`, background: tokens.primary }} />
              {m !== undefined && (
                <div className="absolute top-0.5 bottom-0.5 w-0.5 rounded" style={{ left: `${(m / escala) * 100}%`, background: tokens.text }} />
              )}
            </div>
            <span className="text-xs tabular-nums text-(--brand-muted) w-24 text-right">
              <span className="text-(--brand-text) font-medium">{formatValue(r, chart.unit)}</span>
              {pct !== null && <span> · {pct}%</span>}
            </span>
          </div>
        )
      })}
      <div className="flex items-center gap-4 text-[11px] text-(--brand-muted) pl-1">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-1.5 rounded" style={{ background: tokens.primary }} />{chart.datasets[0]?.label ?? 'Realizado'}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-0.5 h-3 rounded" style={{ background: tokens.text }} />{chart.datasets[1]?.label ?? 'Meta'}</span>
      </div>
    </div>
  )
}

/* ── Funil: etapas em sequencia, com a conversao de uma etapa para a seguinte ── */

export function FunnelChart({ chart, tokens }: Props) {
  const data = chart.datasets[0]?.data ?? []
  const max = Math.max(...data, 1)
  return (
    <div className="flex flex-col justify-center gap-1.5 h-full">
      {chart.labels.map((label, i) => {
        const v = data[i] ?? 0
        const conv = i > 0 && data[i - 1] ? Math.round((v / data[i - 1]) * 100) : null
        return (
          <div key={label} className="grid grid-cols-[minmax(0,7.5rem)_1fr_4.5rem] items-center gap-3">
            <span className="text-xs text-(--brand-text) truncate text-right" title={label}>{label}</span>
            <div className="flex justify-center">
              <div
                className="h-8 rounded-md flex items-center justify-center text-xs font-semibold tabular-nums"
                style={{
                  width: `${Math.max(8, (v / max) * 100)}%`,
                  background: tokens.primary,
                  color: tokens.onPrimary,
                }}
              >
                {formatValue(v, chart.unit)}
              </div>
            </div>
            <span className="text-[11px] text-(--brand-muted) tabular-nums">{conv !== null ? `${conv}% conv.` : ''}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Heatmap: linhas = datasets, colunas = labels, intensidade em uma cor so ── */

export function Heatmap({ chart, tokens }: Props) {
  const { ref, tip, show, hide } = useHoverTip()
  const todos = chart.datasets.flatMap((d) => d.data)
  const min = Math.min(...todos)
  const max = Math.max(...todos)
  const base = mix(tokens.text, tokens.surface, 0.05)

  return (
    <div ref={ref} className="relative overflow-x-auto h-full flex items-center">
      <table className="w-full border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr>
            <th />
            {chart.labels.map((l) => (
              <th key={l} className="text-[11px] font-normal text-(--brand-muted) pb-1 whitespace-nowrap">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.datasets.map((row) => (
            <tr key={row.label}>
              <th className="text-[11px] font-normal text-(--brand-muted) text-right pr-2 whitespace-nowrap">{row.label}</th>
              {row.data.map((v, j) => {
                const t = (v - min) / (max - min || 1)
                const bg = mix(tokens.primary, base, 0.1 + 0.9 * t)
                return (
                  <td
                    key={j}
                    className="h-8 min-w-9 rounded text-center text-[11px] tabular-nums cursor-default"
                    style={{ background: bg, color: t > 0.55 ? tokens.onPrimary : tokens.textMuted }}
                    onMouseMove={(e) =>
                      show(e, (
                        <>
                          <p className="text-(--brand-text) font-medium">{row.label} · {chart.labels[j]}</p>
                          <p className="text-(--brand-muted)">{formatValue(v, chart.unit)}</p>
                        </>
                      ))
                    }
                    onMouseLeave={hide}
                  >
                    {formatValue(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <HoverTip tip={tip} />
    </div>
  )
}
