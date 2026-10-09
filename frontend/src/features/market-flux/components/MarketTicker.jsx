/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market Flux market selector row.
 */

import MarketSelector from './MarketSelector'

/**
 * @param {object} props
 * @param {object} props.market Selected market.
 * @param {object[]} props.markets All markets.
 * @param {boolean} props.canSelect Whether the market can be changed now.
 * @param {(marketId: string) => void} props.onSelect Market selection handler.
 * @returns {JSX.Element}
 */
function MarketTicker({
  market,
  markets,
  canSelect,
  onSelect,
}) {
  return (
    <div
      className="
        relative
        flex
        justify-center
      "
    >
      <MarketSelector
        markets={markets}
        selected={market}
        onSelect={onSelect}
        disabled={!canSelect}
      />
    </div>
  )
}

export default MarketTicker