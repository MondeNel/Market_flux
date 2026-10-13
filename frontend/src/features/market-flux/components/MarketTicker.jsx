
/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market Flux mechanical market-selection instrument.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Long, angular metallic market rail
 * - Integrated market selector
 * - Cyan-lit chrome edges
 * - Compact online-status indicator
 * - Responsive mobile-first sizing
 *
 * BEHAVIOUR
 * ---------------------------------------------------------------------------
 * - Preserves existing MarketTicker props
 * - Delegates market selection to MarketSelector
 * - Does not change simulation state
 */

import MarketSelector from './MarketSelector'

const FRAME_SHAPE =
  'polygon(3% 0,97% 0,100% 25%,100% 75%,97% 100%,3% 100%,0 75%,0 25%)'

/**
 * @param {object} props
 * @param {object} props.market Selected market.
 * @param {object[]} props.markets All markets.
 * @param {boolean} props.canSelect Whether selection is enabled.
 * @param {(marketId:string) => void} props.onSelect
 * @returns {JSX.Element}
 */
function MarketTicker({
  market,
  markets,
  canSelect,
  onSelect,
}) {
  return (
    <div className="relative mx-auto w-full max-w-[800px]">
      {/* Main mechanical rail */}
      <div
        className="
          relative isolate flex
          h-[48px] w-full
          items-center justify-between
          gap-2 overflow-hidden
          border border-cyan-300/50
          bg-[linear-gradient(180deg,#154c68_0%,#041524_18%,#010710_72%,#103b54_100%)]
          px-[clamp(9px,2.8vw,22px)]
          shadow-[0_6px_16px_rgba(0,0,0,0.8),0_0_13px_rgba(0,191,255,0.2),inset_0_1px_2px_rgba(210,250,255,0.4)]
          backdrop-blur-xl
          sm:h-[54px]
        "
        style={{ clipPath: FRAME_SHAPE }}
      >
        {/* Top metallic highlight */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-x-[9%] top-0 h-[2px]
            bg-gradient-to-r
            from-transparent via-cyan-100 to-transparent
            shadow-[0_0_9px_rgba(0,220,255,0.9)]
          "
        />

        {/* Recessed interior */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-[3px]
            bg-[linear-gradient(180deg,rgba(0,5,13,0.9),rgba(0,12,23,0.95))]
          "
          style={{ clipPath: FRAME_SHAPE }}
        />

        {/* Left: market selector */}
        <div
          className="
            relative z-10
            min-w-0 flex-1
            max-w-[340px]
          "
        >
          <MarketSelector
            markets={markets}
            selected={market}
            onSelect={onSelect}
            disabled={!canSelect}
          />
        </div>

        {/* Right: connection status */}
        <div
          className="
            relative z-10 flex
            shrink-0 items-center
            gap-1.5
            pr-1
          "
        >
          <span
            aria-hidden="true"
            className="
              h-[7px] w-[7px]
              shrink-0 rounded-full
              bg-emerald-400
              shadow-[0_0_8px_rgba(0,255,150,0.9)]
            "
          />

          <span
            className="
              whitespace-nowrap
              text-[9px] font-black
              uppercase tracking-[0.08em]
              text-emerald-200
              sm:text-[11px]
            "
          >
            Market Online
          </span>
        </div>

        {/* Bottom illuminated seam */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-0 left-[12%] right-[12%]
            h-px
            bg-gradient-to-r
            from-transparent via-cyan-300/70 to-transparent
          "
        />
      </div>
    </div>
  )
}

export default MarketTicker
