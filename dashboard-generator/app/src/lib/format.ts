const nf = (max: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: max })

// numero curto em pt-BR, com a unidade no lugar certo: "R$ 1,2 mi", "92,5%", "1.240 viagens"
export function formatValue(n: number, unit?: string): string {
  if (!Number.isFinite(n)) return '-'
  const abs = Math.abs(n)
  let num: string
  if (unit === '%') num = nf(1).format(n)
  else if (abs >= 1e9) num = `${nf(1).format(n / 1e9)} bi`
  else if (abs >= 1e6) num = `${nf(1).format(n / 1e6)} mi`
  else if (abs >= 1e4) num = `${nf(1).format(n / 1e3)} mil`
  else num = nf(abs < 10 ? 2 : abs < 100 ? 1 : 0).format(n)

  if (!unit) return num
  if (unit === 'R$') return `R$ ${num}`
  if (unit === '%') return `${num}%`
  return `${num} ${unit}`
}
