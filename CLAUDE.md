# Dashboard Generator

## O que é este projeto

Aplicação frontend que gera dashboards HTML completos e interativos usando IA (Gemini 2.5 Pro).
O usuário responde um questionário de contexto, a aplicação monta um prompt estruturado e envia para a API do Gemini, que retorna um dashboard HTML funcional renderizado diretamente no navegador.

## Estrutura

```
dashboard-generator/                 (raiz do repo)
├── CLAUDE.md
├── server.py                        servidor local que serve frontend/ injetando chaves do .env
├── frontend/
│   └── app.html                     versao original em HTML unico (com identidade visual white-label)
└── dashboard-generator/app/         app Vite + React + TS (versao deployada na Vercel)
    ├── vercel.json
    ├── .env                         VITE_GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (nao versionado)
    └── src/
        ├── App.tsx
        ├── components/              ChatInterface, Dashboard
        ├── lib/gemini.ts            monta o prompt e chama o Gemini
        └── services/
            ├── embeddings.ts        embeddings do Gemini para as respostas do questionario
            └── dashboardCache.ts    cache semantico no Supabase (rpc match_dashboards)
```

Existem duas versoes do app: `frontend/app.html` (HTML unico) e o app React em `dashboard-generator/app/`.

## Como funciona

Fluxo em 3 telas:

1. Questionário — usuário seleciona segmento, responde 5 perguntas em texto livre e, opcionalmente, configura a identidade visual da marca (etapa 6, so no `frontend/app.html`)
2. Prompt gerado — aplicação monta o prompt automaticamente com KPIs do segmento, usuário pode editar
3. Dashboard — Gemini recebe o prompt e retorna HTML completo renderizado em iframe

## Segmentos suportados

Financeiro, CRM / Vendas, Recursos Humanos, Advocacia, Observabilidade TI, FinOps, Gerencial / PMO, Juridico, Educacao, Logistica, SLA / Suporte, Outro.

Cada segmento tem abas, KPIs e tipos de graficos pre-definidos no dicionario `KPI_BASE` dentro do `app.html`.

## API

- Provedor: Google Gemini
- Modelo: gemini-3.8-flash, com reserva gemini-3.6-flash (nos dois apps). Troca automatica quando o primeiro responde 404, 429, 503 ou "modelo indisponivel"
- Historico: gemini-2.5-pro deixou de aceitar chaves novas em out/2026 (erro "no longer available to new users"), por isso a troca
- generationConfig: `thinkingConfig: { thinkingLevel: 'low' }` e temperatura padrao (1.0). Nos modelos 3.x o `thinkingBudget` virou legado e nao pode ser enviado junto com `thinkingLevel` (erro 400); temperatura abaixo de 1.0 pode causar loop
- O raciocinio consome tokens de saida: o app HTML usa 65536 e o React 16384 para nao cortar a resposta
- A resposta e lida juntando todas as partes de texto (`parts`), ignorando partes de raciocinio
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent`
- Embeddings (app React): text-embedding-004, com fallback para embedding-001
  - Pendente: verificar se text-embedding-004 ainda responde; o substituto atual e gemini-embedding-001/gemini-embedding-2 (3072 dimensoes por padrao, usar outputDimensionality para casar com a coluna do pgvector)
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

## Prompt estrutura

O prompt enviado ao Gemini tem 4 camadas, mais uma quando a marca esta ativa:
1. Contexto (respostas do usuario — objetivo, decisao, comparacoes)
2. Abas especificas do segmento
3. KPIs obrigatorios do segmento + extras do usuario
4. Template fixo de requisitos tecnicos (dark mode, Chart.js, responsivo, cores, skeleton), montado por `montarTemplateFixo(paleta)`
5. Identidade visual da marca (opcional): tokens dos temas claro e escuro, fonte, logo e regras de botoes; substitui cores, fonte e tema do template

Sem a marca ativa, o template sai identico ao original (`PALETA_TEMPLATE_PADRAO`).

## Identidade visual (white-label)

Etapa 6 do questionario em `frontend/app.html`, opcional. Codigo no bloco `IDENTIDADE VISUAL` do arquivo.

- Entrada: nome da empresa, logo (PNG/JPG/SVG/WebP ate 2 MB; bitmaps reduzidos a 320px), 4 cores por tema (primaria, secundaria, fundo, superficie), fonte e tema inicial
- Paletas de partida em `BRAND_PRESETS`
- `derivarTokens(modo)` calcula texto, bordas, sidebar e texto sobre primaria/secundaria (branco ou grafite, o de maior contraste)
- Cores semanticas (sucesso, erro, alerta, info) sao fixas e reservadas para status, nunca usadas como serie de grafico
- Checagem WCAG no painel: 4,5:1 para texto, 3:1 para componentes e graficos (so alerta, nao bloqueia)
- Prototipo ao vivo: `montarPrototipoHTML()` gera um dashboard local, sem IA, em iframe (sidebar, logo, 4 KPIs do segmento, barras, linha realizado vs meta, tabela e tela de design system). Dados deterministicos; filtros de periodo e regiao recalculam tudo; alteracoes chegam por `postMessage`
- Logo fora do prompt: a IA usa o placeholder `__BRAND_LOGO__` e `injetarLogoMarca()` troca pelo arquivo na exibicao, inclusive no cache
- Export: JSON no formato Tokens Studio (sets global, light, dark e $themes) para importar no Figma
- Persistencia: `localStorage['dashgen_brand']`; se o logo exceder a cota, vale so na sessao

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

- Levar a identidade visual para o app React (tokens em CSS vars, KPICard com sentido favoravel)
- Conectar dados reais via upload de CSV
- Salvar dashboards gerados localmente
- Adicionar mais segmentos
- Permitir regenerar apenas uma aba sem refazer o dashboard completo
