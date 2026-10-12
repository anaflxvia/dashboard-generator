// Funcao serverless da Vercel: guarda a chave do Gemini no servidor e exige o codigo de acesso.
// Variaveis (Vercel > Settings > Environment Variables, sem prefixo VITE_):
//   GEMINI_API_KEY  chave do Google AI Studio
//   ACCESS_CODES    um ou mais codigos separados por virgula (ex.: "ana-2026,cliente-abc")
import { timingSafeEqual } from 'node:crypto'

const MODELOS_GERAR = ['gemini-3.8-flash', 'gemini-3.6-flash']
const MODELOS_EMBED = ['text-embedding-004', 'embedding-001']
const MAX_BYTES = 200_000

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function codigoValido(enviado: string, aceitos: string[]): boolean {
  const a = Buffer.from(enviado)
  // compara com todos para nao vazar qual bateu pelo tempo de resposta
  let ok = false
  for (const c of aceitos) {
    const b = Buffer.from(c)
    if (a.length === b.length && timingSafeEqual(a, b)) ok = true
  }
  return ok
}

export async function POST(request: Request): Promise<Response> {
  const aceitos = (process.env.ACCESS_CODES ?? '').split(',').map((c) => c.trim()).filter(Boolean)
  const chave = process.env.GEMINI_API_KEY
  if (aceitos.length === 0 || !chave) {
    return json({ error: { message: 'Servidor sem configuração: defina GEMINI_API_KEY e ACCESS_CODES na Vercel.' } }, 503)
  }

  const enviado = (request.headers.get('x-codigo-acesso') ?? '').trim()
  if (!enviado || !codigoValido(enviado, aceitos)) {
    // atrasa cada erro: um codigo curto fica caro de adivinhar por tentativa e erro
    await new Promise((r) => setTimeout(r, 1500))
    return json({ error: { message: 'Código de acesso inválido.' } }, 401)
  }

  const texto = await request.text()
  if (texto.length > MAX_BYTES) return json({ error: { message: 'Pedido grande demais.' } }, 413)

  let pedido: { kind?: string; model?: string; payload?: unknown }
  try {
    pedido = JSON.parse(texto)
  } catch {
    return json({ error: { message: 'Pedido inválido.' } }, 400)
  }

  // so confirma o codigo (usado pela tela de acesso)
  if (pedido.kind === 'check') return json({ ok: true })

  const metodo = pedido.kind === 'generate' ? 'generateContent' : pedido.kind === 'embed' ? 'embedContent' : null
  const permitidos = pedido.kind === 'generate' ? MODELOS_GERAR : MODELOS_EMBED
  if (!metodo || !pedido.model || !permitidos.includes(pedido.model)) {
    return json({ error: { message: 'Modelo ou ação não permitidos.' } }, 400)
  }

  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${pedido.model}:${metodo}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify(pedido.payload ?? {}),
    },
  )
  // devolve status e corpo do Gemini como vieram: o app ja trata 404, 429 e 503
  return new Response(await resposta.text(), {
    status: resposta.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
