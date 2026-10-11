import brazilMap from '@svg-maps/brazil'

// Mapa dos estados: @svg-maps/brazil (CC BY 4.0, Victor Cazanave).
// Os paths usam so "m" relativo (com lineto implicito) e "z"; o centroide de cada
// estado e calculado uma vez, no carregamento, para ancorar rotas e marcadores.

export interface Estado {
  uf: string // sigla em maiusculas
  nome: string
  path: string
  cx: number
  cy: number
}

interface MapaSvg {
  viewBox: string
  locations: Array<{ id: string; name: string; path: string }>
}

const mapa = brazilMap as unknown as MapaSvg

export const VIEWBOX = mapa.viewBox

function centroide(path: string): [number, number] {
  const tokens = path.match(/[mzMZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  const subpaths: Array<Array<[number, number]>> = []
  let atual: Array<[number, number]> = []
  let x = 0
  let y = 0
  let sx = 0
  let sy = 0
  let relativo = true
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (t === 'm' || t === 'M') {
      const dx = Number(tokens[i + 1])
      const dy = Number(tokens[i + 2])
      i += 3
      relativo = t === 'm'
      x = relativo ? x + dx : dx
      y = relativo ? y + dy : dy
      sx = x
      sy = y
      atual = [[x, y]]
      subpaths.push(atual)
      continue
    }
    if (t === 'z' || t === 'Z') {
      x = sx
      y = sy
      i += 1
      continue
    }
    const dx = Number(t)
    const dy = Number(tokens[i + 1])
    i += 2
    x = relativo ? x + dx : dx
    y = relativo ? y + dy : dy
    atual.push([x, y])
  }

  // centroide de area do maior poligono (ilhas pequenas nao puxam o ponto)
  let melhor: [number, number] = [0, 0]
  let maiorArea = -1
  for (const pts of subpaths) {
    let a = 0
    let cx = 0
    let cy = 0
    for (let k = 0; k < pts.length; k++) {
      const [x0, y0] = pts[k]
      const [x1, y1] = pts[(k + 1) % pts.length]
      const f = x0 * y1 - x1 * y0
      a += f
      cx += (x0 + x1) * f
      cy += (y0 + y1) * f
    }
    if (Math.abs(a) > maiorArea && a !== 0) {
      maiorArea = Math.abs(a)
      melhor = [cx / (3 * a), cy / (3 * a)]
    }
  }
  return melhor
}

export const ESTADOS: Estado[] = mapa.locations.map((l) => {
  const [cx, cy] = centroide(l.path)
  return { uf: l.id.toUpperCase(), nome: l.name, path: l.path, cx, cy }
})

const POR_UF = new Map(ESTADOS.map((e) => [e.uf, e]))

const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const POR_NOME = new Map(ESTADOS.map((e) => [semAcento(e.nome), e]))

// aceita "SP", "sp", "São Paulo", "Sao Paulo" e "SP - São Paulo"
export function acharEstado(valor: string | undefined): Estado | undefined {
  if (!valor) return undefined
  const v = valor.trim()
  const sigla = v.slice(0, 2).toUpperCase()
  if (POR_UF.has(sigla) && (v.length === 2 || /^[A-Za-z]{2}\b/.test(v))) return POR_UF.get(sigla)
  return POR_NOME.get(semAcento(v))
}
