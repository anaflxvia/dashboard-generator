# Dashboard Generator

## O que é este projeto

Aplicação frontend que gera dashboards HTML completos e interativos usando IA (Gemini 3.8 Flash).
O usuário responde um questionário de contexto, a aplicação monta um prompt estruturado e envia para a API do Gemini, que retorna um dashboard HTML funcional renderizado diretamente no navegador.

## Estrutura

```
dashboard-generator/                 (raiz do repo)
├── CLAUDE.md
├── docs/
│   ├── guia-visuais-dashboard.md    guia de visuais: qual grafico usar, quando e como (base de conhecimento dos prompts)
│   └── design-systems-segmentos.md  temas por segmento gerados com a skill ui-ux-pro-max
├── server.py                        servidor local que serve frontend/ injetando chaves do .env
├── frontend/
│   └── app.html                     versao original em HTML unico
└── dashboard-generator/app/         app Vite + React + TS (versao deployada na Vercel)
    ├── vercel.json
    ├── api/gemini.ts                funcao serverless da Vercel: guarda a chave do Gemini e confere o codigo de acesso
    ├── landing/                     landing page da consultoria (HTML estatico), publicada em /home
    ├── .env                         GEMINI_API_KEY, ACCESS_CODES, (VITE_GEMINI_API_KEY so para o server.py local) VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (nao versionado)
    └── src/
        ├── App.tsx
        ├── components/              ChatInterface, Dashboard, BrandSettings
        │   └── visuals/             VisualCard (escolhe o visual pelo type), ChartJsChart, BrazilMap, HtmlCharts, Icone
        ├── lib/gemini.ts            monta o prompt e chama o Gemini
        ├── lib/dashboardGuide.ts    catalogo de visuais e regras injetados no prompt (resumo do guia)
        ├── lib/segmentPlaybooks.ts  playbook por segmento: abas, KPIs com icone e visuais assinatura
        ├── lib/normalize.ts         valida o JSON da IA e converte o que nao da para desenhar; SCHEMA_VERSION
        ├── lib/icons.ts             lista fechada de icones (lucide-react) e reserva por palavra-chave
        ├── lib/brasil.ts            estados do Brasil (paths SVG, centroides, busca por sigla ou nome)
        ├── lib/exemplos.ts          dashboard de exemplo de logistica
        ├── lib/demos.ts             demos por ?demo= (logistica, financeiro, vendas, rh), com o tema do segmento
        ├── lib/segmentThemes.ts     tema padrao por segmento (skill ui-ux-pro-max)
        ├── lib/fonts.ts             fontes dos temas, carregamento do Google Fonts e monograma
        └── services/
            ├── embeddings.ts        embeddings do Gemini para as respostas do questionario
            └── dashboardCache.ts    cache semantico no Supabase (rpc match_dashboards)
```

Existem duas versoes do app: `frontend/app.html` (HTML unico) e o app React em `dashboard-generator/app/`.

## Como funciona

Fluxo em 3 telas:

1. Questionário — usuário seleciona segmento e responde 5 perguntas em texto livre
2. Prompt gerado — aplicação monta o prompt automaticamente com KPIs do segmento, usuário pode editar
3. Dashboard — Gemini recebe o prompt e retorna HTML completo renderizado em iframe

## Segmentos suportados

Financeiro, CRM / Vendas, Recursos Humanos, Advocacia, Observabilidade TI, FinOps, Gerencial / PMO, Juridico, Educacao, Logistica, SLA / Suporte, Outro.

Cada segmento tem abas, KPIs e tipos de graficos pre-definidos no dicionario `KPI_BASE` dentro do `app.html`.

## API

