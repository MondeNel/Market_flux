import AppShell from './AppShell'

import MarketFluxHeader from '../features/market-flux/components/MarketFluxHeader'
import MarketSelector from '../features/market-flux/components/MarketSelector'

/**
 * Root application component for Market Flux.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <AppShell>
      <MarketFluxHeader />

      <MarketSelector />
    </AppShell>
  )
}

export default App