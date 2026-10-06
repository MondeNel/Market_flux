/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market Flux market selector row.
 *
 * Sits directly beneath the player header. It is just the market dropdown,
 * centred, as in the layout sketch:
 *
 *                 [ Bitcoin  ▼ ]
 *
 * The live price is NOT shown here. The reel shows the round result and
 * the live price row beneath it (LivePriceRow) shows the market itself.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * This component renders no landmark and no horizontal padding. The wrapper
 * in MarketFlux.jsx owns both, and must sit above the layers below it
 * (z-50) so the dropdown tray is never covered.
 *
 * Presentational only; all game state comes from the simulation hook.
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