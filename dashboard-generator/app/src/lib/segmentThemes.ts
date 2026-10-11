import type { Brand } from './brand'

// Tema padrao de cada segmento, usado quando o usuario nao salvou uma identidade visual.
// Gerados com a skill ui-ux-pro-max (search.py --design-system --density 8) e ajustados para
// as regras do app: verde e vermelho sao cores de status, contraste WCAG AA, uma fonte por marca.
// Origem e ajustes de cada um: docs/design-systems-segmentos.md. O frontend/app.html tem a mesma tabela
// (TEMAS_SEGMENTO), com as versoes clara e escura; ao mudar aqui, atualize la.
export interface TemaSegmento {
  estilo: string // nome do estilo na skill
  ajuste: string // o que foi alterado em relacao a sugestao da skill
  brand: Brand
}

export const TEMAS_SEGMENTO: Record<string, TemaSegmento> = {
  'Financeiro': {
    estilo: 'Dark Mode (OLED)',
    ajuste: 'verde de destaque trocado pelo dourado da paleta Fintech (verde e cor de status)',
    brand: { name: '', logo: null, primary: '#F59E0B', secondary: '#A78BFA', background: '#020617', surface: '#0E1223', text: '#F8FAFC', font: 'Fira Sans' },
  },
  'CRM / Vendas': {
    estilo: 'Flat Design',
    ajuste: 'secundaria em ciano: a da skill era quase igual a primaria e o verde e de status',
    brand: { name: '', logo: null, primary: '#2563EB', secondary: '#0891B2', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', font: 'Plus Jakarta Sans' },
  },
  'Recursos Humanos': {
    estilo: 'Data-Dense Dashboard',
    ajuste: 'texto um tom mais escuro para o secundario passar 4,5:1',
    brand: { name: '', logo: null, primary: '#1E40AF', secondary: '#D97706', background: '#F8FAFC', surface: '#FFFFFF', text: '#172554', font: 'Inter' },
  },
  'Advocacia': {
    estilo: 'Accessible & Ethical',
    ajuste: 'so a fonte de texto (Lato); EB Garamond dos titulos fica de fora porque a marca tem uma fonte',
    brand: { name: '', logo: null, primary: '#1E3A8A', secondary: '#B45309', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', font: 'Lato' },
  },
  'Observabilidade TI': {
    estilo: 'Glassmorphism',
    ajuste: 'primaria da skill (#1E293B) some no fundo escuro e o verde e de status: ciano e lilas; sem efeitos de vidro',
    brand: { name: '', logo: null, primary: '#38BDF8', secondary: '#A78BFA', background: '#0F172A', surface: '#1B2336', text: '#F8FAFC', font: 'Fira Sans' },
  },
  'FinOps': {
    estilo: 'Minimalism & Swiss Style',
    ajuste: '-',
    brand: { name: '', logo: null, primary: '#2563EB', secondary: '#EA580C', background: '#F8FAFC', surface: '#FFFFFF', text: '#1E293B', font: 'Fira Sans' },
  },
  'Gerencial / PMO': {
    estilo: 'Flat Design',
    ajuste: 'primaria e texto um tom mais escuros (contraste do botao e do texto secundario); verde de destaque trocado por ciano',
    brand: { name: '', logo: null, primary: '#4F46E5', secondary: '#0891B2', background: '#EEF2FF', surface: '#FFFFFF', text: '#1E1B4B', font: 'Space Grotesk' },
  },
  'Jurídico': {
    estilo: 'Accessible & Ethical',
    ajuste: 'mesmo design system de Advocacia',
    brand: { name: '', logo: null, primary: '#1E3A8A', secondary: '#B45309', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', font: 'Lato' },
  },
  'Educação': {
    estilo: 'Claymorphism',
    ajuste: 'Comic Neue (texto) descartada por legibilidade em tabelas; fica so Baloo 2',
    brand: { name: '', logo: null, primary: '#4F46E5', secondary: '#EA580C', background: '#EEF2FF', surface: '#FFFFFF', text: '#1E1B4B', font: 'Baloo 2' },
  },
  'Logística': {
    estilo: 'HUD / Sci-Fi FUI',
    ajuste: 'verde terminal (#00FF41) trocado por ciano: verde e cor de status',
    brand: { name: '', logo: null, primary: '#22D3EE', secondary: '#F59E0B', background: '#0D1117', surface: '#182424', text: '#E6EDF3', font: 'Fira Sans' },
  },
  'SLA / Suporte': {
    estilo: 'Dark Mode (OLED)',
    ajuste: 'verde operacional e vermelho de incidente ficam so para status; azul e ambar nas series',
    brand: { name: '', logo: null, primary: '#60A5FA', secondary: '#FBBF24', background: '#0F172A', surface: '#111827', text: '#F8FAFC', font: 'Fira Sans' },
  },
  'Outro': {
    estilo: 'Data-Dense Dashboard',
    ajuste: 'texto um tom mais escuro para o secundario passar 4,5:1',
    brand: { name: '', logo: null, primary: '#1E40AF', secondary: '#D97706', background: '#F8FAFC', surface: '#FFFFFF', text: '#172554', font: 'Fira Sans' },
  },
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const POR_CHAVE = new Map(Object.entries(TEMAS_SEGMENTO).map(([k, v]) => [semAcento(k), v]))

// aceita o segmento com ou sem acento ("Logistica" ou "Logística"); desconhecido usa "Outro"
export function temaDoSegmento(segmento: string | undefined): TemaSegmento {
  return POR_CHAVE.get(semAcento(segmento ?? '')) ?? TEMAS_SEGMENTO['Outro']
}
