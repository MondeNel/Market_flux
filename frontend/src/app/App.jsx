/**
 * @file src/app/App.jsx
 *
 * @description
 * Root application entry for Market Flux.
 *
 * BrowserRouter provides routing context for the global application
 * navigation and future screens such as Battles, Home, Leaderboard
 * and Wallet.
 */

import { BrowserRouter } from 'react-router-dom'

import AppShell from './AppShell'
import MarketFlux from '../features/market-flux/MarketFlux'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <MarketFlux />
      </AppShell>
    </BrowserRouter>
  )
}

export default App