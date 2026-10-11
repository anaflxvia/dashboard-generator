// Versao resumida de docs/guia-visuais-dashboard.md, restrita aos tipos que o app React renderiza
// (components/visuals). Ao mudar uma regra no guia, atualize aqui e no TEMPLATE_FIXO de frontend/app.html.
import { ICON_NAMES } from './icons'

export const CATALOGO_VISUAIS = `CATÁLOGO DE VISUAIS (campo "type" de cada item de "charts"; use SOMENTE estes):
Campos comuns: "title" (o insight, ex.: "Custo por km cai 10% no semestre"), "subtitle" (o que está sendo medido),
"unit" ("R$", "%", "km", "h", "viagens", "pedidos"...), "span" (2 = ocupa a linha inteira; omita para meia largura).

- "line": tendência no tempo. labels = períodos; até 3 datasets.
- "area": volume ao longo do tempo. labels = períodos; até 3 datasets; valores >= 0.
- "bar": até 5 categorias curtas ou períodos discretos (trimestres, anos).
- "horizontalBar": ranking com 5 a 10 categorias; 1 dataset.
- "stackedBar": composição ao longo do tempo ou entre categorias; 2 a 4 datasets (partes), labels = períodos ou categorias.
- "doughnut" / "pie": parte-todo com 2 ou 3 fatias que somam 100%. Nunca para ranking nem tempo.
- "waterfall": como um valor inicial vira o final. labels = ["Valor inicial", "Componente 1", ...];
  1 dataset em que o 1º número é o total inicial e os demais são variações (+/-). O app calcula e mostra o total final.
  Use "goodWhen": "down" quando o valor é custo (queda fica verde).
- "bullet": realizado vs meta. labels = itens (regiões, times, produtos, até 6);
  datasets = [{ "label": "Realizado", "data": [...] }, { "label": "Meta", "data": [...] }].
- "funnel": etapas em sequência (3 a 6), da maior para a menor. 1 dataset com o volume de cada etapa.
- "heatmap": intensidade no cruzamento de duas categorias. labels = colunas (ex.: dias da semana);
  cada dataset é uma linha (ex.: faixa horária) com um valor por coluna. 3 a 7 linhas. Use "span": 2 se tiver mais de 7 colunas.
- "mapUF": mapa do Brasil colorido por UF. labels = siglas de UF ("SP", "RJ"...), 8 a 27 UFs;
  1 dataset com o valor de cada UF. Prefira taxas e percentuais (OTIF, crescimento, % do total), não valores absolutos.
- "routeMap": mapa do Brasil com fluxos entre UFs. "labels": [], "datasets": [] e
  "routes": [{ "from": "SP", "to": "BA", "value": 1240 }, ...] com 4 a 10 rotas.`

export const REGRAS_VISUALIZACAO = `REGRAS DE ESCOLHA E DESENHO DOS VISUAIS (OBRIGATÓRIO):

KPIs (camada de resumo — "como estamos indo?"):
- 4 a 6 KPIs por aba, do mais crítico para o menos crítico.
- "change" é sempre a variação vs período anterior. Nunca um número solto.
- "trend" é a direção da mudança ("up", "down", "neutral"). "goodWhen" é o sentido favorável: "up" quando maior é melhor
  (receita, conversão, OTIF), "down" quando menor é melhor (custo, tempo, atraso, churn, inadimplência).
- "icon": escolha o ícone que representa o KPI, SOMENTE desta lista: ${ICON_NAMES.join(', ')}.
- "sparkline": 7 a 12 números do mais antigo ao mais recente, coerentes com "value" e "trend".
- Cada aba também tem "icon" (mesma lista) para o menu de abas e "description": uma frase dizendo o que a aba responde.

Escolha do visual pela pergunta que ele responde (não pelo hábito):
- Onde? (UF, região, origem/destino) → "mapUF" ou "routeMap".
- Bateu a meta? → "bullet". Nunca gauge.
- Como evoluiu? → "line" ou "area".
- Quem é maior? → "horizontalBar" ordenado.
- Do que é feito? → "stackedBar"; "doughnut" só com 2 ou 3 fatias.
- Por que mudou? (decomposição) → "waterfall".
- Onde se perde no processo? → "funnel".
- Quando concentra? (dia x hora, área x mês) → "heatmap".

Variedade (o dashboard não pode parecer um template):
- Cada aba tem EXATAMENTE 4 visuais que respondem perguntas DIFERENTES, com no máximo 1 visual de cada tipo por aba.
  A grade tem 2 colunas: 4 visuais de meia largura fecham 2 linhas. Use "span": 2 só em heatmap largo ou cascata longa,
  e nesse caso a aba tem 3 visuais (1 largo + 2 de meia largura), para não sobrar buraco na grade.
- No dashboard inteiro, use pelo menos 6 tipos diferentes e no máximo 4 "bar"/"horizontalBar" somados.
- Inclua os visuais assinatura do segmento (playbook abaixo) onde fizerem sentido.
- Tabelas são opcionais: no máximo 1 por aba e só onde o detalhe linha a linha ajuda a agir (ex.: entregas atrasadas).

Filtros (campo "filters" na raiz do JSON):
- 1 ou 2 dimensões de negócio para o usuário filtrar (ex.: Canal, Área, Tipo de veículo, Unidade, Produto), com 3 a 6 opções.
- Cada opção precisa aparecer EXATAMENTE igual como rótulo (labels) ou nome de série (datasets.label) em pelo menos 2 visuais,
  ou como valor em uma coluna de tabela. Período e região o app cria sozinho a partir de meses e UFs.

Dados:
- Valores coerentes entre KPIs, gráficos e tabelas da mesma aba.
- Barras e áreas a partir do zero; nada de eixo cortado para exagerar diferenças.`
