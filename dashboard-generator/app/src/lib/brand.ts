import type { CSSProperties } from 'react'

export interface Brand {
  name: string
  logo: string | null // data URL
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

// padrao = visual do app (slate + indigo). A primaria #5b5bf0 passa nas duas checagens:
// 5.0:1 com texto branco e 3.6:1 sobre a superficie (o indigo-600 anterior dava 2.8:1)
export const DEFAULT_BRAND: Brand = {
  name: '',
  logo: null,
  primary: '#5b5bf0',
  secondary: '#10b981',
  background: '#020617',
  surface: '#0f172a',
  text: '#f1f5f9',
}

const STORAGE_KEY = 'dashboard_brand'

export function loadBrand(): Brand {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_BRAND
    return { ...DEFAULT_BRAND, ...(JSON.parse(raw) as Partial<Brand>) }
  } catch {
    return DEFAULT_BRAND
  }
}

// lanca erro se o localStorage estiver cheio/bloqueado — a tela mostra o estado de erro
export function saveBrand(brand: Brand): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brand))
}

/* ── Cor e contraste (WCAG 2.1) ── */

export function isHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

function toRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// mistura `a` sobre `b` com peso `weight` (0..1)
export function mix(a: string, b: string, weight: number): string {
  const ca = toRgb(a)
  const cb = toRgb(b)
  return toHex([0, 1, 2].map((i) => ca[i] * weight + cb[i] * (1 - weight)) as [number, number, number])
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.18
}

// texto sobre a cor primaria: branco ou quase-preto, o que tiver mais contraste
export function onColor(hex: string): string {
  return contrast(hex, '#ffffff') >= contrast(hex, '#0f172a') ? '#ffffff' : '#0f172a'
}

/* ── Tokens derivados ── */

export interface BrandTokens {
  primary: string
  onPrimary: string
  secondary: string
  background: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
  dark: boolean
}

export function deriveTokens(brand: Brand): BrandTokens {
  return {
    primary: brand.primary,
    onPrimary: onColor(brand.primary),
    secondary: brand.secondary,
    background: brand.background,
    surface: brand.surface,
    surfaceHover: mix(brand.text, brand.surface, 0.06),
    border: mix(brand.text, brand.surface, 0.14),
    text: brand.text,
    textMuted: mix(brand.text, brand.surface, 0.65),
    dark: isDark(brand.background),
  }
}

export function brandStyle(t: BrandTokens): CSSProperties {
  return {
    '--brand-primary': t.primary,
    '--brand-on-primary': t.onPrimary,
    '--brand-secondary': t.secondary,
    '--brand-bg': t.background,
    '--brand-surface': t.surface,
    '--brand-surface-hover': t.surfaceHover,
    '--brand-border': t.border,
    '--brand-text': t.text,
    '--brand-muted': t.textMuted,
  } as CSSProperties
}

/* ── Checagens de acessibilidade ── */

export interface ContrastCheck {
  label: string
  ratio: number
  min: number
  ok: boolean
  blocking: boolean // reprovado aqui impede salvar
}

export function checkContrast(brand: Brand): ContrastCheck[] {
  const t = deriveTokens(brand)
  const rows: Array<Omit<ContrastCheck, 'ok'>> = [
    { label: 'Texto sobre fundo', ratio: contrast(t.text, t.background), min: 4.5, blocking: true },
    { label: 'Texto sobre superfície (cards)', ratio: contrast(t.text, t.surface), min: 4.5, blocking: true },
    { label: 'Texto secundário sobre superfície', ratio: contrast(t.textMuted, t.surface), min: 4.5, blocking: false },
    { label: 'Texto do botão sobre primária', ratio: contrast(t.onPrimary, t.primary), min: 4.5, blocking: true },
    { label: 'Primária sobre superfície (aba ativa, gráficos)', ratio: contrast(t.primary, t.surface), min: 3, blocking: false },
    { label: 'Secundária sobre superfície (gráficos)', ratio: contrast(t.secondary, t.surface), min: 3, blocking: false },
  ]
  return rows.map((r) => ({ ...r, ok: r.ratio >= r.min }))
}
