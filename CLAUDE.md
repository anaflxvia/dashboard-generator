# Dashboard Generator

## O que é este projeto

Aplicação frontend que gera dashboards HTML completos e interativos usando IA (Gemini 2.5 Pro).
O usuário responde um questionário de contexto, a aplicação monta um prompt estruturado e envia para a API do Gemini, que retorna um dashboard HTML funcional renderizado diretamente no navegador.

## Estrutura

```
dashboard-generator/                 (raiz do repo)
├── CLAUDE.md
├── docs/
│   └── guia-visuais-dashboard.md    guia de visuais: qual grafico usar, quando e como (base de conhecimento dos prompts)
├── server.py                        servidor local que serve frontend/ injetando chaves do .env
├── frontend/
│   └── app.html                     versao original em HTML unico
└── dashboard-generator/app/         app Vite + React + TS (versao deployada na Vercel)
    ├── vercel.json
    ├── .env                         VITE_GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (nao versionado)
    └── src/
        ├── App.tsx
        ├── components/              ChatInterface, Dashboard
        ├── lib/gemini.ts            monta o prompt e chama o Gemini
        ├── lib/dashboardGuide.ts    regras de visualizacao injetadas no prompt (resumo do guia)
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
- Modelo: gemini-2.5-pro (app React cai para gemini-2.5-flash se falhar)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent`
- Embeddings (app React): text-embedding-004, com fallback para embedding-001
- Autenticacao:
  - `frontend/app.html`: API Key colada na barra do topo (salva em localStorage) ou injetada pelo `server.py`
  - App React: `VITE_GEMINI_API_KEY` no `.env`
- ATENCAO: variaveis `VITE_*` sao embutidas no JS do navegador. No deploy da Vercel a chave do Gemini fica publica. Pendente: mover as chamadas para uma funcao serverless.
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

## Decisoes tecnicas

- Aplicacao 100% frontend (sem backend proprio); o `server.py` e so conveniencia local
- O SDK da Anthropic foi removido do app React: nunca foi usado, toda chamada de IA vai para o Gemini via `fetch`
- Chart.js carregado via CDN (cdn.jsdelivr.net) para os graficos gerados
- API Key armazenada em localStorage para nao precisar colar a cada uso
- Dashboard gerado em iframe isolado para evitar conflito de CSS/JS
- Dados dos dashboards sao sempre ficticios e gerados pela IA

## Identidade visual (white-label, app React)

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
- App React: `REGRAS_VISUALIZACAO` em `lib/dashboardGuide.ts`, limitada aos tipos que o `Dashboard.tsx`
  renderiza: `bar`, `horizontalBar`, `line`, `area`, `pie`, `doughnut`
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
  rotulos diretos na ponta das linhas e tooltips ricos no app React
- Dashboards antigos no cache do Supabase foram gerados com as regras anteriores e podem voltar por similaridade

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
