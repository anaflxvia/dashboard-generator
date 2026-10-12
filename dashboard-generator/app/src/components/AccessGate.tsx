import { useState, type FormEvent } from 'react'
import { salvarCodigo, validarCodigo } from '../services/acesso'

interface Props {
  onGranted: () => void
  aviso?: string | null
}

// Tela do codigo de acesso: o gerador usa a chave do Gemini do servidor, entao so abre com um codigo valido.
export default function AccessGate({ onGranted, aviso }: Props) {
  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [erro, setErro] = useState<string | null>(aviso ?? null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const limpo = codigo.trim()
    if (!limpo) { setErro('Digite o código de acesso.'); return }
    setVerificando(true)
    setErro(null)
    try {
      if (await validarCodigo(limpo)) {
        salvarCodigo(limpo)
        onGranted()
      } else {
        setErro('Código inválido. Confira com quem enviou o convite.')
      }
    } catch {
      setErro('Não consegui falar com o servidor. Tente de novo em instantes.')
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <form onSubmit={enviar} className="w-full max-w-sm" noValidate>
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mb-6">AI</div>
        <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Gerador de dashboards</h1>
        <p className="text-slate-400 text-sm mb-6">Acesso por convite. Digite o código que você recebeu para continuar.</p>

        <label htmlFor="codigo" className="block text-slate-300 text-xs mb-1.5">Código de acesso</label>
        <input
          id="codigo"
          type="password"
          autoComplete="off"
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          aria-invalid={!!erro}
          aria-describedby={erro ? 'codigo-erro' : undefined}
          className="w-full px-3 h-11 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
        {erro && <p id="codigo-erro" role="alert" className="text-red-400 text-xs mt-2">{erro}</p>}

        <button
          type="submit"
          disabled={verificando}
          className="w-full h-11 mt-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors"
        >
          {verificando ? 'Verificando...' : 'Entrar'}
        </button>
        <p className="text-slate-500 text-xs mt-6">
          Sem código? <a className="text-slate-300 underline" href="/home#ki-form">Fale comigo</a>. Os exemplos continuam abertos em{' '}
          <a className="text-slate-300 underline" href="?demo=vendas">uma demo</a>.
        </p>
      </form>
    </div>
  )
}
