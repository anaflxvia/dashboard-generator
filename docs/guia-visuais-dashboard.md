# Guia de Visuais de Dashboard

Referencia de conhecimento usada nos prompts de geracao. A versao resumida que vai para a IA fica em
`dashboard-generator/app/src/lib/dashboardGuide.ts` (app React) e no `TEMPLATE_FIXO` de `frontend/app.html`.
Ao mudar uma regra aqui, atualize os dois.

## 1. Resumo e KPIs — "Como estamos indo no geral?"

**BAN (Big Ass Number) / Cartoes de KPI**
- O que e: numero grande e isolado, com indicador de tendencia (seta, variacao %).
- Quando usar: para a metrica mais critica do negocio (ex.: Receita Total, Churn Rate).
- Como usar: nunca sem contexto. "R$ 1 milhao" e bom ou ruim? Sempre adicione a comparacao (vs meta, vs mes anterior, vs ano anterior).

**Sparklines (minigraficos)**
- O que e: grafico de linha minusculo, sem eixos, ao lado de um texto ou BAN.
- Quando usar: para dar contexto historico rapido a um KPI.
- Como usar: ultimos 7, 12 ou 30 pontos. Linha limpa, sem marcadores (dots).

**Bullet Chart (grafico de bala)**
- O que e: evolucao moderna do gauge. Mostra a metrica atual, a meta (uma linha) e faixas de desempenho (ruim, regular, bom).
- Quando usar: para comparar realizado vs meta e ainda entender a performance qualitativa.
- Como usar: substitua sempre gauges circulares por bullet charts. Gauges ocupam muito espaco e sao dificeis de ler.

## 2. Tendencia e tempo — "Como estamos mudando ao longo do tempo?"

**Linhas**
- Quando usar: series temporais continuas (dias, meses, anos).
- Como usar: no maximo 3 ou 4 linhas. Para comparar mais, use small multiples (varios graficos pequenos). Prefira rotulos diretos na ponta das linhas a legendas laterais.

**Area (simples e empilhada)**
- Quando usar: quando o volume total importa tanto quanto a tendencia, ou para composicao ao longo do tempo (empilhada).
- Como usar: transparencia (alpha) nas areas para ver o que esta atras quando as linhas se cruzam. Nunca use area empilhada se os dados nao comecarem no zero.

**Colunas (para tempo)**
- Quando usar: periodos discretos (faturamento por ano, por trimestre).
- Como usar: deixe um pequeno espaco entre as colunas para indicar que o tempo e discreto.

## 3. Comparacao — "Quem esta performando melhor ou pior?"

**Barras horizontais**
- Quando usar: comparar categorias, especialmente com nomes longos ou mais de 5 categorias.
- Como usar: sempre ordenadas (maior para menor, ou o inverso). Nunca desordenadas.

**Colunas verticais**
- Quando usar: poucas categorias (ate 5) com nomes curtos.
- Como usar: eixo Y rigorosamente no zero. Cortar o eixo em colunas e considerado manipulacao de dados.

**Cascata (Waterfall)**
- Quando usar: mostrar como um valor inicial e afetado por valores positivos e negativos ate o final (ex.: Lucro Bruto -> Impostos -> Custos -> Lucro Liquido).
- Como usar: cores semanticas — verde para ganhos, vermelho para perdas, cinza/azul para totais.

## 4. Composicao — "Do que isso e feito?"

**Pizza / Rosca**
- Quando usar: apenas com 2 a 3 categorias e soma exatamente 100%.
- Como usar: o olho e pessimo comparando angulos; com mais de 3 fatias, nao use. Na rosca, use o centro para o KPI total.

**Barras/colunas empilhadas (100%)**
- Quando usar: proporcao das partes de um todo ao longo do tempo ou entre categorias.
- Como usar: no maximo 3 ou 4 fatias empilhadas; agrupe o resto em "Outros".

**Treemap**
- Quando usar: composicao hierarquica com muitas categorias (ex.: faturamento por categoria e subcategoria).
- Como usar: tamanho = volume (ex.: receita); cor = segunda metrica (ex.: margem).

## 5. Distribuicao e relacionamento — "Como os dados se espalham e se correlacionam?"

**Dispersao (Scatter)**
- Quando usar: provar ou negar correlacao entre duas variaveis continuas (ex.: preco vs volume vendido).
- Como usar: adicione linha de tendencia. Tamanho da bolha = 3a variavel, cor = 4a.

**Box Plot**
- Quando usar: comparar distribuicoes entre categorias e identificar outliers.
- Como usar: otimo para RH (salario por departamento) e qualidade (tempo de entrega por filial).

**Heatmap (matriz)**
- Quando usar: cruzar duas categorias e mostrar intensidade (ex.: vendas por dia da semana x hora).
- Como usar: paleta sequencial (claro -> escuro).

## 6. Geoespacial — "Onde as coisas estao acontecendo?"

**Mapa coropletico**
- Quando usar: densidade ou taxas por regiao (estados, paises).
- Como usar: sempre taxas (per capita, % de crescimento), nunca valores absolutos — senao as regioes populosas sempre parecem as mais importantes.

**Mapa de bolhas**
- Quando usar: volumes absolutos em coordenadas especificas (ex.: vendas por cidade).

## 7. Avancados / nicho

- **Sankey:** fluxos, funis de conversao complexos, transferencia de valores (origem do lead -> estagio -> conversao).
- **Gantt / Timeline:** gestao de projetos, alocacao de recursos, cronogramas.
- **Rede (Network):** relacoes complexas (organograma, supply chain). Com moderacao — gera "espaguete visual".

## Regras de ouro de design

1. **Data-ink ratio:** apague tudo que nao e dado. Sem bordas de grafico, gridlines removidas ou bem claras, sem eixos duplicados.
2. **Cores com proposito:**
   - Categoricas: diferenciar grupos.
   - Sequenciais: intensidade (claro -> escuro).
   - Divergentes/semanticas: vermelho = abaixo da meta, verde = acima, cinza = contexto.
   - Deixe ~80% do dashboard em tons neutros e use uma cor vibrante so para o insight que importa.
3. **Layout em Z ou F:** topo esquerdo = BANs (KPIs principais); centro = tendencia e comparacao; base = tabelas, mapas e analises secundarias.
4. **Interatividade inteligente:** filtros globais no topo ou na lateral, sem entupir a tela. Tooltips ricos (ex.: minigrafico com o mix de produtos ao passar o mouse na barra de vendas).
