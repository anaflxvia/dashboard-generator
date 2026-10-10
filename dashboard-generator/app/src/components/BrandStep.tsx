import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import Dashboard from './Dashboard'
import { dadosExemplo } from '../lib/dadosExemplo'
import {
  type Brand, type CoresTema, type Modo,
  BRAND_CORES, BRAND_FONTES, BRAND_PRESETS,
  checagensContraste, exportarTokens, hexValido, lerLogo,
} from '../lib/brand'

interface Props {
  brand: Brand
  setBrand: Dispatch<SetStateAction<Brand>>
  segmento: string
}

const rotulo = 'block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2'

export default function BrandStep({ brand, setBrand, segmento }: Props) {
  const [editando, setEditando] = useState<Modo>(brand.tema)
  const [hexDigitado, setHexDigitado] = useState<Partial<Record<keyof CoresTema, string>>>({})
  const [erroLogo, setErroLogo] = useState('')
  const [arrastando, setArrastando] = useState(false)
  const inputLogo = useRef<HTMLInputElement>(null)

  const amostra = useMemo(() => dadosExemplo(segmento), [segmento])
  const checagens = useMemo(() => checagensContraste(brand), [brand])
  const marcaPrevia = useMemo(() => ({ ...brand, ativo: true }), [brand])

  const atualizar = (parcial: Partial<Brand>) => setBrand((b) => ({ ...b, ...parcial }))

  function mudarCor(key: keyof CoresTema, valor: string) {
    setBrand((b) => ({ ...b, preset: '', [editando]: { ...b[editando], [key]: valor.toLowerCase() } }))
  }

  function aplicarPreset(id: string) {
    const p = BRAND_PRESETS[id]
    setHexDigitado({})
    atualizar({ preset: id, light: { ...p.light }, dark: { ...p.dark } })
  }

  async function receberArquivo(f?: File) {
    setErroLogo('')
    if (!f) return
    try { atualizar({ logo: await lerLogo(f) }) }
    catch (e) { setErroLogo(e instanceof Error ? e.message : 'Não foi possível ler a imagem.') }
  }

  if (!brand.ativo) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-slate-800/50 border border-dashed border-slate-700 rounded-xl">
        <p className="flex-1 text-slate-400 text-sm leading-relaxed">
          Use o logo e as cores da empresa. A prévia mostra a marca em tempo real e o dashboard gerado segue os mesmos tokens, nos temas claro e escuro.
        </p>
        <button
          type="button"
          onClick={() => atualizar({ ativo: true })}
          className="shrink-0 border border-slate-600 hover:border-indigo-500 hover:text-white text-slate-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Personalizar marca
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
      {/* ── Controles ── */}
      <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <label className={rotulo} htmlFor="brand-nome">Nome da empresa</label>
          <input
            id="brand-nome"
            value={brand.nome}
            maxLength={60}
            onChange={(e) => atualizar({ nome: e.target.value })}
            placeholder="Ex: Transportadora Rota Norte"
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-slate-200 placeholder-slate-500 text-sm outline-none transition-colors"
          />
        </div>

        <div>
          <span className={rotulo}>Logotipo <span className="normal-case tracking-normal font-normal text-slate-600">PNG, JPG, SVG ou WebP até 2 MB</span></span>
          <div
            role="button"
            tabIndex={0}
            aria-label="Enviar logotipo"
            onClick={() => inputLogo.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputLogo.current?.click() } }}
            onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => { e.preventDefault(); setArrastando(false); receberArquivo(e.dataTransfer.files[0]) }}
            className={`flex items-center gap-3 min-h-[52px] px-3 py-2 bg-slate-800 border border-dashed rounded-lg cursor-pointer transition-colors ${arrastando ? 'border-indigo-500' : 'border-slate-700 hover:border-indigo-500'}`}
          >
            {brand.logo && <img src={brand.logo} alt="" className="max-h-8 max-w-[110px] object-contain rounded" />}
            <span className="flex-1 text-sm text-slate-500">{brand.logo ? 'Trocar logotipo' : 'Clique ou arraste o arquivo aqui'}</span>
            {brand.logo && (
              <button type="button" onClick={(e) => { e.stopPropagation(); atualizar({ logo: '' }) }} className="text-xs text-slate-500 hover:text-red-400 underline">
                Remover
              </button>
            )}
          </div>
          <input
            ref={inputLogo}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={(e) => { receberArquivo(e.target.files?.[0]); e.target.value = '' }}
          />
          {erroLogo && <p className="text-red-400 text-xs mt-2">{erroLogo}</p>}
        </div>

        <div>
          <span className={rotulo}>Paletas de partida</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BRAND_PRESETS).map(([id, p]) => (
              <button
                key={id}
                type="button"
                onClick={() => aplicarPreset(id)}
                className={`inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border text-xs transition-colors ${
                  brand.preset === id ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200' : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                <span className="inline-flex">
                  {[p.light.primary, p.light.secondary, p.dark.background].map((c, i) => (
                    <span key={i} className="w-3 h-3 rounded-full border border-black/30 -ml-0.5 first:ml-0" style={{ background: c }} />
                  ))}
                </span>
                {p.nome}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex p-0.5 bg-slate-800 border border-slate-700 rounded-lg" role="tablist" aria-label="Tema que está sendo editado">
              {(['light', 'dark'] as Modo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={editando === m}
                  onClick={() => { setEditando(m); setHexDigitado({}) }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${editando === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {m === 'light' ? 'Tema claro' : 'Tema escuro'}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">Cores do tema {editando === 'light' ? 'claro' : 'escuro'}</span>
          </div>
          <div className="space-y-2">
            {BRAND_CORES.map((c) => {
              const valor = brand[editando][c.key]
              const texto = hexDigitado[c.key] ?? valor.toUpperCase()
              return (
                <div key={c.key} className="flex items-center gap-3 px-3 py-2 bg-slate-800 border border-slate-700/60 rounded-lg">
                  <input
                    type="color"
                    value={valor}
                    aria-label={c.nome}
                    onChange={(e) => { setHexDigitado((h) => ({ ...h, [c.key]: undefined })); mudarCor(c.key, e.target.value) }}
                    className="w-9 h-9 shrink-0 rounded-md border border-slate-600 bg-transparent cursor-pointer p-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium">{c.nome}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.uso}</p>
                  </div>
                  <input
                    value={texto}
                    maxLength={7}
                    spellCheck={false}
                    aria-label={`${c.nome} em hexadecimal`}
                    onChange={(e) => {
                      let v = e.target.value.trim()
                      if (v && v[0] !== '#') v = '#' + v
                      setHexDigitado((h) => ({ ...h, [c.key]: v.toUpperCase() }))
                      if (hexValido(v)) mudarCor(c.key, v)
                    }}
                    onBlur={() => setHexDigitado((h) => ({ ...h, [c.key]: undefined }))}
                    className={`w-[86px] bg-slate-900 border rounded-md px-2 py-1.5 font-mono text-xs text-slate-200 uppercase outline-none ${
                      hexValido(texto) ? 'border-slate-700 focus:border-indigo-500' : 'border-red-500'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={rotulo}>Tema inicial</span>
            <select
              value={brand.tema}
              onChange={(e) => { const m = e.target.value as Modo; atualizar({ tema: m }); setEditando(m) }}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </label>
          <label className="block">
            <span className={rotulo}>Fonte</span>
            <select
              value={brand.fonte}
              onChange={(e) => atualizar({ fonte: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none"
            >
              {BRAND_FONTES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
        </div>

        <div>
          <span className={rotulo}>Contraste (WCAG)</span>
          <ul className="space-y-1.5">
            {checagens.map((c, i) => {
              const ok = c.razao >= c.minimo
              return (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-400" title={`Mínimo ${String(c.minimo).replace('.', ',')}:1`}>
                  <span className={`w-[18px] h-[18px] shrink-0 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${ok ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/40 text-amber-400'}`}>
                    {ok ? '✓' : '!'}
                  </span>
                  <span>{c.tema}: {c.nome}</span>
                  <span className="ml-auto font-mono text-slate-500">{c.razao.toFixed(1).replace('.', ',')}:1</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button type="button" onClick={() => exportarTokens(brand)} className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors">
            Exportar tokens (Figma)
          </button>
          <button type="button" onClick={() => atualizar({ ativo: false })} className="ml-auto text-xs text-slate-500 hover:text-red-400 underline">
            Não usar identidade visual
          </button>
        </div>
      </div>

      {/* ── Previa ao vivo ── */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
          Prévia ao vivo no tema {editando === 'light' ? 'claro' : 'escuro'}. Dados fictícios.
        </div>
        <Dashboard data={amostra} brand={marcaPrevia} embedded modo={editando} onBack={() => undefined} />
      </div>
    </div>
  )
}
