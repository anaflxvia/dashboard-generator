import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from 'react'

export interface Tip {
  x: number
  y: number
  flip: boolean // perto da borda direita, abre para a esquerda
  content: ReactNode
}

// Tooltip leve para os visuais em SVG/HTML (mapa, heatmap). O container precisa ser `relative`.
export function useHoverTip() {
  const ref = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const show = useCallback((e: MouseEvent, content: ReactNode) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return
    const x = e.clientX - box.left
    setTip({ x, y: e.clientY - box.top, flip: x > box.width * 0.6, content })
  }, [])
  const hide = useCallback(() => setTip(null), [])

  return { ref, tip, show, hide }
}

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
