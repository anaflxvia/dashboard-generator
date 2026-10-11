import { useMemo, useState, type ChangeEvent } from 'react'
import {
  DEFAULT_BRAND,
  brandStyle,
  checkContrast,
  deriveTokens,
  isHex,
  saveBrand,
  type Brand,
} from '../lib/brand'

const LOGO_TYPES = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
const LOGO_MAX_BYTES = 512 * 1024
const LOGO_MIN_PX = 32
const LOGO_MAX_PX = 2048

const COLOR_FIELDS: Array<{ key: keyof Brand; label: string; hint: string }> = [
  { key: 'primary',    label: 'Primária',   hint: 'Botões, aba ativa, série principal dos gráficos' },
  { key: 'secondary',  label: 'Secundária', hint: 'Segunda série dos gráficos e destaques' },
  { key: 'background', label: 'Fundo',      hint: 'Fundo da página' },
  { key: 'surface',    label: 'Superfície', hint: 'Cards, sidebar, header e tabelas' },
  { key: 'text',       label: 'Texto',      hint: 'Texto principal (o secundário é derivado)' },
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!LOGO_TYPES.includes(file.type)) {
      reject(new Error('Formato não suportado. Use PNG, SVG, JPG ou WebP.'))
      return
    }
    if (file.size > LOGO_MAX_BYTES) {
      reject(new Error(`Arquivo muito grande (${Math.round(file.size / 1024)} KB). Máximo: 512 KB.`))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.onload = () => {
      const url = reader.result as string
      const img = new Image()
      img.onerror = () => reject(new Error('A imagem está corrompida ou não pôde ser exibida.'))
      img.onload = () => {
        // SVG sem width/height declarados vem com 0x0 — escala livre, aceita
        const { naturalWidth: w, naturalHeight: h } = img
        if (file.type !== 'image/svg+xml' || (w && h)) {
          if (w < LOGO_MIN_PX || h < LOGO_MIN_PX) {
            reject(new Error(`Imagem pequena demais (${w}×${h}). Mínimo: ${LOGO_MIN_PX}×${LOGO_MIN_PX} px.`))
            return
          }
          if (w > LOGO_MAX_PX || h > LOGO_MAX_PX) {
            reject(new Error(`Imagem grande demais (${w}×${h}). Máximo: ${LOGO_MAX_PX} px por lado.`))
            return
          }
        }
        resolve(url)
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  })
}

