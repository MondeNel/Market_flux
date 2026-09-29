/**
 * @file src/app/App.jsx
 *
 * @description
 * Root application component for Market Flux.
 *
 * The application shell provides the global layout while
 * MarketFlux owns the complete game experience.
 */

import AppShell from './AppShell'
import MarketFlux from '../features/market-flux/MarketFlux'

function App() {
  return (
    <AppShell>
      <MarketFlux />
    </AppShell>
  )
}

export default App
