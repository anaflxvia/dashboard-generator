/* Identidade visual white-label: tokens da marca, contraste e export para Figma.
   Mesma logica do bloco IDENTIDADE VISUAL do frontend/app.html. */

export type Modo = 'light' | 'dark'

export interface CoresTema {
  primary: string
  secondary: string
  background: string
  surface: string
}

export interface Brand {
  ativo: boolean
  nome: string
  logo: string
  fonte: string
  tema: Modo
  preset: string
  light: CoresTema
  dark: CoresTema
}

export interface Tokens {
  'primary': string
  'on-primary': string
  'secondary': string
  'on-secondary': string
  'bg': string
  'surface': string
  'sidebar': string
  'text': string
  'text-2': string
  'muted': string
  'border': string
  'border-strong': string
  'grid': string
  'hover': string
  'primary-soft': string
  'success': string
  'danger': string
  'warning': string
  'info': string
  'series': string[]
}

export const BRAND_FONTES = ['Inter', 'DM Sans', 'Manrope', 'IBM Plex Sans', 'Poppins']

export const BRAND_CORES: { key: keyof CoresTema; nome: string; uso: string }[] = [
  { key: 'primary',    nome: 'Primária',   uso: 'Botões, item ativo, série principal' },
  { key: 'secondary',  nome: 'Secundária', uso: 'Destaques e segunda série' },
  { key: 'background', nome: 'Fundo',      uso: 'Fundo da página' },
  { key: 'surface',    nome: 'Superfície', uso: 'Cartões, tabelas, menus' },
]

export const BRAND_PRESETS: Record<string, { nome: string; light: CoresTema; dark: CoresTema }> = {
  indigo:    { nome: 'Indigo',            light: { primary: '#4f46e5', secondary: '#0e7490', background: '#f5f6fa', surface: '#ffffff' }, dark: { primary: '#818cf8', secondary: '#22d3ee', background: '#020617', surface: '#0f172a' } },
  logistica: { nome: 'Amarelo e azul',    light: { primary: '#1d4ed8', secondary: '#ffe600', background: '#f5f5f5', surface: '#ffffff' }, dark: { primary: '#93c5fd', secondary: '#ffe600', background: '#111827', surface: '#1f2937' } },
  verde:     { nome: 'Verde corporativo', light: { primary: '#047857', secondary: '#0369a1', background: '#f4f7f5', surface: '#ffffff' }, dark: { primary: '#34d399', secondary: '#7dd3fc', background: '#0c1210', surface: '#141d1a' } },
  grafite:   { nome: 'Grafite e laranja', light: { primary: '#c2410c', secondary: '#334155', background: '#f6f5f4', surface: '#ffffff' }, dark: { primary: '#fb923c', secondary: '#cbd5e1', background: '#121212', surface: '#1c1c1e' } },
  vinho:     { nome: 'Vinho e dourado',   light: { primary: '#9f1239', secondary: '#a16207', background: '#faf7f5', surface: '#ffffff' }, dark: { primary: '#fb7185', secondary: '#facc15', background: '#140d0f', surface: '#1f1518' } },
}

/* cores semanticas: reservadas para status, nunca usadas como serie de grafico */
const SEMANTICAS: Record<Modo, Pick<Tokens, 'success' | 'danger' | 'warning' | 'info'>> = {
  light: { success: '#15803d', danger: '#b91c1c', warning: '#b45309', info: '#1d4ed8' },
  dark:  { success: '#4ade80', danger: '#f87171', warning: '#fbbf24', info: '#60a5fa' },
}
/* series extras dos graficos, em ordem fixa, depois da primaria e da secundaria */
const SERIES_EXTRAS: Record<Modo, string[]> = {
  light: ['#0f766e', '#7c3aed', '#64748b', '#c2410c', '#be185d', '#4d7c0f'],
  dark:  ['#2dd4bf', '#a78bfa', '#94a3b8', '#fb923c', '#f472b6', '#a3e635'],
}

const BRAND_KEY = 'dashgen_brand'

export function brandPadrao(): Brand {
  const p = BRAND_PRESETS.indigo
  return { ativo: false, nome: '', logo: '', fonte: 'Inter', tema: 'dark', preset: 'indigo', light: { ...p.light }, dark: { ...p.dark } }
}