/* ── Preview ao vivo: miniatura do dashboard com as cores da marca ── */
function LivePreview({ brand }: { brand: Brand }) {
  const tokens = deriveTokens(brand)
  const bars = [55, 72, 48, 86, 64, 92]

  return (
    <div
      style={brandStyle(tokens)}
      className="rounded-xl overflow-hidden border border-(--brand-border) bg-(--brand-bg) flex h-80 text-(--brand-text)"
      aria-label="Preview do dashboard com a marca"
    >
      <div className="w-36 bg-(--brand-surface) border-r border-(--brand-border) p-2.5 flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center gap-2 pb-2.5 mb-1 border-b border-(--brand-border)">
          {brand.logo ? (
            <img src={brand.logo} alt="" className="h-6 max-w-full object-contain" />
          ) : (
            <div className="w-6 h-6 rounded-md bg-(--brand-primary) text-(--brand-on-primary) text-[9px] font-bold flex items-center justify-center">AI</div>
          )}
          {!brand.logo && <span className="text-[11px] font-semibold truncate">{brand.name || 'Sua marca'}</span>}
        </div>
        {['Visão geral', 'Receita', 'Clientes'].map((t, i) => (
          <div
            key={t}
            className={`text-[11px] px-2 py-1.5 rounded-md ${i === 0 ? 'bg-(--brand-primary) text-(--brand-on-primary)' : 'text-(--brand-muted)'}`}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Visão geral</span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-(--brand-primary) text-(--brand-on-primary)">Exportar</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['Receita', 'R$ 1,2M'], ['Clientes', '8.430'], ['NPS', '72']].map(([l, v]) => (
            <div key={l} className="bg-(--brand-surface) border border-(--brand-border) rounded-lg p-2">
              <p className="text-[9px] uppercase tracking-wide text-(--brand-muted)">{l}</p>
              <p className="text-sm font-bold">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-(--brand-surface) border border-(--brand-border) rounded-lg p-2.5 flex flex-col">
          <p className="text-[10px] text-(--brand-muted) mb-2">Receita mensal</p>
          <div className="flex-1 flex items-end gap-1.5">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex items-end gap-0.5 h-full">
                <div className="flex-1 rounded-t-sm bg-(--brand-primary)" style={{ height: `${h}%` }} />
                <div className="flex-1 rounded-t-sm bg-(--brand-secondary)" style={{ height: `${h * 0.7}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  initial: Brand
  onSaved: (brand: Brand) => void
  onBack: () => void
}

export default function BrandSettings({ initial, onSaved, onBack }: Props) {
  const [brand, setBrand] = useState<Brand>(initial)
  // valor digitado no campo hex, que pode estar incompleto enquanto a pessoa digita
  const [hexDraft, setHexDraft] = useState<Partial<Record<keyof Brand, string>>>({})
  const [logoError, setLogoError] = useState<string | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const checks = useMemo(() => checkContrast(brand), [brand])
  const blocked = checks.some((c) => c.blocking && !c.ok)
  const dirty = JSON.stringify(brand) !== JSON.stringify(initial)

  function update(patch: Partial<Brand>) {
    setBrand((b) => ({ ...b, ...patch }))
    setStatus('idle')
  }

  function setColor(key: keyof Brand, value: string) {
    setHexDraft((d) => ({ ...d, [key]: value }))
    if (isHex(value)) update({ [key]: value.toLowerCase() })
  }

  async function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reenviar o mesmo arquivo
    if (!file) return
    try {
      const url = await readLogo(file)
      setLogoError(null)
      update({ logo: url })
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Arquivo inválido.')
    }
  }

  function handleSave() {
    if (blocked) return
    setStatus('saving')
    setSaveError(null)
    // deixa o estado "Salvando..." pintar antes do trabalho síncrono
    requestAnimationFrame(() => {
      try {
        saveBrand(brand)
        setStatus('saved')
        onSaved(brand)
      } catch {
        setStatus('error')
        setSaveError('Não foi possível salvar. O armazenamento do navegador pode estar cheio ou bloqueado — tente um logo menor.')
      }
    })
  }

  function handleReset() {
    setBrand(DEFAULT_BRAND)
    setHexDraft({})
    setLogoError(null)
    setStatus('idle')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded focus-visible:outline-2 focus-visible:outline-indigo-500"
          aria-label="Voltar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-white font-semibold text-sm">Identidade visual</h1>
          <p className="text-slate-500 text-xs">Aplicada a todos os dashboards gerados</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8">
          {/* Formulário */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Marca</h2>
              <label className="block text-sm text-slate-300 mb-1.5" htmlFor="brand-name">Nome</label>
              <input
                id="brand-name"
                value={brand.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ex.: Acme Analytics"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500"
              />

              <p className="text-sm text-slate-300 mt-5 mb-1.5">Logo</p>
              <div className="flex items-center gap-4">
                <div className="w-28 h-16 rounded-lg border border-dashed border-slate-700 flex items-center justify-center p-2 bg-slate-900">
                  {brand.logo
                    ? <img src={brand.logo} alt="Logo atual" className="max-h-full max-w-full object-contain" />
                    : <span className="text-xs text-slate-600">Sem logo</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex px-3 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200 hover:border-slate-500 focus-within:outline-2 focus-within:outline-indigo-500">
                    Enviar arquivo
                    <input type="file" accept={LOGO_TYPES.join(',')} onChange={handleLogo} className="sr-only" />
                  </label>
                  {brand.logo && (
                    <button onClick={() => update({ logo: null })} className="text-xs text-slate-500 hover:text-slate-300 text-left">
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">PNG, SVG, JPG ou WebP · até 512 KB · de 32 a 2048 px por lado. Prefira logo horizontal com fundo transparente.</p>
              {logoError && <p role="alert" className="text-xs text-red-400 mt-2">{logoError}</p>}
            </section>

            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Cores</h2>
              <div className="space-y-3">
                {COLOR_FIELDS.map(({ key, label, hint }) => {
                  const draft = hexDraft[key] ?? (brand[key] as string)
                  const invalid = !isHex(draft)
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brand[key] as string}
                        onChange={(e) => setColor(key, e.target.value)}
                        aria-label={`${label} — seletor`}
                        className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200">{label}</p>
                        <p className="text-xs text-slate-500 truncate">{hint}</p>
                      </div>
                      <input
                        value={draft}
                        onChange={(e) => setColor(key, e.target.value.trim())}
                        aria-label={`${label} — hexadecimal`}
                        aria-invalid={invalid}
                        maxLength={7}
                        className={`w-24 bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none ${
                          invalid ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>
            </section>

            <section aria-live="polite">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Contraste (WCAG 2.1 AA)</h2>
              <ul className="divide-y divide-slate-800 border border-slate-800 rounded-lg">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-3 px-3 py-2 text-xs">
                    <span
                      className={`w-14 text-center px-1.5 py-0.5 rounded font-medium border ${
                        c.ok
                          ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50'
                          : c.blocking
                          ? 'bg-red-900/40 text-red-400 border-red-800/50'
                          : 'bg-amber-900/40 text-amber-400 border-amber-800/50'
                      }`}
                    >
                      {c.ok ? 'Passa' : c.blocking ? 'Falha' : 'Atenção'}
                    </span>
                    <span className="flex-1 text-slate-300">{c.label}</span>
                    <span className="font-mono text-slate-400">{c.ratio.toFixed(2)}:1</span>
                    <span className="text-slate-600 w-14 text-right">mín {c.min}:1</span>
                  </li>
                ))}
              </ul>
              {blocked && (
                <p className="text-xs text-red-400 mt-2">
                  Ajuste as combinações marcadas como “Falha” para salvar. Texto abaixo de 4.5:1 fica ilegível para parte dos usuários.
                </p>
              )}
            </section>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={blocked || status === 'saving' || (!dirty && status !== 'error')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                {status === 'saving' ? 'Salvando...' : 'Salvar marca'}
              </button>
              <button onClick={handleReset} className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white">
                Restaurar padrão
              </button>
              <span role="status" className="text-xs ml-auto">
                {status === 'saved' && <span className="text-emerald-400">Marca salva</span>}
                {status === 'error' && <span className="text-red-400">{saveError}</span>}
                {status === 'idle' && dirty && <span className="text-slate-500">Alterações não salvas</span>}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 self-start">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Preview ao vivo</h2>
            <LivePreview brand={brand} />
          </div>
        </div>
      </main>
    </div>
  )
}
