// Playbook por segmento: o que um dashboard daquela area costuma ter.
// Entra no prompt para o Gemini sair do "barra + rosca + tabela" e usar os visuais
// que fazem sentido no dominio (mapa de rotas em logistica, funil em vendas, cascata em financeiro).
// As chaves batem com SEGMENTS em components/ChatInterface.tsx.

interface KpiSugerido {
  label: string
  icon: string // nome da lista ICON_NAMES (lib/icons.ts)
  goodWhen: 'up' | 'down'
}

export interface Playbook {
  abas: string[]
  kpis: KpiSugerido[]
  assinatura: string[] // visuais que identificam o segmento: "tipo: o que mostra"
}

const k = (label: string, icon: string, goodWhen: 'up' | 'down' = 'up'): KpiSugerido => ({ label, icon, goodWhen })

export const PLAYBOOKS: Record<string, Playbook> = {
  'Logística': {
    abas: ['Visão Geral', 'Custo com Frota', 'Rotas e Entregas', 'Armazém e Estoque', 'Desempenho por Região'],
    kpis: [
      k('Custo total da frota', 'wallet', 'down'), k('Custo por km rodado', 'fuel', 'down'),
      k('Custo por tonelada transportada', 'weight', 'down'), k('Veículos ativos', 'truck'),
      k('OTIF', 'package-check'), k('Atraso médio', 'timer', 'down'), k('Ocupação da frota', 'boxes'),
      k('Giro de estoque', 'warehouse'),
    ],
    assinatura: [
      'routeMap: viagens ou volume entre UFs de origem e destino',
      'mapUF: OTIF ou prazo médio por UF de destino (taxa, não volume)',
      'bullet: OTIF realizado vs meta por região ou transportadora',
      'horizontalBar: custo diário por tipo de veículo (Truck, Toco, VUC, Carreta)',
      'area: custo fixo vs variável ao longo dos meses',
      'heatmap: entregas por dia da semana x faixa horária',
      'funnel: pedidos recebidos > separados > expedidos > entregues no prazo',
      'waterfall (goodWhen down): variação do custo do mês por componente (combustível, pedágio, manutenção)',
    ],
  },
  'Financeiro': {
    abas: ['Resumo Executivo', 'DRE', 'Fluxo de Caixa', 'Custos e Despesas', 'Inadimplência'],
    kpis: [
      k('Receita líquida', 'dollar-sign'), k('EBITDA', 'piggy-bank'), k('Margem líquida', 'percent'),
      k('Saldo de caixa', 'landmark'), k('Despesas operacionais', 'wallet', 'down'),
      k('Inadimplência', 'hand-coins', 'down'), k('Prazo médio de recebimento', 'clock', 'down'),
    ],
    assinatura: [
      'waterfall: DRE da receita bruta ao lucro líquido (impostos, custos e despesas negativos)',
      'line: receita vs despesa nos últimos 12 meses',
      'bullet: margem realizada vs meta por unidade de negócio',
      'stackedBar: composição das despesas por natureza mês a mês',
      'area: saldo de caixa projetado',
      'mapUF: crescimento da receita por UF (%), quando houver operação nacional',
    ],
  },
  'CRM / Vendas': {
    abas: ['Visão Geral', 'Pipeline', 'Equipe Comercial', 'Clientes', 'Regiões'],
    kpis: [
      k('Receita fechada', 'dollar-sign'), k('Ticket médio', 'credit-card'), k('Taxa de conversão', 'target'),
      k('Ciclo de vendas', 'hourglass', 'down'), k('Novos clientes', 'user-plus'), k('Churn', 'user-minus', 'down'),
      k('NPS', 'smile'),
    ],
    assinatura: [
      'funnel: lead > qualificado > proposta > negociação > ganho',
      'bullet: vendas realizadas vs meta por vendedor ou equipe',
      'mapUF: crescimento de vendas por UF (%)',
      'horizontalBar: ranking de vendedores ou produtos',
      'line: receita mensal vs mesmo mês do ano anterior',
      'heatmap: oportunidades criadas por dia da semana x canal',
    ],
  },
  'Recursos Humanos': {
    abas: ['Visão Geral', 'Headcount', 'Recrutamento', 'Turnover', 'Clima e Engajamento'],
    kpis: [
      k('Headcount', 'users'), k('Turnover', 'user-minus', 'down'), k('Contratações no mês', 'user-plus'),
      k('Tempo médio de contratação', 'hourglass', 'down'), k('eNPS', 'smile'), k('Absenteísmo', 'calendar-check', 'down'),
      k('Horas de treinamento', 'graduation-cap'),
    ],
    assinatura: [
      'funnel: candidatos > triagem > entrevista > proposta > contratados',
      'heatmap: clima por departamento x dimensão (liderança, reconhecimento, carreira)',
      'bullet: eNPS realizado vs meta por área',
      'stackedBar: headcount por nível hierárquico ao longo dos trimestres',
      'line: turnover voluntário vs involuntário',
      'mapUF: turnover por UF (%), quando houver unidades em vários estados',
    ],
  },
  'Advocacia': {
    abas: ['Visão Geral', 'Carteira de Processos', 'Produtividade', 'Honorários', 'Prazos'],
    kpis: [
      k('Processos ativos', 'gavel'), k('Taxa de êxito', 'award'), k('Honorários faturados', 'hand-coins'),
      k('Horas faturáveis', 'clock'), k('Prazos vencendo na semana', 'calendar-check', 'down'),
      k('Clientes ativos', 'briefcase'),
    ],
    assinatura: [
      'funnel: processos por fase (inicial > instrução > sentença > recurso > trânsito em julgado)',
      'bullet: horas faturáveis vs meta por advogado',
      'horizontalBar: processos por área do direito',
      'heatmap: prazos por semana x área',
      'line: honorários faturados vs recebidos por mês',
    ],
  },
  'Observabilidade TI': {
    abas: ['Saúde Geral', 'Disponibilidade', 'Performance', 'Incidentes', 'Infraestrutura'],
    kpis: [
      k('Uptime', 'shield-check'), k('Latência p95', 'timer', 'down'), k('Taxa de erro', 'bug', 'down'),
      k('Incidentes abertos', 'alert-triangle', 'down'), k('MTTR', 'clock', 'down'), k('Uso de CPU', 'cpu', 'down'),
    ],
    assinatura: [
      'bullet: uptime realizado vs SLA por serviço',
      'heatmap: disponibilidade por serviço x dia',
      'area: latência p50 e p95 ao longo das horas',
      'stackedBar: incidentes por severidade por semana',
      'line: taxa de erro por serviço',
      'horizontalBar: serviços com mais alertas',
    ],
  },
  'FinOps': {
    abas: ['Visão Geral', 'Custo por Provedor', 'Custo por Time', 'Otimização', 'Previsão'],
    kpis: [
      k('Custo cloud no mês', 'cloud', 'down'), k('Variação vs orçamento', 'target', 'down'),
      k('Economia com reservas', 'piggy-bank'), k('Custo por cliente', 'coins', 'down'),
      k('Recursos ociosos', 'server', 'down'), k('Cobertura de tags', 'check-circle'),
    ],
    assinatura: [
      'waterfall (goodWhen down): variação do custo do mês por serviço (compute, storage, rede)',
      'bullet: gasto realizado vs orçamento por time',
      'stackedBar: custo por provedor por mês',
      'horizontalBar: ranking de custo por projeto',
      'line: custo realizado vs previsão',
      'heatmap: custo por serviço x semana',
    ],
  },
  'Gerencial / PMO': {
    abas: ['Portfólio', 'Cronograma', 'Orçamento', 'Recursos', 'Riscos'],
    kpis: [
      k('Projetos em andamento', 'layers'), k('Entregas no prazo', 'calendar-check'), k('Orçamento consumido', 'wallet', 'down'),
      k('Projetos em risco', 'alert-triangle', 'down'), k('Ocupação da equipe', 'users'), k('Marcos concluídos', 'flag'),
    ],
    assinatura: [
      'bullet: percentual concluído vs planejado por projeto',
      'heatmap: alocação de pessoas por equipe x semana',
      'stackedBar: projetos por status (no prazo, atenção, atrasado) por portfólio',
      'funnel: ideias > aprovados > em execução > entregues',
      'line: burn-up de escopo entregue vs planejado',
    ],
  },
  'Jurídico': {
    abas: ['Visão Geral', 'Contencioso', 'Contratos', 'Provisões', 'Prazos'],
    kpis: [
      k('Processos ativos', 'gavel'), k('Provisão de contingência', 'shield-check', 'down'),
      k('Contratos vigentes', 'file-text'), k('Contratos a vencer em 30 dias', 'calendar-check', 'down'),
      k('Despesas jurídicas', 'wallet', 'down'), k('Taxa de êxito', 'award'),
    ],
    assinatura: [
      'mapUF: processos por UF por mil clientes (taxa)',
      'waterfall (goodWhen down): evolução da provisão (saldo anterior, novas ações, encerramentos, reavaliações)',
      'doughnut: contratos vigentes / a vencer / vencidos (3 fatias)',
      'horizontalBar: processos por esfera (trabalhista, cível, tributária, consumidor)',
      'heatmap: vencimentos de prazos por semana x área',
    ],
  },
  'Educação': {
    abas: ['Visão Geral', 'Captação', 'Desempenho Acadêmico', 'Evasão', 'Financeiro'],
    kpis: [
      k('Alunos matriculados', 'graduation-cap'), k('Taxa de evasão', 'user-minus', 'down'), k('Nota média', 'book-open'),
      k('Frequência média', 'calendar-check'), k('Inadimplência', 'hand-coins', 'down'), k('Satisfação dos alunos', 'smile'),
    ],
    assinatura: [
      'funnel: inscritos > aprovados > matriculados > ativos no 2º semestre',
      'heatmap: frequência por turma x mês',
      'bullet: nota média vs meta por curso',
      'mapUF: alunos por UF (EAD), em percentual do total',
      'line: matrículas vs evasão por semestre',
    ],
  },
  'SLA / Suporte': {
    abas: ['Visão Geral', 'SLA', 'Volume de Chamados', 'Equipe', 'Satisfação'],
    kpis: [
      k('Chamados abertos', 'ticket', 'down'), k('SLA cumprido', 'shield-check'), k('Tempo médio de resolução', 'timer', 'down'),
      k('Primeira resposta', 'clock', 'down'), k('CSAT', 'smile'), k('Backlog', 'layers', 'down'),
    ],
    assinatura: [
      'bullet: SLA cumprido vs meta por fila ou prioridade',
      'heatmap: chamados abertos por dia da semana x hora',
      'stackedBar: chamados por prioridade por semana',
      'line: tempo médio de resolução',
      'horizontalBar: categorias com mais chamados',
      'funnel: abertos > em atendimento > resolvidos > avaliados',
    ],
  },
}

// Bloco do prompt para o segmento escolhido. "Outro" (ou segmento sem playbook) pede para a IA inferir.
export function playbookParaPrompt(segmento: string): string {
  const p = PLAYBOOKS[segmento]
  if (!p) {
    return `PLAYBOOK DO SEGMENTO:
O segmento não está na lista padrão. Antes de montar o JSON, identifique o domínio a partir do objetivo e das métricas
informadas e escolha KPIs, ícones e visuais típicos desse domínio. Se houver dimensão geográfica (UF, região, filial),
use mapUF ou routeMap; se houver etapas sequenciais, funnel; se houver metas, bullet; se houver decomposição de um valor, waterfall.`
  }
  return `PLAYBOOK DO SEGMENTO "${segmento}" (ponto de partida; adapte ao objetivo do usuário):
Abas sugeridas: ${p.abas.join(', ')}
KPIs típicos (label | icon | goodWhen):
${p.kpis.map((x) => `- ${x.label} | ${x.icon} | ${x.goodWhen}`).join('\n')}
Visuais assinatura do segmento (use pelo menos 3 deles no dashboard, distribuídos entre as abas):
${p.assinatura.map((a) => `- ${a}`).join('\n')}`
}