export function carregarBrand(): Brand {
  const base = brandPadrao()
  try {
    const salvo = JSON.parse(localStorage.getItem(BRAND_KEY) || 'null') as Partial<Brand> | null
    if (salvo && salvo.light && salvo.dark) {
      return { ...base, ...salvo, light: { ...base.light, ...salvo.light }, dark: { ...base.dark, ...salvo.dark } }
    }
  } catch { /* localStorage indisponivel */ }
  return base
}

/* retorna false quando o logo nao coube no localStorage (o resto e salvo mesmo assim) */
export function salvarBrand(b: Brand): boolean {
  try { localStorage.setItem(BRAND_KEY, JSON.stringify(b)); return true }
  catch {
    try { localStorage.setItem(BRAND_KEY, JSON.stringify({ ...b, logo: '' })) } catch { /* ignora */ }
    return false
  }
}

/* ── cor ── */
export function hexValido(h: string) { return /^#[0-9a-f]{6}$/i.test(h) }
function hexToRgb(h: string): [number, number, number] { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255] }
function rgbToHex(r: number, g: number, b: number) { return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') }
function luminancia(h: string) {
  const pesos = [0.2126, 0.7152, 0.0722]
  return hexToRgb(h)
    .map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) })
    .reduce((acc, v, i) => acc + v * pesos[i], 0)
}
export function contraste(a: string, b: string) { const la = luminancia(a), lb = luminancia(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) }
function misturar(a: string, b: string, t: number) { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(...(x.map((v, i) => v + (y[i] - v) * t) as [number, number, number])) }
function comAlpha(h: string, a: number) { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})` }
function melhorTextoSobre(fundo: string) { return contraste(fundo, '#ffffff') >= contraste(fundo, '#111827') ? '#ffffff' : '#111827' }

/* tokens completos de um tema, derivados das 4 cores escolhidas */
export function derivarTokens(b: Brand, modo: Modo): Tokens {
  const c = b[modo]
  const escuro = luminancia(c.background) < 0.2
  const text = escuro ? '#f3f4f6' : '#111827'
  return {
    'primary': c.primary, 'on-primary': melhorTextoSobre(c.primary),
    'secondary': c.secondary, 'on-secondary': melhorTextoSobre(c.secondary),
    'bg': c.background, 'surface': c.surface, 'sidebar': misturar(c.background, c.surface, 0.55),
    'text': text, 'text-2': escuro ? '#cbd5e1' : '#4b5563', 'muted': escuro ? '#94a3b8' : '#6b7280',
    'border': comAlpha(text, 0.12), 'border-strong': comAlpha(text, 0.24), 'grid': comAlpha(text, 0.07),
    'hover': comAlpha(text, 0.06), 'primary-soft': comAlpha(c.primary, 0.14),
    ...SEMANTICAS[modo],
    'series': [c.primary, c.secondary, ...SERIES_EXTRAS[modo]],
  }
}

/* variaveis CSS para aplicar no elemento raiz do dashboard */
export function cssVars(t: Tokens, fonte: string): Record<string, string> {
  const vars: Record<string, string> = { '--font': `'${fonte}', Arial, sans-serif` }
  for (const [k, v] of Object.entries(t)) if (k !== 'series') vars['--' + k] = v as string
  return vars
}

export function carregarFonte(fonte: string) {
  const id = 'dashgen-brand-font'
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) { link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; document.head.appendChild(link) }
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fonte).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`
}

export interface Checagem { tema: string; nome: string; razao: number; minimo: number }
export function checagensContraste(b: Brand): Checagem[] {
  const out: Checagem[] = []
  ;(['light', 'dark'] as Modo[]).forEach((m) => {
    const t = derivarTokens(b, m), tema = m === 'light' ? 'Claro' : 'Escuro'
    out.push({ tema, nome: 'Texto sobre fundo',           razao: contraste(t.text, t.bg),               minimo: 4.5 })
    out.push({ tema, nome: 'Texto do botão primário',     razao: contraste(t['on-primary'], t.primary), minimo: 4.5 })
    out.push({ tema, nome: 'Primária sobre superfície',   razao: contraste(t.primary, t.surface),       minimo: 3 })
    out.push({ tema, nome: 'Secundária sobre superfície', razao: contraste(t.secondary, t.surface),     minimo: 3 })
  })
  return out
}

