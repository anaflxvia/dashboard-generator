import type { Tip } from './useHoverTip'

export function HoverTip({ tip }: { tip: Tip | null }) {
  if (!tip) return null
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-(--brand-border) bg-(--brand-surface) px-3 py-2 text-xs shadow-lg whitespace-nowrap"
      style={{ left: tip.flip ? tip.x - 12 : tip.x + 12, top: tip.y + 12, transform: tip.flip ? 'translateX(-100%)' : undefined }}
    >
      {tip.content}
    </div>
  )
}
