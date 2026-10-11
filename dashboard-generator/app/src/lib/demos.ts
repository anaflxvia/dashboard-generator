import type { DashboardData } from '../types'
import type { Brand } from './brand'
import { EXEMPLO_LOGISTICA } from './exemplos'

// Demos abertas por ?demo=<chave>. Cada uma pode trazer a propria marca, aplicada so
// enquanto a demo esta aberta (nao sobrescreve a identidade visual salva).
// As marcas de financeiro, vendas e rh vieram da skill ui-ux-pro-max
// (search.py --design-system, densidade 8), com os ajustes anotados em cada uma.
export interface Demo {
  data: DashboardData
  brand?: Brand
}

/* ── Financeiro: estilo "Dark Mode (OLED)" + paleta Fintech (dourado e roxo) + Fira Sans ──
   Ajuste: o verde de destaque da skill ficou de fora porque verde e reservado para status (variacao boa). */
const FINANCEIRO: DashboardData = {
  version: 2,
  title: 'Resultado e Caixa',
  segment: 'Financeiro',
  summary: 'Receita cresce 6,4% no trimestre, mas despesas operacionais sobem acima da meta e comprimem a margem líquida em 0,6 p.p.',
  tabs: [
    {
      name: 'Resultado',
      icon: 'piggy-bank',
      kpis: [
        { label: 'Receita líquida', value: 'R$ 48,2 mi', change: '+6,4%', trend: 'up', goodWhen: 'up', icon: 'dollar-sign', sparkline: [41.2, 42.0, 43.5, 44.1, 45.0, 46.3, 47.1, 48.2] },
        { label: 'EBITDA', value: 'R$ 9,6 mi', change: '+3,1%', trend: 'up', goodWhen: 'up', icon: 'piggy-bank', sparkline: [8.8, 8.9, 9.1, 9.0, 9.2, 9.4, 9.3, 9.6] },
        { label: 'Margem líquida', value: '11,8%', change: '-0,6 p.p.', trend: 'down', goodWhen: 'up', icon: 'percent', sparkline: [12.9, 12.7, 12.6, 12.4, 12.4, 12.1, 12.0, 11.8] },
        { label: 'Despesas operacionais', value: 'R$ 21,4 mi', change: '+2,2%', trend: 'up', goodWhen: 'down', icon: 'wallet', sparkline: [19.6, 19.9, 20.1, 20.4, 20.6, 20.9, 21.0, 21.4] },
        { label: 'Inadimplência', value: '3,4%', change: '-0,3 p.p.', trend: 'down', goodWhen: 'down', icon: 'hand-coins', sparkline: [4.1, 4.0, 3.9, 3.8, 3.7, 3.6, 3.7, 3.4] },
      ],
      charts: [
        {
          title: 'Despesas operacionais consomem 35% da receita líquida',
          subtitle: 'DRE do trimestre, da receita bruta ao lucro líquido',
          type: 'waterfall',
          unit: 'R$',
          span: 2,
          labels: ['Receita bruta', 'Deduções', 'CPV', 'Despesas operacionais', 'Depreciação', 'Resultado financeiro', 'IR e CSLL'],
          datasets: [{ label: 'DRE', data: [61500000, -13300000, -17200000, -21400000, -1900000, -800000, -1200000] }],
        },
        {
          title: 'Despesa cresce mais rápido que a receita desde maio',
          subtitle: 'Receita líquida e despesa total por mês',
          type: 'line',
          unit: 'R$',
          labels: ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
          datasets: [
            { label: 'Receita líquida', data: [14.1, 14.6, 16.2, 13.8, 14.0, 14.9, 15.2, 15.6, 15.8, 16.0, 16.1, 16.1].map((v) => v * 1e6) },
            { label: 'Despesa total', data: [12.0, 12.3, 13.4, 12.1, 12.2, 12.8, 13.0, 13.6, 13.9, 14.2, 14.3, 14.5].map((v) => v * 1e6) },
          ],
        },
        {
          title: 'Só Digital supera a meta de margem EBITDA',
          subtitle: 'Margem EBITDA realizada vs meta por unidade de negócio',
          type: 'bullet',
          unit: '%',
          labels: ['Digital', 'Varejo', 'Atacado', 'Serviços'],
          datasets: [
            { label: 'Realizado', data: [24.6, 19.1, 14.2, 17.8] },
            { label: 'Meta', data: [22, 21, 16, 20] },
          ],
        },
      ],
      tables: [],
    },
    {
      name: 'Caixa e Recebíveis',
      icon: 'landmark',
      kpis: [
        { label: 'Saldo de caixa', value: 'R$ 18,7 mi', change: '+4,8%', trend: 'up', goodWhen: 'up', icon: 'landmark', sparkline: [15.2, 15.9, 16.4, 16.1, 17.0, 17.5, 17.8, 18.7] },
        { label: 'Prazo médio de recebimento', value: '42 dias', change: '-3 dias', trend: 'down', goodWhen: 'down', icon: 'clock', sparkline: [49, 48, 47, 46, 45, 45, 44, 42] },
        { label: 'Vencidos acima de 90 dias', value: 'R$ 1,3 mi', change: '+8,1%', trend: 'up', goodWhen: 'down', icon: 'alert-triangle', sparkline: [1.0, 1.05, 1.1, 1.12, 1.18, 1.2, 1.24, 1.3] },
        { label: 'Contas a pagar em 30 dias', value: 'R$ 7,9 mi', change: '0,0%', trend: 'neutral', goodWhen: 'down', icon: 'receipt', sparkline: [7.8, 8.0, 7.9, 7.9, 8.1, 7.8, 7.9, 7.9] },
      ],
      charts: [
        {
          title: 'Caixa projetado cobre 2,4 meses de despesa',
          subtitle: 'Saldo de caixa: realizado até set, projeção até dez',
          type: 'area',
          unit: 'R$',
          labels: ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          datasets: [{ label: 'Saldo de caixa', data: [15.9, 16.4, 16.1, 17.0, 17.8, 18.7, 19.2, 19.9, 21.3].map((v) => v * 1e6) }],
        },
        {
          title: 'Nordeste lidera o crescimento da receita',
          subtitle: 'Crescimento da receita por UF vs mesmo trimestre do ano anterior',
          type: 'mapUF',
          unit: '%',
          labels: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE', 'CE', 'RN', 'PB', 'PA', 'AM', 'MT', 'MS', 'ES'],
          datasets: [{ label: 'Crescimento', data: [4.1, 2.8, 5.2, 6.0, 7.3, 3.1, 8.4, 5.9, 11.8, 12.6, 13.4, 9.8, 10.1, 6.7, 5.5, 9.1, 7.0, 4.6] }],
        },
        {
          title: 'Atraso longo cresce desde julho',
          subtitle: 'Recebíveis vencidos por faixa de atraso e mês',
          type: 'heatmap',
          unit: 'R$',
          labels: ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
          datasets: [
            { label: '1 a 30 dias', data: [2.1, 2.0, 1.9, 2.2, 2.0, 1.8].map((v) => v * 1e6) },
            { label: '31 a 60 dias', data: [0.9, 0.95, 0.9, 1.0, 0.96, 0.92].map((v) => v * 1e6) },
            { label: '61 a 90 dias', data: [0.5, 0.52, 0.55, 0.6, 0.62, 0.66].map((v) => v * 1e6) },
            { label: 'Acima de 90', data: [1.0, 1.05, 1.1, 1.18, 1.24, 1.3].map((v) => v * 1e6) },
          ],
        },
        {
          title: 'Pessoal e tecnologia puxam a alta das despesas',
          subtitle: 'Despesas operacionais por natureza e trimestre',
          type: 'stackedBar',
          unit: 'R$',
          labels: ['4T25', '1T26', '2T26', '3T26'],
          datasets: [
            { label: 'Pessoal', data: [9.1, 9.3, 9.6, 10.0].map((v) => v * 1e6) },
            { label: 'Tecnologia', data: [3.4, 3.6, 3.9, 4.3].map((v) => v * 1e6) },
            { label: 'Marketing', data: [3.9, 3.5, 3.8, 3.8].map((v) => v * 1e6) },
            { label: 'Administrativo', data: [3.3, 3.2, 3.3, 3.3].map((v) => v * 1e6) },
          ],
        },
      ],
      tables: [
        {
          title: 'Maiores títulos vencidos',
          columns: ['Cliente', 'Título', 'Vencimento', 'Valor', 'Status'],
          rows: [
            ['Construtora Horizonte', 'NF 88.214', '12/06/2026', 'R$ 312.400', 'Atrasado'],
            ['Rede Bom Sabor', 'NF 88.390', '28/06/2026', 'R$ 198.750', 'Em análise'],
            ['Tecelagem Vale Verde', 'NF 88.511', '05/07/2026', 'R$ 164.200', 'Atrasado'],
            ['Grupo Litoral Saúde', 'NF 88.702', '19/07/2026', 'R$ 121.900', 'Pendente'],
          ],
        },
      ],
    },
  ],
}

