/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market Flux asset row.
 *
 * Sits directly beneath the player header.
 *
 * LAYOUT
 * ---------------------------------------------------------------------------
 *   [ market selector ]            [ price + change ]  [ sparkline ]
 *
 * - Left: the market selector dropdown.
 * - Right: live price, percentage change and a short price sparkline.
 *
 * The big reel is NOT rendered here. It is the hero of the game screen and
 * is owned by MarketFlux.jsx.
 *
 * PERCENTAGE CHANGE
 * ---------------------------------------------------------------------------
 * - While a round is in progress: change since the round opened. The
 *   sparkline also draws a dashed line at the round-open price, so it is
 *   obvious which side of the player's prediction the market is on.
 * - Otherwise: change across the sparkline window (about the last minute).
 *
 * The component keeps its own short price history, reset whenever the
 * market changes.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * This component renders no landmark and no horizontal padding. The
 * section in MarketFlux.jsx owns both, and must sit above the layers below
 * it (z-50) so the selector dropdown is never covered.
 *
 * Presentational only; all game state comes from the simulation hook.
 */

import { useState } from 'react'

import MarketSelector from './MarketSelector'
import Sparkline from './Sparkline'

/**
 * Sparkline window. The simulation ticks once a second, so this is
 * roughly the last minute of prices.
 */
const MAX_POINTS = 60

const TREND_TEXT = {
  up: 'text-emerald-300',
  down: 'text-rose-300',
  flat: 'text-slate-300',
}

const TREND_GLYPH = {
  up: '▲',
  down: '▼',
  flat: '–',
}

/**
 * @param {object} props
 * @param {object} props.market Selected market.
 * @param {object[]} props.markets All markets.
 * @param {number} props.price Current price.
 * @param {boolean} props.canSelect Whether the market can be changed now.
 * @param {(marketId: string) => void} props.onSelect Market selection handler.
 * @param {'idle'|'live'|'revealing'|'result'} [props.phase='idle'] Round phase.
 * @param {number} [props.changePct=0] Change since the round opened.
 * @param {number} [props.startPrice] Price when the round opened.
 * @returns {JSX.Element}
 */
function MarketTicker({
  market,
  markets,
  price,
  canSelect,
  onSelect,
  phase = 'idle',
  changePct = 0,
  startPrice,
}) {
  /**
   * Short price history for the sparkline.
   *
   * Adjusted during render (rather than in an effect) so the chart never
   * paints one tick behind the price text.
   */
  const [series, setSeries] =
    useState({
      marketId: market.id,
      points: [price],
    })

  if (series.marketId !== market.id) {
    setSeries({
      marketId: market.id,
      points: [price],
    })
  } else if (
    series.points[
      series.points.length - 1
    ] !== price
  ) {
    setSeries({
      marketId: series.marketId,
      points: [
        ...series.points,
        price,
      ].slice(-MAX_POINTS),
    })
  }

  const points =
    series.marketId === market.id
      ? series.points
      : [price]

  /* ------------------------------------------------------------------------ */
  /* Change                                                                   */
  /* ------------------------------------------------------------------------ */

  const roundActive =
    phase !== 'idle'

  const windowChange =
    points[0]
      ? (price / points[0] - 1) * 100
      : 0

  const rounded =
    Number(
      (
        roundActive
          ? changePct
          : windowChange
      ).toFixed(2),
    )

  const trend =
    rounded > 0
      ? 'up'
      : rounded < 0
        ? 'down'
        : 'flat'

  const changeText =
    `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}%`

  const priceText =
    price.toLocaleString(
      'en-US',
      {
        minimumFractionDigits:
          market.decimals,
        maximumFractionDigits:
          market.decimals,
      },
    )

  return (
    <div
      className="
        relative
        flex
        items-center
        justify-between
        gap-2
      "
    >
      {/* ------------------------------------------------------------------
       * Market selector
       * --------------------------------------------------------------- */}

      <MarketSelector
        markets={markets}
        selected={market}
        onSelect={onSelect}
        disabled={!canSelect}
      />

      {/* ------------------------------------------------------------------
       * Price, change and sparkline
       * --------------------------------------------------------------- */}

      <div
        role="group"
        aria-label={`${market.name} price ${priceText} dollars, ${changeText}`}
        className="
          flex
          min-w-0
          items-center
          gap-2
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-col
            items-start
            gap-1
            leading-none
          "
        >
          <span
            className="
              whitespace-nowrap
              text-[clamp(14px,4.4vw,18px)]
              font-black
              tabular-nums
              text-white
              [text-shadow:0_0_10px_rgba(0,190,255,0.25)]
            "
          >
            ${priceText}
          </span>

          <span
            className={`
              flex
              items-center
              gap-1
              whitespace-nowrap
              text-[11px]
              font-bold
              tabular-nums
              ${TREND_TEXT[trend]}
            `}
          >
            <span
              aria-hidden="true"
              className="text-[8px]"
            >
              {TREND_GLYPH[trend]}
            </span>

            {changeText}

            {roundActive && (
              <span
                className="
                  ml-0.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-white/40
                "
              >
                Round
              </span>
            )}
          </span>
        </div>

        <Sparkline
          points={points}
          baseline={
            roundActive
              ? startPrice
              : undefined
          }
          tone={trend}
          className="h-7 w-14 shrink-0"
        />
      </div>
    </div>
  )
}

export default MarketTicker