- Provedor: Google Gemini
- Modelo: gemini-3.8-flash, com reserva gemini-3.6-flash (nos dois apps). Troca automatica quando o primeiro responde 404, 429, 503 ou "modelo indisponivel"
- Alta demanda (503) e limite (429): ate 3 rodadas pelos dois modelos, esperando 3 s e 8 s entre elas; modelo que
  responde 404 sai da lista na hora. Se todas falharem, a mensagem pede para aguardar um ou dois minutos.
  Motivo: o erro "This model is currently experiencing high demand" aparecia na primeira tentativa (out/2026)
- Historico: gemini-2.5-pro deixou de aceitar chaves novas em out/2026 (erro "no longer available to new users"), por isso a troca
- generationConfig: `thinkingConfig: { thinkingLevel: 'low' }` e temperatura padrao (1.0). Nos modelos 3.x o `thinkingBudget` virou legado e nao pode ser enviado junto com `thinkingLevel` (erro 400); temperatura abaixo de 1.0 pode causar loop
- O raciocinio consome tokens de saida: o app HTML usa 65536 e o React 16384 para nao cortar a resposta
- A resposta e lida juntando todas as partes de texto (`parts`), ignorando partes de raciocinio
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent`
- Embeddings (app React): text-embedding-004, com fallback para embedding-001
  - Pendente: verificar se text-embedding-004 ainda responde; o substituto atual e gemini-embedding-001/gemini-embedding-2 (3072 dimensoes por padrao, usar outputDimensionality para casar com a coluna do pgvector)
- Autenticacao:
  - `frontend/app.html`: API Key colada na barra do topo (salva em localStorage) ou injetada pelo `server.py`
  - App React: a chave NAO vai mais para o navegador. `api/gemini.ts` (funcao da Vercel) guarda `GEMINI_API_KEY` e so
    atende com um codigo de acesso valido (`ACCESS_CODES`, separados por virgula). O navegador manda o codigo no
    cabecalho `x-codigo-acesso`; `services/acesso.ts` faz as chamadas e `components/AccessGate.tsx` e a tela de codigo
    (codigo salvo em `localStorage['dashboard_codigo_acesso']`; 401 apaga o codigo e volta para a tela).
    A funcao e um proxy fino: aceita so os modelos da lista (geracao e embeddings), repassa status e corpo do Gemini e o
    app continua tratando 404/429/503 como antes. `?demo=` fica aberto, sem codigo.
    No `npm run dev` o plugin `api-local` do `vite.config.ts` atende `/api/gemini` com o mesmo arquivo, lendo o `.env`
    (`.env.example` lista as variaveis). Na Vercel: Settings > Environment Variables (sem prefixo VITE_)
  - Pendente: sem limite de uso por codigo. Se um codigo vazar, trocar em `ACCESS_CODES` e redeploy
- Supabase (cache semantico) continua no navegador com a chave anon, que e publica por desenho; proteger com RLS
- Chave obtida em: aistudio.google.com/apikey

## Como rodar

HTML unico: abrir `frontend/app.html` no navegador (clique duplo), ou rodar `python server.py`
(porta 3000) para injetar as chaves do `dashboard-generator/app/.env` automaticamente.

App React:
```
cd dashboard-generator/app
npm install
npm run dev
```

Deploy: Vercel com Root Directory = `dashboard-generator/app` (configurado no painel).
O `vercel.json` fica dentro dessa pasta, porque a Vercel so le o arquivo a partir do Root Directory.

### Dominio afkview.com (um projeto na Vercel, duas rotas)

- `afkview.com/home`: landing page da consultoria. Fonte em `dashboard-generator/app/landing/` (HTML unico com as
  imagens das demos em `landing/img/`). O plugin `landing-home` do `vite.config.ts` copia a pasta para `dist/home` no
  build e a serve no `npm run dev` (`localhost:5173/home`)
- `afkview.com/dashboard-generator`: este app React. `base: '/dashboard-generator/'` e `outDir: dist/dashboard-generator`
  no `vite.config.ts`. Demos: `/dashboard-generator/?demo=vendas|financeiro|rh|logistica`
- `afkview.com/` redireciona (307) para `/home`. `vercel.json` tem o redirect e os rewrites de `/home` e
  `/dashboard-generator` sem barra final
- Contato da landing: constante `CONTACT` no fim de `landing/index.html` (e-mail e WhatsApp). Vazios, os botoes ficam
  escondidos e o formulario manda para o LinkedIn. Preencher um deles ativa mailto ou wa.me com a mensagem pronta
- A landing foi desenhada no canvas do Claude Design (versao 4.5, Aurora cinetica, skill ui-ux-pro-max). As capturas
  das demos foram tiradas com o app local em 1440x900
- O dominio precisa estar adicionado em Settings > Domains do projeto na Vercel, com o DNS apontando para a Vercel

## Decisoes tecnicas

- App React: frontend + uma funcao serverless (`api/gemini.ts`) que guarda a chave do Gemini; `frontend/app.html` segue 100% frontend; o `server.py` e so conveniencia local
- O SDK da Anthropic foi removido do app React: nunca foi usado, toda chamada de IA vai para o Gemini via `fetch`
- Chart.js carregado via CDN (cdn.jsdelivr.net) para os graficos gerados
- API Key armazenada em localStorage para nao precisar colar a cada uso
- Dashboard gerado em iframe isolado para evitar conflito de CSS/JS
- Dados dos dashboards sao sempre ficticios e gerados pela IA

## Identidade visual (white-label)

No `frontend/app.html` a identidade fica na etapa 6 do questionario (bloco `IDENTIDADE VISUAL`, chave
`localStorage['dashgen_brand']`), com temas claro e escuro, presets e export para o Figma. O app React usa a
versao abaixo, mais simples, com chave propria (`dashboard_brand`).

### App React

- Tela `components/BrandSettings.tsx`, acessada pelo botao "Identidade visual" no questionario e na sidebar do dashboard
- Configura nome, logo (PNG/SVG/JPG/WebP, ate 512 KB, de 32 a 2048 px) e 5 cores: primaria, secundaria, fundo, superficie, texto
- `lib/brand.ts` deriva os demais tokens (texto sobre primaria, texto secundario, borda, hover) e expoe tudo como variaveis CSS `--brand-*`; o `Dashboard.tsx` usa so essas variaveis (`bg-(--brand-surface)` etc.)
- Contraste WCAG 2.1 AA checado em tempo real. Texto < 4.5:1 bloqueia o salvamento; elementos graficos < 3:1 so geram aviso
- Cores de status (sucesso/erro/alerta) trocam de tom conforme o fundo for claro ou escuro, para manter contraste
- Graficos: series 1 e 2 usam primaria e secundaria; as demais usam uma paleta fixa
- Salva em localStorage (`dashboard_brand`), por navegador. A marca nao entra no prompt: o Gemini devolve so dados, a aparencia e toda do app

## Prompt estrutura

O prompt enviado ao Gemini tem sempre 4 camadas:
1. Contexto (respostas do usuario — objetivo, decisao, comparacoes)
2. Abas especificas do segmento
3. KPIs obrigatorios do segmento + extras do usuario
4. Template fixo de requisitos tecnicos (dark mode, Chart.js, responsivo, cores, skeleton)

## Conhecimento de visualizacao (guia de visuais)

Fonte de verdade: `docs/guia-visuais-dashboard.md` — qual visual usar para cada pergunta
(resumo, tendencia, comparacao, composicao, distribuicao, geoespacial) e as regras de ouro
(data-ink, cores com proposito, layout em Z/F, interatividade).

O guia entra nos prompts em versao resumida, em dois lugares que precisam ficar sincronizados:
- App React: `CATALOGO_VISUAIS` e `REGRAS_VISUALIZACAO` em `lib/dashboardGuide.ts`, limitados aos tipos que
  `components/visuals` renderiza (ver "Visuais dinamicos" abaixo)
- HTML unico: bloco "REGRAS DE VISUALIZACAO" no `TEMPLATE_FIXO` de `frontend/app.html`, que cobre o guia
  quase todo (bullet chart, cascata, scatter, heatmap), porque ali o Gemini escreve o HTML inteiro

Regras garantidas por codigo no app React (nao dependem da IA obedecer):
- `horizontalBar` sempre ordenado do maior para o menor
- Eixo de valor comeca em zero em barras e areas (linhas podem focar na variacao)
- Data-ink: sem borda de eixo, grade so no eixo de valor, legenda escondida com 1 serie, linhas sem marcadores
- Sparkline opcional nos KPIs (`kpi.sparkline`), linha limpa sem eixos

Decisoes tomadas ao aplicar o guia:
- Pizza/rosca limitada a 2-3 fatias (antes o prompt do React pedia 5-7)
- Gauges trocados por bullet chart nos segmentos do `KPI_BASE`
- Roscas com muitas categorias no `KPI_BASE` viraram barras horizontais ordenadas
- No `TEMPLATE_FIXO`: rosca de alocacao virou 3 fatias com total no centro; volatilidade limitada a 4 linhas
- Nao aplicado ainda: paleta "80% neutra" (graficos seguem primaria/secundaria da marca), small multiples,
  rotulos diretos na ponta das linhas, scatter e treemap no app React
- Dashboards antigos no cache do Supabase sao ignorados pelo `SCHEMA_VERSION` (ver abaixo)

## Visuais dinamicos (app React)

Problema que resolveu: o gerador entregava sempre barra, rosca e tabela, porque o app so sabia desenhar
esses tipos e o prompt nao tinha nenhum conhecimento do segmento.

- Tipos de `chart.type`: `bar`, `horizontalBar`, `stackedBar`, `line`, `area`, `pie`, `doughnut`, `waterfall`,
  `bullet`, `funnel`, `heatmap`, `mapUF`, `routeMap`. Formato de cada um em `CATALOGO_VISUAIS`
- Campos novos: `chart.subtitle`, `chart.unit` (formata tooltips, eixos e rankings), `chart.span` (2 = linha inteira),
  `chart.routes` (routeMap), `chart.goodWhen` (cores da cascata), `kpi.icon`, `kpi.goodWhen`, `tab.icon`
- Mapas: `@svg-maps/brazil` (CC BY 4.0, Victor Cazanave). Centroides calculados em `lib/brasil.ts` para ancorar rotas.
  UF aceita sigla ou nome. O coropletico usa escala de uma cor so (neutro ate a primaria) e lista os 5 maiores ao lado;
  o de rotas desenha arcos com espessura pelo volume e tracejado animado no sentido da rota (desliga com reduced-motion)
- Icones: lista fechada em `lib/icons.ts` (nomes do lucide.dev, que o modelo conhece). Nome invalido ou ausente cai
  na reserva por palavra-chave do rotulo (custo -> wallet, km -> fuel, frota -> truck...)
- Cascata: 1o valor e o total inicial, os demais sao variacoes; o total final e calculado no app. Quando as variacoes
  sao pequenas perto do total, o eixo nao parte do zero (unica excecao a regra), senao elas somem
- Prompt: playbook do segmento (`lib/segmentPlaybooks.ts`) + catalogo + regras de variedade (no maximo 1 visual de
  cada tipo por aba, pelo menos 6 tipos no dashboard, no maximo 4 barras somadas). O exemplo de JSON do prompt
  deixou de ser um dashboard de barras, porque o modelo copiava o molde
- `normalizarDashboard` roda na resposta da IA e no cache: mapa com menos de 3 UFs validas vira ranking,
  pizza com mais de 3 fatias vira ranking, bullet sem meta vira ranking, rota sem UF valida e descartada,
  `goodWhen` ausente e inferido pelo rotulo
- `SCHEMA_VERSION` (hoje 2) vai junto no JSON salvo no Supabase. A busca pede os 5 mais parecidos e usa o
  primeiro da versao atual, para nao devolver dashboards no formato antigo
- Tema por segmento (`lib/segmentThemes.ts`): sem marca salva, o dashboard usa o design system do seu segmento,
  gerado com a skill ui-ux-pro-max (estilo, cores e fonte). Marca salva vale para todos os segmentos; "Usar tema do
  segmento" na tela de marca apaga a marca salva. Os temas tambem aparecem como "Tema de partida" na tela de marca.
  Origem e ajustes em `docs/design-systems-segmentos.md`
- `?demo=logistica|financeiro|vendas|rh` abre um dashboard de exemplo sem chamar o Gemini, com o tema do segmento e um
  nome ficticio de empresa; vale ate o usuario salvar outra marca
- Marca aceita `font` (familia do Google Fonts, `lib/fonts.ts`), escolhida na tela de marca entre as fontes dos temas
- Paleta das series: depois de primaria e secundaria, cores extras que nao se parecem com a marca; vermelho e verde
  por ultimo, porque sao cores de status
- Sem logo, o monograma usa as iniciais do nome da marca. Com ou sem logo, o nome da empresa aparece sempre ao lado
  (antes sumia quando havia logo; mesmo ajuste no prototipo e no prompt do `app.html`)
- Pendente: testar o prompt novo com o Gemini em todos os segmentos e ajustar playbooks pelo resultado

## Cabecalho, filtros e grade (app React)

- Sem sidebar. De cima para baixo: cabecalho so com logo e nome da empresa; titulo "Segmento · Titulo do dashboard"
  com identidade visual, novo dashboard e "Exportar PDF" (window.print()) a direita; filtros com "Limpar filtros" e
  "Atualizado em" (`generatedAt`, gravado na geracao; demos mostram a hora de abertura); abas (icone + nome; hover com
  tom suave da primaria, aba ativa na primaria solida, transicao de 200 ms), presas no topo ao rolar; conteudo.
  A frase `tab.description` e o nome da aba como titulo sairam a pedido (a aba selecionada ja mostra onde se esta)
- Filtros (`lib/filters.ts`) recortam o que ja esta desenhado, porque os dados vem agregados; os KPIs nao mudam e o
  app avisa isso quando ha filtro ativo. Periodo: ultimos 3/6/12 pontos das series temporais (rotulos de mes, trimestre,
  ano, data). Regiao: mapas, rotas, graficos e tabelas com UF, estado ou regiao. Dimensoes: campo `filters` do JSON
  (a IA define 1 ou 2, ex.: Canal, Area), aplicado a graficos cujos rotulos ou series batem com as opcoes e a colunas
  de tabela. Cascata e funil nao sao recortados. Visual afetado ganha o selo "Filtrado"; vazio mostra aviso
- Grade sem buraco: o prompt pede exatamente 4 visuais por aba (ou 3 com um largo) e `completarGrade` alarga o visual
  que ficaria sozinho na linha, entao nunca sobra celula vazia mesmo quando a IA nao obedece
- Troca de aba com fade de 220 ms (desligado em prefers-reduced-motion)
- Tema claro/escuro: botao (sol/lua) ao lado de identidade visual. A marca guarda as cores de um modo so; `brandNoModo`
  (`lib/brand.ts`) deriva o outro com fundo, superficie e texto neutros e primaria/secundaria clareadas ou escurecidas
  ate passar o contraste (4,5:1 e 3,2:1 sobre a superficie). Comeca no modo da marca; a escolha fica em
  `localStorage['dashboard_modo']`. O botao tinha sumido quando o white-label novo substituiu o anterior
- No `frontend/app.html` o template pede o mesmo layout: cabecalho so com logo e nome, titulo, filtros funcionais com
  "Limpar filtros" e "Atualizado em", abas com hover e selecao, e exatamente 4 visuais por aba

## Visuais dinamicos (frontend/app.html)

No HTML unico o Gemini escreve o dashboard inteiro, entao a mesma ideia entra de outro jeito:
- DashKit: script com o mapa do Brasil (mesmo pacote do app React) e o loader de icones lucide (lucide@1.55.0 via
  jsdelivr). Fica no bloco `<script type="text/plain" id="dashkit-src">` e `injetarKitVisual()` o coloca no inicio do
  `<head>` de cada dashboard, na exibicao (vale tambem para o cache). A IA so chama `DashKit.mapaUF(id, { valores, unidade })`
  e `DashKit.mapaRotas(id, { rotas: [{ de, para, valor }], unidade })` dentro de `inicializarTodos()`
- Cor dos mapas: `--primary` do dashboard quando for hex (acompanha o tema), senao a primaria da marca ou a padrao.
  Estados e textos usam currentColor e opacidade, para funcionar no claro e no escuro
- Icones: a IA escreve `<i data-lucide="nome">` com nomes de `ICONES_PERMITIDOS` (mesma lista de `lib/icons.ts`);
  um MutationObserver troca tambem os icones criados por JS depois do load
- `KPI_BASE` ganhou visuais assinatura por segmento em `graficos` e o campo `icones` (sugestao por KPI)
- Template: bloco VISUAIS ESPECIAIS (mapas, bullet, funil e heatmap em HTML, cascata) e regras de VARIEDADE
  (pelo menos 6 tipos e 2 visuais especiais no dashboard, no maximo 4 barras e 1 rosca). As abas fixas
  (Alocacao, Variacao, Predicao) so valem quando o dashboard tem essa aba
- Abas validas: `validarAbas` aceita `canvas` ou container com `data-visual`, para nao remover aba so com mapa
- Tema por segmento: com a identidade visual desativada, `marcaEfetiva()` usa `TEMAS_SEGMENTO` (mesmos temas do React,
  em versao clara e escura) e o prompt recebe o bloco "TEMA VISUAL DO SEGMENTO" com tokens e fonte, sem nome de empresa.
  Antes, sem marca, todo dashboard saia no mesmo tema escuro indigo (`PALETA_TEMPLATE_PADRAO`, hoje sem uso no prompt)
- Ao mudar `lib/icons.ts`, `lib/brasil.ts`, `segmentPlaybooks.ts` ou `segmentThemes.ts` no React, atualize o equivalente aqui

## Principios de desenvolvimento (baseado no metodo Akita)

### One-shot prompt e um mito
Nao existe "gerar tudo de uma vez e funcionar". O dashboard generator e iterativo por natureza:
a cada teste, ajusta o prompt, refina o template fixo, melhora os KPIs sugeridos.
Trate cada geracao como um ciclo curto de feedback, nao como entrega final.

### O CLAUDE.md e uma spec viva
Este arquivo nao e documentacao estatica. E a fonte de verdade do projeto.
Toda decisao tecnica relevante deve ser registrada aqui: o que mudou, por que mudou,
o que foi tentado e descartado. O agente le este arquivo antes de qualquer tarefa.

### Pair programming com IA
O desenvolvedor nao e espectador. Ele define o contexto (este arquivo),
revisa cada saida, decide o que aceitar ou rejeitar, e guia a proxima iteracao.
A IA executa, o desenvolvedor pensa e decide.

### Escopo pequeno e controlado
Cada sessao de trabalho tem um objetivo claro e pequeno:
ajustar o template do prompt, adicionar um segmento, corrigir o layout.
Nao tente fazer tudo de uma vez. Entregue, teste, ajuste.

### Software nunca esta pronto
O estado atual do projeto e um ponto de partida, nao um destino.
Pos-deploy e onde o projeto de verdade comeca: feedback real, casos nao previstos,
melhorias que so aparecem no uso cotidiano.

## Proximos passos sugeridos

- Conectar dados reais via upload de CSV
- Salvar dashboards gerados localmente
- Adicionar mais segmentos
- Permitir regenerar apenas uma aba sem refazer o dashboard completo
