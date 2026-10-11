# Design systems das demos

Gerados com a skill [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(`search.py --design-system --density 8`, mais buscas `--domain color` e `--domain typography`).
Aplicados nas marcas de `dashboard-generator/app/src/lib/demos.ts`.

| Demo | Busca | Estilo | Cores (marca) | Fonte | Ajustes |
|---|---|---|---|---|---|
| `?demo=financeiro` | financial analytics dashboard banking + fintech banking dark | Dark Mode (OLED) | fundo #020617, card #0E1223, texto #F8FAFC, primaria #F59E0B, secundaria #A78BFA | Fira Sans (par "Dashboard Data") | verde de destaque da skill trocado pelo dourado da paleta Fintech (verde e cor de status); roxo #8B5CF6 clareado para 3:1 no fundo escuro |
| `?demo=vendas` | sales crm pipeline dashboard + modern saas dashboard friendly | Flat Design | fundo #F8FAFC, card #FFFFFF, texto #0F172A, primaria #2563EB, secundaria #0891B2 | Plus Jakarta Sans (par "Friendly SaaS") | secundaria da skill (#3B82F6) quase igual a primaria e verde de negocio reservado para status: ciano na 2a serie |
| `?demo=rh` | hr people analytics dashboard | Data-Dense Dashboard | fundo #F8FAFC, card #FFFFFF, texto #172554, primaria #1E40AF, secundaria #D97706 | Inter | texto um tom mais escuro que o sugerido (#1E3A8A) para o texto secundario passar 4,5:1 |

Regras da skill que entraram no app: icones SVG (nunca emoji), contraste 4,5:1, foco visivel,
`prefers-reduced-motion` respeitado (tracejado das rotas), densidade alta de dashboard.