const MARCA_FINANCEIRO: Brand = {
  name: 'Atlas Capital',
  logo: null,
  primary: '#F59E0B',
  secondary: '#A78BFA', // roxo da paleta Fintech (#8B5CF6) clareado para passar 3:1 no fundo escuro
  background: '#020617',
  surface: '#0E1223',
  text: '#F8FAFC',
  font: 'Fira Sans',
}

/* ── CRM / Vendas: estilo "Flat Design" claro + azul profissional + Plus Jakarta Sans ──
   Ajuste: a secundaria da skill (#3B82F6) era quase igual a primaria e o verde de negocio e reservado
   para status; usei o ciano para a 2a serie. */
const VENDAS: DashboardData = {
  version: 2,
  title: 'Pipeline Comercial',
  segment: 'CRM / Vendas',
  summary: 'Receita fechada 12% acima do trimestre anterior; o gargalo está entre proposta e negociação, onde 46% das oportunidades param.',
  tabs: [
    {
      name: 'Pipeline',
      icon: 'target',
      kpis: [
        { label: 'Receita fechada', value: 'R$ 3,42 mi', change: '+12,0%', trend: 'up', goodWhen: 'up', icon: 'dollar-sign', sparkline: [2.6, 2.7, 2.9, 2.8, 3.0, 3.1, 3.3, 3.42] },
        { label: 'Taxa de conversão', value: '18,6%', change: '+1,4 p.p.', trend: 'up', goodWhen: 'up', icon: 'target', sparkline: [15.9, 16.4, 16.8, 17.0, 17.2, 17.9, 18.1, 18.6] },
        { label: 'Ticket médio', value: 'R$ 27,4 mil', change: '+3,8%', trend: 'up', goodWhen: 'up', icon: 'credit-card', sparkline: [25.1, 25.6, 25.9, 26.2, 26.4, 26.8, 27.0, 27.4] },
        { label: 'Ciclo de vendas', value: '41 dias', change: '+4 dias', trend: 'up', goodWhen: 'down', icon: 'hourglass', sparkline: [35, 36, 36, 37, 38, 39, 40, 41] },
        { label: 'Pipeline aberto', value: 'R$ 12,8 mi', change: '+9,5%', trend: 'up', goodWhen: 'up', icon: 'layers', sparkline: [10.4, 10.9, 11.2, 11.5, 11.9, 12.2, 12.5, 12.8] },
      ],
      charts: [
        {
          title: '46% das propostas não chegam à negociação',
          subtitle: 'Oportunidades por etapa no trimestre',
          type: 'funnel',
          unit: 'oport.',
          labels: ['Leads', 'Qualificados', 'Proposta enviada', 'Negociação', 'Ganhos'],
          datasets: [{ label: 'Oportunidades', data: [1340, 690, 412, 223, 125] }],
        },
        {
          title: 'Receita acima do ano anterior em 8 de 9 meses',
          subtitle: 'Receita fechada por mês, 2026 vs 2025',
          type: 'line',
          unit: 'R$',
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
          datasets: [
            { label: '2026', data: [0.92, 0.98, 1.05, 1.01, 1.08, 1.12, 1.10, 1.14, 1.18].map((v) => v * 1e6) },
            { label: '2025', data: [0.84, 0.88, 0.97, 1.03, 0.98, 1.0, 0.99, 1.02, 1.05].map((v) => v * 1e6) },
          ],
        },
        {
          title: 'Metade do time abaixo da meta do trimestre',
          subtitle: 'Vendas realizadas vs meta por representante',
          type: 'bullet',
          unit: 'R$',
          labels: ['Mariana Costa', 'Rafael Lima', 'Beatriz Souza', 'Thiago Alves', 'Camila Rocha', 'Lucas Martins'],
          datasets: [
            { label: 'Realizado', data: [742000, 655000, 598000, 471000, 433000, 391000] },
            { label: 'Meta', data: [650000, 600000, 600000, 550000, 520000, 500000] },
          ],
        },
        {
          title: 'Plano Enterprise gera 38% da receita',
          subtitle: 'Receita fechada por produto',
          type: 'horizontalBar',
          unit: 'R$',
          labels: ['Enterprise', 'Business', 'Starter', 'Serviços de implantação', 'Treinamentos', 'Add-ons'],
          datasets: [{ label: 'Receita', data: [1300000, 920000, 540000, 330000, 190000, 140000] }],
        },
      ],
      tables: [],
    },
    {
      name: 'Regiões e Canais',
      icon: 'map-pin',
      kpis: [
        { label: 'Novos clientes', value: '125', change: '+14,7%', trend: 'up', goodWhen: 'up', icon: 'user-plus', sparkline: [92, 98, 101, 104, 109, 112, 118, 125] },
        { label: 'Churn', value: '2,1%', change: '-0,4 p.p.', trend: 'down', goodWhen: 'down', icon: 'user-minus', sparkline: [2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1] },
        { label: 'NPS', value: '61', change: '+3', trend: 'up', goodWhen: 'up', icon: 'smile', sparkline: [54, 55, 57, 56, 58, 59, 58, 61] },
        { label: 'Custo de aquisição', value: 'R$ 1.840', change: '+6,1%', trend: 'up', goodWhen: 'down', icon: 'coins', sparkline: [1610, 1650, 1690, 1720, 1750, 1790, 1810, 1840] },
      ],
      charts: [
        {
          title: 'Sul e Centro-Oeste crescem acima de 20%',
          subtitle: 'Crescimento de vendas por UF vs ano anterior',
          type: 'mapUF',
          unit: '%',
          labels: ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'GO', 'DF', 'MT', 'MS', 'BA', 'PE', 'CE', 'PA', 'AM'],
          datasets: [{ label: 'Crescimento', data: [9.4, 6.1, 11.2, 7.8, 22.5, 24.1, 20.3, 21.7, 18.9, 23.4, 19.6, 12.8, 10.5, 9.9, 6.2, 4.8] }],
        },
        {
          title: 'Indicações convertem melhor às terças e quartas',
          subtitle: 'Oportunidades criadas por canal e dia da semana',
          type: 'heatmap',
          unit: 'oport.',
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
          datasets: [
            { label: 'Inbound', data: [48, 61, 58, 52, 39] },
            { label: 'Outbound', data: [35, 41, 44, 40, 22] },
            { label: 'Indicação', data: [12, 26, 24, 15, 9] },
            { label: 'Parceiros', data: [18, 21, 23, 20, 14] },
            { label: 'Eventos', data: [6, 8, 31, 9, 4] },
          ],
        },
        {
          title: 'Expansão já é um terço da receita nova',
          subtitle: 'Receita fechada por tipo de negócio',
          type: 'doughnut',
          unit: '%',
          labels: ['Novos clientes', 'Expansão', 'Renovação'],
          datasets: [{ label: 'Participação', data: [47, 33, 20] }],
        },
        {
          title: 'Parceiros dobram a participação no ano',
          subtitle: 'Receita fechada por canal e mês',
          type: 'stackedBar',
          unit: 'R$',
          labels: ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
          datasets: [
            { label: 'Inbound', data: [420, 445, 460, 452, 470, 480].map((v) => v * 1e3) },
            { label: 'Outbound', data: [380, 392, 400, 386, 395, 402].map((v) => v * 1e3) },
            { label: 'Parceiros', data: [110, 135, 160, 172, 185, 208].map((v) => v * 1e3) },
            { label: 'Indicação', data: [100, 108, 100, 90, 90, 90].map((v) => v * 1e3) },
          ],
        },
      ],
      tables: [
        {
          title: 'Maiores oportunidades em negociação',
          columns: ['Conta', 'Representante', 'Valor', 'Previsão', 'Status'],
          rows: [
            ['Rede Farmavida', 'Mariana Costa', 'R$ 486.000', 'Out/2026', 'Em andamento'],
            ['Grupo Andrade Engenharia', 'Rafael Lima', 'R$ 352.500', 'Nov/2026', 'Em análise'],
            ['Cooperativa Agro Sul', 'Camila Rocha', 'R$ 298.000', 'Out/2026', 'Em andamento'],
            ['Colégio Novo Saber', 'Thiago Alves', 'R$ 141.200', 'Dez/2026', 'Pendente'],
          ],
        },
      ],
    },
  ],
}

