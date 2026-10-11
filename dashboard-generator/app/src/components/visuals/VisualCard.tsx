import type { ChartConfig } from '../../types'
import type { BrandTokens } from '../../lib/brand'
import ChartJsChart from './ChartJsChart'
import { ChoroplethMap, RouteMap } from './BrazilMap'
import { BulletChart, FunnelChart, Heatmap } from './HtmlCharts'

// altura do corpo do card por tipo: mapas e heatmaps pedem mais espaco que um grafico de linhas
const ALTURA: Partial<Record<ChartConfig['type'], string>> = {
  mapUF: 'min-h-72',
  routeMap: 'min-h-72',
  heatmap: 'min-h-56',
  bullet: 'min-h-56',
  funnel: 'min-h-56',
}

function Corpo({ chart, tokens }: { chart: ChartConfig; tokens: BrandTokens }) {
  switch (chart.type) {
    case 'mapUF':
      return <ChoroplethMap chart={chart} tokens={tokens} />
    case 'routeMap':
      return <RouteMap chart={chart} tokens={tokens} />
    case 'bullet':
      return <BulletChart chart={chart} tokens={tokens} />
    case 'funnel':
      return <FunnelChart chart={chart} tokens={tokens} />
    case 'heatmap':
      return <Heatmap chart={chart} tokens={tokens} />
    default:
      return <div className="h-60"><ChartJsChart chart={chart} tokens={tokens} /></div>
  }
}

export default function VisualCard({ chart, tokens, filtrado = false, vazio = false }: {
  chart: ChartConfig
  tokens: BrandTokens
  filtrado?: boolean
  vazio?: boolean
}) {
  return (
    <section
      className={`bg-(--brand-surface) border border-(--brand-border) rounded-xl p-5 flex flex-col transition-colors duration-200 hover:border-(--brand-muted) ${
        chart.span === 2 ? 'lg:col-span-2' : ''
      }`}
    >
      <header className="mb-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-(--brand-text) font-medium text-sm">{chart.title}</h3>
          {chart.subtitle && <p className="text-(--brand-muted) text-xs mt-0.5">{chart.subtitle}</p>}
        </div>
        {filtrado && (
          <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-(--tab-hover) text-(--brand-primary)">Filtrado</span>
        )}
      </header>
      <div className={`flex-1 ${ALTURA[chart.type] ?? ''}`}>
        {vazio ? (
          <div className="h-full min-h-40 flex items-center justify-center text-sm text-(--brand-muted)">
            Sem dados para os filtros escolhidos
          </div>
        ) : (
          <Corpo chart={chart} tokens={tokens} />
        )}
      </div>
    </section>
  )
}
