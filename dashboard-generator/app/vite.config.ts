import { defineConfig, type Plugin } from 'vite'
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

// O app React fica em afkview.com/dashboard-generator (base + outDir).
export default defineConfig({
  base: '/dashboard-generator/',
  plugins: [react(), tailwindcss(), landing()],
  build: { outDir: 'dist/dashboard-generator', emptyOutDir: true },
})