export function siglaMarca(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean)
  if (!p.length) return 'DG'
  return (p[0][0] + (p[1] ? p[1][0] : p[0][1] || '')).toUpperCase()
}

/* le um arquivo de logo; bitmaps sao reduzidos a 320px no maior lado */
export function lerLogo(f: File): Promise<string> {
  const tiposOk = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
  if (!tiposOk.includes(f.type)) return Promise.reject(new Error('Formato não suportado. Use PNG, JPG, SVG ou WebP.'))
  if (f.size > 2 * 1024 * 1024) return Promise.reject(new Error('Arquivo maior que 2 MB. Reduza a imagem e tente de novo.'))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.onload = () => {
      const url = reader.result as string
      if (f.type === 'image/svg+xml') { resolve(url); return }
      const img = new Image()
      img.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
      img.onload = () => {
        const s = Math.min(1, 320 / Math.max(img.width, img.height))
        const cv = document.createElement('canvas')
        cv.width = Math.max(1, Math.round(img.width * s)); cv.height = Math.max(1, Math.round(img.height * s))
        cv.getContext('2d')?.drawImage(img, 0, 0, cv.width, cv.height)
        resolve(cv.toDataURL('image/png'))
      }
      img.src = url
    }
    reader.readAsDataURL(f)
  })
}

/* export no formato Tokens Studio (plugin do Figma) */
export function exportarTokens(b: Brand) {
  const cor = (v: string) => ({ value: v, type: 'color' })
  const setTema = (t: Tokens) => ({
    color: {
      primary: cor(t.primary), 'on-primary': cor(t['on-primary']), secondary: cor(t.secondary), 'on-secondary': cor(t['on-secondary']),
      background: cor(t.bg), surface: cor(t.surface), sidebar: cor(t.sidebar),
      text: { primary: cor(t.text), secondary: cor(t['text-2']), muted: cor(t.muted) },
      border: { default: cor(t.border), strong: cor(t['border-strong']) },
      status: { success: cor(t.success), danger: cor(t.danger), warning: cor(t.warning), info: cor(t.info) },
      chart: Object.fromEntries(t.series.map((c, i) => [`series-${i + 1}`, cor(c)])),
    },
  })
  const tipo = (size: string, weight: string, extra: Record<string, string> = {}) =>
    ({ value: { fontFamily: '{font.family.base}', fontWeight: weight, fontSize: size, lineHeight: '130%', ...extra }, type: 'typography' })
  const data = {
    global: {
      brand: { name: { value: b.nome || 'Empresa Demo', type: 'text' } },
      font: { family: { base: { value: b.fonte, type: 'fontFamilies' } } },
      typography: {
        h1: tipo('28', '700'), h2: tipo('18', '600'),
        label: tipo('12', '600', { letterSpacing: '4%', textCase: 'uppercase' }),
        body: tipo('14', '400'), support: tipo('12', '400'), kpi: tipo('28', '700', { lineHeight: '110%' }),
      },
      radius: { sm: { value: '6', type: 'borderRadius' }, md: { value: '8', type: 'borderRadius' }, lg: { value: '12', type: 'borderRadius' } },
      spacing: { 1: { value: '8', type: 'spacing' }, 2: { value: '16', type: 'spacing' }, 3: { value: '24', type: 'spacing' } },
    },
    light: setTema(derivarTokens(b, 'light')),
    dark: setTema(derivarTokens(b, 'dark')),
    $themes: [
      { id: 'light', name: 'Claro', selectedTokenSets: { global: 'source', light: 'enabled' } },
      { id: 'dark', name: 'Escuro', selectedTokenSets: { global: 'source', dark: 'enabled' } },
    ],
    $metadata: { tokenSetOrder: ['global', 'light', 'dark'] },
  }
  const slug = (b.nome || 'marca').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'marca'
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url; a.download = `tokens-${slug}.json`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
