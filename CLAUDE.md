# Dashboard Generator

## O que é este projeto

Aplicação frontend que gera dashboards HTML completos e interativos usando IA (Gemini 1.5 Pro).
O usuário responde um questionário de contexto, a aplicação monta um prompt estruturado e envia para a API do Gemini, que retorna um dashboard HTML funcional renderizado diretamente no navegador.

## Estrutura

```
dashboard-generator/
├── CLAUDE.md
└── frontend/
    └── app.html
```

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
- Modelo: gemini-1.5-pro
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`
- Autenticacao: API Key colada pelo usuario na barra do topo (salva em localStorage)
- Chave obtida em: aistudio.google.com/apikey

## Como rodar

Abrir o arquivo `frontend/app.html` diretamente no navegador (clique duplo).
Nao precisa de servidor, build, npm ou dependencias instaladas.
Opcionalmente usar Live Server no VS Code para hot reload.

## Decisoes tecnicas

- Aplicacao 100% frontend, arquivo HTML unico sem dependencias externas
- Chart.js carregado via CDN (cdn.jsdelivr.net) para os graficos gerados
- API Key armazenada em localStorage para nao precisar colar a cada uso
- Dashboard gerado em iframe isolado para evitar conflito de CSS/JS
- Dados dos dashboards sao sempre ficticios e gerados pela IA

## Prompt estrutura

O prompt enviado ao Gemini tem sempre 4 camadas:
1. Contexto (respostas do usuario — objetivo, decisao, comparacoes)
2. Abas especificas do segmento
3. KPIs obrigatorios do segmento + extras do usuario
4. Template fixo de requisitos tecnicos (dark mode, Chart.js, responsivo, cores, skeleton)

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
