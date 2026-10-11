// Versao resumida de docs/guia-visuais-dashboard.md, restrita aos tipos que o Dashboard.tsx renderiza.
// Ao mudar uma regra no guia, atualize aqui e no TEMPLATE_FIXO de frontend/app.html.
export const REGRAS_VISUALIZACAO = `REGRAS DE ESCOLHA E DESENHO DOS VISUAIS (OBRIGATORIO):

KPIs (camada de resumo — "como estamos indo?"):
- Cada KPI precisa de contexto: "change" é sempre a variação vs período anterior (o app exibe "vs período anterior" ao lado). Nunca um número solto.
- Ordene os KPIs do mais crítico para o menos crítico: o primeiro é o número mais importante da aba.
- "sparkline" traz o histórico recente do KPI: 7 a 12 números, do mais antigo ao mais recente, coerentes com "value" e "trend".

Escolha do tipo de gráfico pela pergunta que ele responde:
- Evolução no tempo contínuo (dias, semanas, meses) → "line". No máximo 3 datasets.
- Volume total ao longo do tempo, quando o total importa tanto quanto a tendência → "area". No máximo 3 datasets, valores a partir de zero.
- Períodos discretos (trimestres, anos) → "bar".
- Comparação entre poucas categorias (até 5) com nomes curtos → "bar".
- Ranking ou comparação com mais de 5 categorias ou nomes longos → "horizontalBar", com 1 dataset e 5 a 10 categorias.
- Composição parte-todo → "doughnut" (ou "pie") SOMENTE com 2 ou 3 fatias que somam 100%. Com mais partes, use "horizontalBar".
- Nunca use pizza/rosca para comparar categorias nem para séries temporais.

Distribuição dos gráficos na aba:
- Cada aba deve ter de 2 a 4 gráficos que respondam perguntas DIFERENTES (ex.: um de tendência + um de ranking + um de composição). Evite dois gráficos do mesmo tipo com a mesma pergunta.
- Títulos dos gráficos dizem o que o usuário deve ler (ex.: "Receita cresce 18% no semestre"), não só o nome da métrica.

Dados:
- Valores de barras e áreas começam no zero; nada de eixos cortados para exagerar diferenças.
- Mantenha os dados coerentes entre KPIs, gráficos e tabelas da mesma aba.

Tabelas (camada de detalhe, ficam na base da aba):
- Use para o dado bruto que sustenta os gráficos; ordene pela coluna mais relevante.`
