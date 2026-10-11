import type { DashboardData } from '../types'

// Dashboard fixo de logistica, aberto com ?demo=logistica.
// Serve para ver todos os visuais sem gastar chamada do Gemini e como referencia de formato.
export const EXEMPLO_LOGISTICA: DashboardData = {
  version: 2,
  title: 'Custo e Desempenho da Frota',
  filters: [{ label: 'Tipo de veículo', options: ['Truck', 'Carreta LS', 'Toco', 'Cavalo', 'Furgão', 'VUC'] }],
  segment: 'Logística',
  summary: 'Custo por km caiu 10% no ano, puxado pela troca de rotas no eixo SP-BA; OTIF ainda abaixo da meta no Norte.',
  tabs: [
    {
      name: 'Custo com Frota',
      description: 'Quanto a frota custa, onde roda e se as entregas cumprem a meta de OTIF.',
      icon: 'truck',
      kpis: [
        { label: 'Despesa total', value: 'R$ 1,89 mi', change: '-0,54%', trend: 'down', goodWhen: 'down', icon: 'wallet', sparkline: [2.05, 2.01, 1.98, 1.97, 1.95, 1.92, 1.9, 1.89] },
        { label: 'Custo por km rodado', value: 'R$ 3,78', change: '-0,10%', trend: 'down', goodWhen: 'down', icon: 'fuel', sparkline: [4.2, 4.1, 4.05, 3.98, 3.9, 3.85, 3.8, 3.78] },
        { label: 'Custo por tonelada', value: 'R$ 402,09', change: '+0,49%', trend: 'up', goodWhen: 'down', icon: 'weight', sparkline: [388, 392, 395, 391, 398, 400, 401, 402] },
        { label: 'Veículos ativos', value: '33', change: '+3,1%', trend: 'up', goodWhen: 'up', icon: 'truck', sparkline: [29, 30, 30, 31, 31, 32, 32, 33] },
        { label: 'OTIF', value: '91,4%', change: '+1,2 p.p.', trend: 'up', goodWhen: 'up', icon: 'package-check', sparkline: [87.9, 88.4, 89.1, 89.8, 90.2, 90.6, 91.0, 91.4] },
      ],
      charts: [
        {
          title: 'Custo variável cai desde março',
          subtitle: 'Despesa mensal por natureza',
          type: 'area',
          unit: 'R$',
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
          datasets: [
            { label: 'Custo fixo', data: [118000, 119500, 120200, 120800, 121000, 121400, 121900, 122300] },
            { label: 'Custo variável', data: [131000, 128400, 133900, 122600, 117800, 114300, 110900, 108200] },
          ],
        },
        {
          title: 'Truck é o veículo mais caro por dia',
          subtitle: 'Custo diário médio por tipo de veículo',
          type: 'horizontalBar',
          unit: 'R$',
          labels: ['Truck', 'Cavalo', 'Toco', 'Furgão', 'VUC', 'Carreta LS'],
          datasets: [{ label: 'Custo diário', data: [1856.69, 547.53, 578.54, 288, 275.24, 1210.4] }],
        },
        {
          title: 'SP → BA concentra as viagens',
          subtitle: 'Viagens no trimestre por rota',
          type: 'routeMap',
          unit: 'viagens',
          labels: [],
          datasets: [],
          routes: [
            { from: 'SP', to: 'BA', value: 1240 },
            { from: 'SP', to: 'MG', value: 980 },
            { from: 'SP', to: 'PR', value: 760 },
            { from: 'PR', to: 'RS', value: 540 },
            { from: 'SP', to: 'GO', value: 430 },
            { from: 'BA', to: 'PE', value: 390 },
            { from: 'GO', to: 'PA', value: 210 },
            { from: 'PE', to: 'CE', value: 180 },
          ],
        },
        {
          title: 'Norte e Nordeste abaixo da meta de OTIF',
          subtitle: 'OTIF realizado vs meta de 95% por região',
          type: 'bullet',
          unit: '%',
          labels: ['Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste', 'Norte'],
          datasets: [
            { label: 'Realizado', data: [96.1, 94.8, 92.3, 88.5, 81.2] },
            { label: 'Meta', data: [95, 95, 95, 95, 95] },
          ],
        },
      ],
      tables: [],
    },
    {
      name: 'Entregas por Região',
      description: 'Prazo, volume e perdas do pedido à entrega, por UF e faixa horária.',
      icon: 'map-pin',
      kpis: [
        { label: 'Entregas no mês', value: '18.420', change: '+6,8%', trend: 'up', goodWhen: 'up', icon: 'package', sparkline: [15900, 16200, 16800, 17100, 17300, 17900, 18420] },
        { label: 'Atraso médio', value: '6,2 h', change: '-12%', trend: 'down', goodWhen: 'down', icon: 'timer', sparkline: [8.1, 7.8, 7.4, 7.0, 6.8, 6.5, 6.2] },
        { label: 'Devoluções', value: '1,8%', change: '+0,3 p.p.', trend: 'up', goodWhen: 'down', icon: 'undo', sparkline: [1.4, 1.5, 1.5, 1.6, 1.7, 1.7, 1.8] },
        { label: 'Ocupação da frota', value: '84%', change: '0,0%', trend: 'neutral', goodWhen: 'up', icon: 'boxes', sparkline: [83, 85, 84, 84, 85, 83, 84] },
      ],
      charts: [
        {
          title: 'OTIF por UF de destino',
          subtitle: 'Percentual de entregas completas e no prazo',
          type: 'mapUF',
          unit: '%',
          labels: ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'GO', 'DF', 'MT', 'MS', 'BA', 'PE', 'CE', 'PA', 'AM', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI', 'TO', 'RO'],
          datasets: [{ label: 'OTIF', data: [97, 95, 96, 94, 95, 96, 93, 92, 94, 89, 91, 88, 87, 86, 80, 78, 83, 85, 86, 84, 87, 82, 81, 79] }],
        },
        {
          title: 'Pico de entregas na terça de manhã',
          subtitle: 'Entregas por dia da semana e faixa horária',
          type: 'heatmap',
          unit: 'entregas',
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
          datasets: [
            { label: '06h-09h', data: [410, 520, 470, 455, 430, 180] },
            { label: '09h-12h', data: [640, 780, 700, 690, 650, 260] },
            { label: '12h-15h', data: [520, 590, 560, 545, 500, 140] },
            { label: '15h-18h', data: [480, 530, 515, 505, 460, 90] },
            { label: '18h-21h', data: [210, 240, 230, 220, 260, 40] },
          ],
        },
        {
          title: 'Do pedido à entrega: 7% se perdem na expedição',
          type: 'funnel',
          unit: 'pedidos',
          labels: ['Pedidos recebidos', 'Separados', 'Expedidos', 'Em rota', 'Entregues no prazo'],
          datasets: [{ label: 'Pedidos', data: [21500, 20900, 19400, 19100, 17480] }],
        },
        {
          title: 'Combustível explica a maior parte da economia',
          subtitle: 'Variação do custo mensal, julho → agosto',
          type: 'waterfall',
          unit: 'R$',
          goodWhen: 'down',
          labels: ['Custo julho', 'Combustível', 'Pedágio', 'Manutenção', 'Pneus', 'Motoristas'],
          datasets: [{ label: 'Custo', data: [232800, -9400, -1200, 3100, -800, 6000] }],
        },
      ],
      tables: [
        {
          title: 'Entregas atrasadas',
          columns: ['Pedido', 'Cliente', 'Destino', 'Atraso', 'Status'],
          rows: [
            ['#48213', 'Mercado Bom Preço', 'Belém - PA', '26 h', 'Atrasado'],
            ['#48190', 'Farmácia Vida', 'Manaus - AM', '19 h', 'Em andamento'],
            ['#48177', 'Casa & Construção', 'São Luís - MA', '14 h', 'Atrasado'],
            ['#48122', 'Distribuidora Sol', 'Fortaleza - CE', '9 h', 'Concluído'],
          ],
        },
      ],
    },
  ],
}
