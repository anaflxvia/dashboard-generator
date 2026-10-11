# Design systems por segmento

Tema padrao de cada segmento, usado quando o usuario nao salvou uma identidade visual (app React) ou nao
ativou a etapa de marca (`frontend/app.html`). Gerados com a skill
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(`search.py "<segmento> dashboard" --design-system --density 8`, mais buscas `--domain color` e `--domain typography`).

Onde ficam: `dashboard-generator/app/src/lib/segmentThemes.ts` (React) e `TEMAS_SEGMENTO` em `frontend/app.html`
(com a versao clara e a escura). As demos (`?demo=logistica|financeiro|vendas|rh`) usam esses temas com um nome
ficticio de empresa.

Regras aplicadas sobre a sugestao da skill:
- Verde e vermelho sao cores de status (variacao boa/ruim), entao nao viram primaria nem secundaria
- Contraste WCAG AA: texto 4,5:1 (inclusive o secundario derivado), primaria com texto do botao 4,5:1, series 3:1
- Uma fonte por marca (a de texto do par sugerido)
- No `app.html`, o modo que a skill nao recomendou foi derivado clareando ou escurecendo primaria e secundaria
  ate passar o contraste

| Segmento | Estilo da skill | Modo | Cores | Fonte | Ajuste |
|---|---|---|---|---|---|
| Financeiro | Dark Mode (OLED) | escuro | fundo #020617, card #0E1223, texto #F8FAFC, primaria #F59E0B, secundaria #A78BFA | Fira Sans | verde de destaque trocado pelo dourado da paleta Fintech (verde e cor de status) |
| CRM / Vendas | Flat Design | claro | fundo #F8FAFC, card #FFFFFF, texto #0F172A, primaria #2563EB, secundaria #0891B2 | Plus Jakarta Sans | secundaria em ciano: a da skill era quase igual a primaria e o verde e de status |
| Recursos Humanos | Data-Dense Dashboard | claro | fundo #F8FAFC, card #FFFFFF, texto #172554, primaria #1E40AF, secundaria #D97706 | Inter | texto um tom mais escuro para o secundario passar 4,5:1 |
| Advocacia | Accessible & Ethical | claro | fundo #F8FAFC, card #FFFFFF, texto #0F172A, primaria #1E3A8A, secundaria #B45309 | Lato | so a fonte de texto (Lato); EB Garamond dos titulos fica de fora porque a marca tem uma fonte |
| Observabilidade TI | Glassmorphism | escuro | fundo #0F172A, card #1B2336, texto #F8FAFC, primaria #38BDF8, secundaria #A78BFA | Fira Sans | primaria da skill (#1E293B) some no fundo escuro e o verde e de status: ciano e lilas; sem efeitos de vidro |
| FinOps | Minimalism & Swiss Style | claro | fundo #F8FAFC, card #FFFFFF, texto #1E293B, primaria #2563EB, secundaria #EA580C | Fira Sans | - |
| Gerencial / PMO | Flat Design | claro | fundo #EEF2FF, card #FFFFFF, texto #1E1B4B, primaria #4F46E5, secundaria #0891B2 | Space Grotesk | primaria e texto um tom mais escuros (contraste do botao e do texto secundario); verde de destaque trocado por ciano |
| Jurídico | Accessible & Ethical | claro | fundo #F8FAFC, card #FFFFFF, texto #0F172A, primaria #1E3A8A, secundaria #B45309 | Lato | mesmo design system de Advocacia |
| Educação | Claymorphism | claro | fundo #EEF2FF, card #FFFFFF, texto #1E1B4B, primaria #4F46E5, secundaria #EA580C | Baloo 2 | Comic Neue (texto) descartada por legibilidade em tabelas; fica so Baloo 2 |
| Logística | HUD / Sci-Fi FUI | escuro | fundo #0D1117, card #182424, texto #E6EDF3, primaria #22D3EE, secundaria #F59E0B | Fira Sans | verde terminal (#00FF41) trocado por ciano: verde e cor de status |
| SLA / Suporte | Dark Mode (OLED) | escuro | fundo #0F172A, card #111827, texto #F8FAFC, primaria #60A5FA, secundaria #FBBF24 | Fira Sans | verde operacional e vermelho de incidente ficam so para status; azul e ambar nas series |
| Outro | Data-Dense Dashboard | claro | fundo #F8FAFC, card #FFFFFF, texto #172554, primaria #1E40AF, secundaria #D97706 | Fira Sans | texto um tom mais escuro para o secundario passar 4,5:1 |

Regras da skill que entraram no app: icones SVG (nunca emoji), contraste 4,5:1, foco visivel,
`prefers-reduced-motion` respeitado (tracejado das rotas), densidade alta de dashboard.
