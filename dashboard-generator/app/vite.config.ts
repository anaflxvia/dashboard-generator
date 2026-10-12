import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('.', import.meta.url))
const pastaLanding = resolve(raiz, 'landing')

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

// Landing page da consultoria (afkview.com/home): HTML estatico em landing/.
// No build vai para dist/home; no dev e servida pelo proprio servidor do Vite.
function landing(): Plugin {
  return {
    name: 'landing-home',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        if (url === '/') {
          res.statusCode = 302
          res.setHeader('Location', '/home')
          res.end()
          return
        }
        if (url !== '/home' && !url.startsWith('/home/')) return next()
        const rel = url === '/home' || url === '/home/' ? 'index.html' : url.slice('/home/'.length)
        const arquivo = resolve(pastaLanding, rel)
        if (!arquivo.startsWith(pastaLanding) || !existsSync(arquivo) || !statSync(arquivo).isFile()) return next()
        res.setHeader('Content-Type', TIPOS[extname(arquivo)] ?? 'application/octet-stream')
        res.end(readFileSync(arquivo))
      })
    },
    closeBundle() {
      const destino = join(raiz, 'dist', 'home')
      rmSync(destino, { recursive: true, force: true })
      cpSync(pastaLanding, destino, { recursive: true })
    },
  }
}

// Em desenvolvimento, atende /api/gemini com o mesmo arquivo da Vercel (api/gemini.ts),
// lendo GEMINI_API_KEY e ACCESS_CODES do .env.
function apiLocal(): Plugin {
  return {
    name: 'api-local',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', raiz, ''))
      server.middlewares.use('/api/gemini', async (req, res) => {
        try {
          const partes: Buffer[] = []
          for await (const p of req) partes.push(p as Buffer)
          const pedido = new Request('http://localhost/api/gemini', {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'POST' ? Buffer.concat(partes) : undefined,
          })
          const { POST } = await server.ssrLoadModule('/api/gemini.ts') as { POST: (r: Request) => Promise<Response> }
          const resposta = req.method === 'POST' ? await POST(pedido) : new Response(null, { status: 405 })
          res.statusCode = resposta.status
          resposta.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await resposta.arrayBuffer()))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: { message: e instanceof Error ? e.message : 'Erro na API local' } }))
        }
      })
    },
  }
}

// O app React fica em afkview.com/dashboard-generator (base + outDir).
export default defineConfig({
  base: '/dashboard-generator/',
  plugins: [react(), tailwindcss(), landing(), apiLocal()],
  build: { outDir: 'dist/dashboard-generator', emptyOutDir: true },
})
