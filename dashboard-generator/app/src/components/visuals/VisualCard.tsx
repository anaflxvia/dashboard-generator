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

export default function VisualCard({ chart, tokens }: { chart: ChartConfig; tokens: BrandTokens }) {
  return (
    <section
      className={`bg-(--brand-surface) border border-(--brand-border) rounded-xl p-5 flex flex-col ${
        chart.span === 2 ? 'lg:col-span-2' : ''
      }`}
    >
      <header className="mb-4">
        <h3 className="text-(--brand-text) font-medium text-sm">{chart.title}</h3>
        {chart.subtitle && <p className="text-(--brand-muted) text-xs mt-0.5">{chart.subtitle}</p>}
      </header>
      <div className={`flex-1 ${ALTURA[chart.type] ?? ''}`}>
        <Corpo chart={chart} tokens={tokens} />
      </div>
    </section>
  )
}
