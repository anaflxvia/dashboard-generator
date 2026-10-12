// Codigo de acesso do gerador. A chave do Gemini fica no servidor (api/gemini.ts);
// o navegador so guarda o codigo digitado.
const CHAVE = 'dashboard_codigo_acesso'

export class ErroAcesso extends Error {
  constructor(mensagem = 'Código de acesso inválido.') {
    super(mensagem)
    this.name = 'ErroAcesso'
  }
}

export function codigoSalvo(): string {
  try { return localStorage.getItem(CHAVE) ?? '' } catch { return '' }
}

export function salvarCodigo(codigo: string): void {
  try { localStorage.setItem(CHAVE, codigo) } catch { /* sem storage: o codigo vale so ate recarregar */ }
}

export function limparCodigo(): void {
  try { localStorage.removeItem(CHAVE) } catch { /* ignora */ }
}

type Pedido =
  | { kind: 'check' }
  | { kind: 'generate' | 'embed'; model: string; payload: unknown }

// caminho absoluto: o app roda em /dashboard-generator/, a funcao em /api/gemini
export async function chamarServidor(pedido: Pedido, codigo = codigoSalvo()): Promise<Response> {
  const resposta = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-codigo-acesso': codigo },
    body: JSON.stringify(pedido),
  })
  if (resposta.status === 401) {
    limparCodigo()
    throw new ErroAcesso()
  }
  return resposta
}

export async function validarCodigo(codigo: string): Promise<boolean> {
  try {
    const r = await chamarServidor({ kind: 'check' }, codigo)
    if (r.status === 503) throw new Error('Acesso ainda não configurado no servidor (faltam GEMINI_API_KEY e ACCESS_CODES na Vercel).')
    return r.ok
  } catch (e) {
    if (e instanceof ErroAcesso) return false
    throw e
  }
}
