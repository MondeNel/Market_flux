/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market row: symbol picker on the left, spinning odometer price in the
 * middle (amber end caps, cylinder shading), LIVE badge on the right.
 *
 * The frame is clear liquid glass so the background artwork shows through.
 * Presentational only; all state comes from the simulation hook.
 */

import { Activity } from 'lucide-react'

import MarketNumberSpinner from './MarketNumberSpinner'
import MarketSelector from './MarketSelector'

/**
 * @param {object} props
 * @param {object} props.market Selected market.
 * @param {object[]} props.markets All markets.
 * @param {number} props.price Current price.
 * @param {'up'|'down'} props.direction Direction of the last tick.
 * @param {boolean} props.isRoundLive Whether a round is running.
 * @param {boolean} props.canSelect Whether the market can be changed now.
 * @param {(marketId: string) => void} props.onSelect
 * @returns {JSX.Element}
 */
function MarketTicker({
  market,
  markets,
  price,
  direction,
  isRoundLive,
  canSelect,
  onSelect,
}) {
  const tone = isRoundLive ? direction : 'idle'

  return (
    // z-30 keeps the open picker above the play area beneath it.
    <section aria-label="Market" className="relative z-30 px-3">
      <div
        className="
          relative
          flex
          items-center
          gap-2
          rounded-[18px]
          border
          border-cyan-300/45
          bg-white/[0.025]
          p-2
          shadow-[0_0_14px_rgba(0,190,255,0.28),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_18px_rgba(0,190,255,0.08)]
          backdrop-blur-[4px]
        "
      >
        {/* Top glass highlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />

        <div className="flex shrink-0 flex-col gap-1">
          <span className="pl-1 text-[7px] font-bold uppercase tracking-[0.22em] text-cyan-200/75">
            Market
          </span>
          <MarketSelector
            markets={markets}
            selected={market}
            onSelect={onSelect}
            disabled={!canSelect}
          />
        </div>

        {/* Odometer: one continuous cylinder with amber end caps */}
        <div
          className="
            relative
            flex
            h-[54px]
            min-w-0
            flex-1
            items-center
            justify-center
            overflow-hidden
            rounded-[14px]
            border
            border-cyan-300/60
            bg-[linear-gradient(180deg,rgba(0,8,20,0.85)_0%,rgba(6,40,78,0.6)_30%,rgba(20,90,150,0.5)_50%,rgba(6,40,78,0.6)_70%,rgba(0,8,20,0.85)_100%)]
            px-3.5
            shadow-[inset_0_0_18px_rgba(0,200,255,0.3),0_0_14px_rgba(0,210,255,0.4)]
          "
        >
          {/* Rim light along the top and bottom of the cylinder */}
          <span
            aria-hidden="true"
            className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
          />

          {/* Amber end caps */}
          <span
            aria-hidden="true"
            className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-transparent via-amber-300 to-transparent shadow-[0_0_6px_rgba(251,191,36,0.9)]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-2 right-0 w-[3px] rounded-full bg-gradient-to-b from-transparent via-amber-300 to-transparent shadow-[0_0_6px_rgba(251,191,36,0.9)]"
          />

          <MarketNumberSpinner
            value={price}
            decimals={market.decimals}
            tone={tone}
          />
        </div>

        <LiveBadge />
      </div>
    </section>
  )
}

function LiveBadge() {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/40 px-1.5 py-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.14em] text-emerald-300">
        Live
      </span>
      <Activity
        aria-hidden="true"
        className="h-3 w-3 text-cyan-300"
        strokeWidth={2.5}
      />
    </div>
  )
}

export default MarketTicker