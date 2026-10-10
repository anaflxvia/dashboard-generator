/* Dados ficticios e fixos para a previa da identidade visual (sem chamar a IA). */
import type { DashboardData, KPI } from '../types'

const KPIS: Record<string, [string, string, string, 'up' | 'down', 'up' | 'down'][]> = {
  // [rotulo, valor, variacao, direcao, sentido favoravel]
  'Financeiro':         [['Receita líquida', 'R$ 4,82 mi', '+6,4%', 'up', 'up'], ['Margem EBITDA', '18,2%', '-1,1 p.p.', 'down', 'up'], ['Despesa operacional', 'R$ 1,37 mi', '-3,8%', 'down', 'down'], ['Inadimplência', '3,4%', '+0,6 p.p.', 'up', 'down']],
  'CRM / Vendas':       [['Receita vs meta', '96,8%', '+4,2 p.p.', 'up', 'up'], ['Taxa de conversão', '12,6%', '+0,9 p.p.', 'up', 'up'], ['Ciclo de vendas', '38 dias', '+3 dias', 'up', 'down'], ['CAC', 'R$ 412', '-5,1%', 'down', 'down']],
  'Recursos Humanos':   [['Headcount ativo', '1.284', '+2,1%', 'up', 'up'], ['Turnover voluntário', '1,9%', '+0,3 p.p.', 'up', 'down'], ['Tempo de contratação', '27 dias', '-4 dias', 'down', 'down'], ['eNPS', '42', '+5', 'up', 'up']],
  'Logística':          [['OTIF', '94,7%', '+1,2 p.p.', 'up', 'up'], ['Lead time médio', '41,5 h', '+6,3%', 'up', 'down'], ['Custo por envio', 'R$ 17,40', '-2,8%', 'down', 'down'], ['Acurácia de inventário', '98,9%', '-0,2 p.p.', 'down', 'up']],
  'SLA / Suporte':      [['SLA cumprido', '93,1%', '-1,4 p.p.', 'down', 'up'], ['Tempo de resolução', '6,2 h', '-8,0%', 'down', 'down'], ['Backlog', '318', '+12,4%', 'up', 'down'], ['CSAT', '4,6', '+0,1', 'up', 'up']],
}
const KPIS_GENERICOS: [string, string, string, 'up' | 'down', 'up' | 'down'][] = [
  ['Indicador principal', '87,4%', '+2,3 p.p.', 'up', 'up'], ['Volume do período', '12.480', '+5,6%', 'up', 'up'],
  ['Custo por operação', 'R$ 23,10', '-1,9%', 'down', 'down'], ['Tempo médio', '3,4 dias', '+0,4 dia', 'up', 'down'],
]

export function dadosExemplo(segmento: string): DashboardData {
  const chave = segmento.normalize('NFD').replace(/[̀-ͯ]/g, '')
  const lista = KPIS[segmento] ?? KPIS[Object.keys(KPIS).find((k) => k.normalize('NFD').replace(/[̀-ͯ]/g, '') === chave) ?? ''] ?? KPIS_GENERICOS
  const kpis: KPI[] = lista.map(([label, value, change, trend, goodWhen]) => ({ label, value, change, trend, goodWhen }))
  const meses = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']
  return {
    title: segmento || 'Dashboard',
    segment: segmento || 'Prévia',
    summary: 'Prévia com dados fictícios. O dashboard final é gerado pela IA com base nas suas respostas.',
    tabs: [
      {
        name: 'Visão geral',
        kpis,
        charts: [
          { title: 'Volume por região', type: 'bar', labels: ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'], datasets: [{ label: 'Volume', data: [8240, 4310, 3980, 2470, 1690] }] },
          { title: `${kpis[0].label}: realizado vs meta`, type: 'line', labels: meses, datasets: [{ label: 'Realizado', data: [88, 90, 89, 92, 93, 95] }, { label: 'Meta', data: [92, 92, 92, 92, 92, 92] }] },
        ],
        tables: [
          {
            title: 'Desempenho por unidade',
            columns: ['Unidade', 'Região', 'Volume', kpis[0].label, 'Status'],
            rows: [
              ['Unidade SE-01', 'Sudeste', '3.120', '96,4%', 'No prazo'],
              ['Unidade S-02', 'Sul', '1.870', '91,2%', 'Em risco'],
              ['Unidade NE-01', 'Nordeste', '1.640', '86,9%', 'Atrasado'],
              ['Unidade CO-03', 'Centro-Oeste', '1.105', '94,8%', 'No prazo'],
            ],
          },
        ],
      },
      { name: 'Operação', kpis, charts: [], tables: [] },
      { name: 'Custos e qualidade', kpis, charts: [], tables: [] },
    ],
  }
}
