import { useEffect } from 'react'
import { TEMAS_SEGMENTO } from './segmentThemes'

// fontes oferecidas na tela de marca: as dos temas de segmento (skill ui-ux-pro-max)
export const FONTES = [...new Set(Object.values(TEMAS_SEGMENTO).map((t) => t.brand.font).filter((f): f is string => !!f))].sort()

export const fontFamily = (font?: string) => (font ? `'${font}', system-ui, sans-serif` : undefined)

// carrega a fonte do Google Fonts uma vez por familia
export function useGoogleFont(font?: string) {
  useEffect(() => {
    if (!font) return
    const id = `gf-${font.replace(/\s+/g, '-')}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${font.trim().replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
  }, [font])
}

// monograma quando nao ha logo: iniciais das duas primeiras palavras ("Atlas Capital" -> "AC")
export function siglaMarca(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter((p) => p.length > 2 || /^[A-Z]/.test(p))
  return (partes.slice(0, 2).map((p) => p[0]).join('') || 'AI').toUpperCase()
}
