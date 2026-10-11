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

