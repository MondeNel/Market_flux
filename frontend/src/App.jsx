/**
 * @file App.jsx
 *
 * @description
 * Root component for the Market Flux prototype.
 *
 * Current screen composition:
 * - Global AppShell
 * - Market Flux player header
 * - Market selector
 * - Market number spinner
 */

import { useState } from 'react'

import AppShell from './components/layouts/AppShell'
import MarketFluxHeader from './features/market-flux/MarketFluxHeader'
import MarketSelector from './features/market-flux/MarketSelector'
import MarketNumberSpinner from './features/market-flux/MarketNumberSpinner'

/**
 * Root application component.
 *
 * @returns {JSX.Element}
 */
function App() {
  const [selectedMarket, setSelectedMarket] = useState('BTC/USDT')
  const [marketValue, setMarketValue] = useState(86538.74)

  /**
   * Handle a market-number spin.
   *
   * @param {number} nextValue - Updated market value.
   * @param {'up'|'down'} nextDirection - Direction of the spin.
   */
  const handleSpin = (nextValue, nextDirection) => {
    setMarketValue(nextValue)

    console.log(
      `Market moved ${nextDirection}:`,
      nextValue,
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen w-full">
        {/* HEADER */}

        <MarketFluxHeader />

        {/* GAME AREA */}

        <main className="w-full">
          {/* MARKET SELECTOR */}

          <MarketSelector
            value={selectedMarket}
            onChange={setSelectedMarket}
          />

          {/* MARKET NUMBER SPINNER */}

          <MarketNumberSpinner
            value={marketValue}
            onSpin={handleSpin}
          />
        </main>
      </div>
    </AppShell>
  )
}

export default App