const MARCA_VENDAS: Brand = {
  name: 'Vértice Vendas',
  logo: null,
  primary: '#2563EB',
  secondary: '#0891B2',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  font: 'Plus Jakarta Sans',
}

/* ── RH: estilo "Data-Dense Dashboard" + azul-marinho com ambar + Inter ──
   Ajuste: texto um tom mais escuro que o sugerido, para o texto secundario passar no contraste. */
const RH: DashboardData = {
  version: 2,
  title: 'People Analytics',
  segment: 'Recursos Humanos',
  summary: 'Turnover voluntário caiu pelo terceiro mês seguido; Tecnologia segue como a área com pior clima e maior tempo para preencher vagas.',
  tabs: [
    {
      name: 'Pessoas',
      icon: 'users',
      kpis: [
        { label: 'Headcount', value: '2.184', change: '+1,8%', trend: 'up', goodWhen: 'up', icon: 'users', sparkline: [2098, 2110, 2121, 2135, 2142, 2158, 2170, 2184] },
        { label: 'Turnover mensal', value: '1,9%', change: '-0,3 p.p.', trend: 'down', goodWhen: 'down', icon: 'user-minus', sparkline: [2.6, 2.5, 2.4, 2.4, 2.3, 2.2, 2.1, 1.9] },
        { label: 'Contratações no mês', value: '64', change: '+10,3%', trend: 'up', goodWhen: 'up', icon: 'user-plus', sparkline: [48, 52, 55, 51, 57, 60, 58, 64] },
        { label: 'Tempo médio de contratação', value: '34 dias', change: '-2 dias', trend: 'down', goodWhen: 'down', icon: 'hourglass', sparkline: [41, 40, 39, 38, 37, 36, 36, 34] },
        { label: 'Absenteísmo', value: '2,7%', change: '+0,2 p.p.', trend: 'up', goodWhen: 'down', icon: 'calendar-check', sparkline: [2.3, 2.4, 2.4, 2.5, 2.5, 2.6, 2.5, 2.7] },
      ],
      charts: [
        {
          title: 'Entrevista é a etapa que mais elimina candidatos',
          subtitle: 'Funil de recrutamento no trimestre',
          type: 'funnel',
          unit: 'pessoas',
          labels: ['Candidaturas', 'Triagem', 'Entrevista', 'Proposta', 'Contratados'],
          datasets: [{ label: 'Candidatos', data: [4820, 1430, 512, 214, 186] }],
        },
        {
          title: 'Turnover voluntário cai desde abril',
          subtitle: 'Desligamentos mensais por tipo, em % do headcount',
          type: 'line',
          unit: '%',
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
          datasets: [
            { label: 'Voluntário', data: [1.7, 1.8, 1.9, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2] },
            { label: 'Involuntário', data: [0.7, 0.6, 0.7, 0.8, 0.7, 0.7, 0.7, 0.8, 0.7] },
          ],
        },
        {
          title: 'Tecnologia e Operações abaixo da meta de eNPS',
          subtitle: 'eNPS realizado vs meta por área',
          type: 'bullet',
          labels: ['Comercial', 'Financeiro', 'Pessoas', 'Operações', 'Tecnologia'],
          datasets: [
            { label: 'Realizado', data: [58, 51, 63, 34, 28] },
            { label: 'Meta', data: [50, 50, 50, 45, 45] },
          ],
        },
        {
          title: 'Liderança cresce mais devagar que o time',
          subtitle: 'Headcount por nível e trimestre',
          type: 'stackedBar',
          unit: 'pessoas',
          labels: ['4T25', '1T26', '2T26', '3T26'],
          datasets: [
            { label: 'Operacional', data: [1180, 1196, 1210, 1228] },
            { label: 'Analistas', data: [640, 652, 668, 690] },
            { label: 'Coordenação', data: [140, 142, 145, 148] },
            { label: 'Gerência e diretoria', data: [116, 117, 117, 118] },
          ],
        },
      ],
      tables: [],
    },
    {
      name: 'Clima e Desenvolvimento',
      icon: 'smile',
      kpis: [
        { label: 'Participação na pesquisa', value: '87%', change: '+5 p.p.', trend: 'up', goodWhen: 'up', icon: 'check-circle', sparkline: [76, 78, 80, 82, 82, 84, 85, 87] },
        { label: 'Horas de treinamento por pessoa', value: '18,4 h', change: '+2,1 h', trend: 'up', goodWhen: 'up', icon: 'graduation-cap', sparkline: [13.8, 14.5, 15.1, 15.9, 16.3, 16.8, 17.5, 18.4] },
        { label: 'Vagas preenchidas internamente', value: '31%', change: '+4 p.p.', trend: 'up', goodWhen: 'up', icon: 'repeat', sparkline: [24, 25, 26, 27, 27, 28, 29, 31] },
        { label: 'Custo por contratação', value: 'R$ 4.920', change: '-6,3%', trend: 'down', goodWhen: 'down', icon: 'wallet', sparkline: [5420, 5380, 5300, 5250, 5150, 5080, 5010, 4920] },
      ],
      charts: [
        {
          title: 'Reconhecimento é o ponto fraco em quase todas as áreas',
          subtitle: 'Favorabilidade da pesquisa de clima por área e dimensão (%)',
          type: 'heatmap',
          unit: '%',
          span: 2,
          labels: ['Liderança', 'Reconhecimento', 'Carreira', 'Carga de trabalho', 'Propósito', 'Colaboração'],
          datasets: [
            { label: 'Comercial', data: [78, 61, 66, 59, 81, 77] },
            { label: 'Financeiro', data: [74, 58, 63, 70, 76, 80] },
            { label: 'Pessoas', data: [83, 69, 72, 74, 88, 85] },
            { label: 'Operações', data: [62, 44, 51, 48, 70, 66] },
            { label: 'Tecnologia', data: [57, 41, 46, 39, 68, 71] },
          ],
        },
        {
          title: 'Turnover mais alto no Norte e Nordeste',
          subtitle: 'Turnover acumulado em 12 meses por UF das unidades',
          type: 'mapUF',
          unit: '%',
          labels: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE', 'CE', 'PA', 'AM', 'MA'],
          datasets: [{ label: 'Turnover', data: [18.2, 20.1, 17.4, 15.9, 14.8, 16.3, 19.5, 17.1, 24.6, 26.2, 23.8, 28.4, 29.1, 25.7] }],
        },
        {
          title: 'Tecnologia investe menos da metade das horas de Pessoas',
          subtitle: 'Horas de treinamento por pessoa no ano, por área',
          type: 'horizontalBar',
          unit: 'h',
          labels: ['Pessoas', 'Comercial', 'Financeiro', 'Operações', 'Tecnologia'],
          datasets: [{ label: 'Horas', data: [31.5, 24.2, 19.8, 16.4, 14.7] }],
        },
      ],
      tables: [
        {
          title: 'Posições críticas em aberto',
          columns: ['Vaga', 'Área', 'Aberta há', 'Candidatos na final', 'Status'],
          rows: [
            ['Engenheira(o) de dados sênior', 'Tecnologia', '58 dias', '2', 'Em andamento'],
            ['Coordenação de logística', 'Operações', '41 dias', '3', 'Em análise'],
            ['Especialista em segurança', 'Tecnologia', '37 dias', '1', 'Pendente'],
            ['Gerente de contas', 'Comercial', '22 dias', '4', 'Em andamento'],
          ],
        },
      ],
    },
  ],
}

const MARCA_RH: Brand = {
  name: 'Pessoas & Cia',
  logo: null,
  primary: '#1E40AF',
  secondary: '#D97706',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#172554', // skill sugeriu #1E3A8A; um tom mais escuro faz o texto secundario passar 4,5:1
  font: 'Inter',
}

export const DEMOS: Record<string, Demo> = {
  logistica: { data: EXEMPLO_LOGISTICA },
  financeiro: { data: FINANCEIRO, brand: MARCA_FINANCEIRO },
  vendas: { data: VENDAS, brand: MARCA_VENDAS },
  rh: { data: RH, brand: MARCA_RH },
}
