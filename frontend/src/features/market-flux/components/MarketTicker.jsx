/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market Flux market instrument.
 *
 * The ticker sits directly beneath the player header and acts as the
 * instrument readout for the active market.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Floating HUD composition rather than a conventional card.
 * - Market selector on the left.
 * - Large mechanical market-number spinner in the centre.
 * - Compact LIVE indicator on the right.
 * - Broken neon-blue structural rails.
 * - Amber instrumentation appears only during a tease / near-miss reveal.
 * - No heavy solid backdrop.
 *
 * The MarketNumberSpinner owns the market-value transition and determines
 * which digits changed and whether the final market value moved up or down.
 *
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
 * @param {boolean} [props.tease=false] Near-miss reveal state.
 * @param {(marketId: string) => void} props.onSelect Market selection handler.
 * @returns {JSX.Element}
 */
function MarketTicker({
  market,
  markets,
  price,
  direction,
  isRoundLive,
  canSelect,
  tease = false,
  onSelect,
}) {
  /*
   * Direction is retained here for compatibility with the simulation API.
   * MarketNumberSpinner derives its result direction from the actual previous
   * and current values, so we intentionally do not pass a tone into it.
   */
  void direction
  void isRoundLive

  return (
    <section
      aria-label="Market"
      className="
        relative
        z-30
        px-3
        pt-1
      "
    >
      <div
        className="
          relative
          flex
          items-end
          gap-2
        "
      >
        {/* -----------------------------------------------------------------
         * Market selector
         * ---------------------------------------------------------------- */}
        <div
          className="
            relative
            flex
            shrink-0
            flex-col
            gap-1
          "
        >
          <span
            className="
              pl-1
              text-[7px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-cyan-200/70
            "
          >
            Market
          </span>

          <MarketSelector
            markets={markets}
            selected={market}
            onSelect={onSelect}
            disabled={!canSelect}
          />

          {/* Small mechanical light beneath selector */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              bottom-[-5px]
              left-2
              h-px
              w-8
              bg-gradient-to-r
              from-cyan-300/70
              to-transparent
              shadow-[0_0_5px_rgba(80,210,255,0.65)]
            "
          />
        </div>

        {/* -----------------------------------------------------------------
         * Market number instrument
         * ---------------------------------------------------------------- */}
        <div
          className="
            relative
            min-w-0
            flex-1
          "
        >
          {/* Atmospheric glow behind instrument */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-x-[8%]
              top-1/2
              h-8
              -translate-y-1/2
              rounded-full
              bg-[radial-gradient(ellipse_at_center,rgba(20,130,220,0.16),transparent_72%)]
              blur-md
            "
          />

          {/* Instrument housing */}
          <div
            className={`
              relative
              flex
              h-[58px]
              min-w-0
              items-center
              justify-center
              overflow-visible
              px-2
              transition-[filter]
              duration-300
              ${
                tease
                  ? '[filter:drop-shadow(0_0_10px_rgba(251,191,36,0.38))]'
                  : '[filter:drop-shadow(0_0_7px_rgba(30,160,255,0.25))]'
              }
            `}
          >
            {/* -------------------------------------------------------------
             * Broken top rail
             * ---------------------------------------------------------- */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                left-[8%]
                right-[8%]
                top-[3px]
                h-px
                ${
                  tease
                    ? 'bg-gradient-to-r from-transparent via-amber-300/80 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent'
                }
              `}
            />

            {/* -------------------------------------------------------------
             * Broken bottom rail
             * ---------------------------------------------------------- */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                left-[12%]
                right-[12%]
                bottom-[3px]
                h-px
                ${
                  tease
                    ? 'bg-gradient-to-r from-transparent via-amber-300/70 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent'
                }
              `}
            />

            {/* -------------------------------------------------------------
             * Left mechanical bracket
             * ---------------------------------------------------------- */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                bottom-[10px]
                left-0
                top-[10px]
                w-[3px]
                rounded-full
                ${
                  tease
                    ? `
                      bg-gradient-to-b
                      from-transparent
                      via-amber-300
                      to-transparent
                      shadow-[0_0_7px_rgba(251,191,36,0.85)]
                    `
                    : `
                      bg-gradient-to-b
                      from-transparent
                      via-cyan-300
                      to-transparent
                      shadow-[0_0_7px_rgba(60,190,255,0.72)]
                    `
                }
              `}
            />

            {/* Small upper-left broken accent */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                left-0
                top-[8px]
                h-px
                w-5
                ${
                  tease
                    ? 'bg-amber-300/80'
                    : 'bg-cyan-300/80'
                }
              `}
            />

            {/* Small lower-left broken accent */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                bottom-[8px]
                left-0
                h-px
                w-3
                ${
                  tease
                    ? 'bg-amber-300/70'
                    : 'bg-cyan-300/70'
                }
              `}
            />

            {/* -------------------------------------------------------------
             * Right mechanical bracket
             * ---------------------------------------------------------- */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                bottom-[10px]
                right-0
                top-[10px]
                w-[3px]
                rounded-full
                ${
                  tease
                    ? `
                      bg-gradient-to-b
                      from-transparent
                      via-amber-300
                      to-transparent
                      shadow-[0_0_7px_rgba(251,191,36,0.85)]
                    `
                    : `
                      bg-gradient-to-b
                      from-transparent
                      via-cyan-300
                      to-transparent
                      shadow-[0_0_7px_rgba(60,190,255,0.72)]
                    `
                }
              `}
            />

            {/* Small upper-right broken accent */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                right-0
                top-[8px]
                h-px
                w-5
                ${
                  tease
                    ? 'bg-amber-300/80'
                    : 'bg-cyan-300/80'
                }
              `}
            />

            {/* Small lower-right broken accent */}
            <span
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                bottom-[8px]
                right-0
                h-px
                w-3
                ${
                  tease
                    ? 'bg-amber-300/70'
                    : 'bg-cyan-300/70'
                }
              `}
            />

            {/* -------------------------------------------------------------
             * Inner glass reflection
             * ---------------------------------------------------------- */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-[5%]
                top-[8px]
                h-4
                bg-gradient-to-b
                from-white/[0.07]
                to-transparent
                blur-[1px]
              "
            />

            {/* -------------------------------------------------------------
             * Odometer
             * ---------------------------------------------------------- */}
            <MarketNumberSpinner
              value={price}
              decimals={market.decimals}
              tease={tease}
            />
          </div>
        </div>

        {/* -----------------------------------------------------------------
         * LIVE indicator
         * ---------------------------------------------------------------- */}
        <LiveBadge />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Live badge
 * ------------------------------------------------------------------------ */

/**
 * Compact live-market indicator.
 *
 * @returns {JSX.Element}
 */
function LiveBadge() {
  return (
    <div
      className="
        relative
        mb-[5px]
        flex
        shrink-0
        items-center
        gap-1
        rounded-full
        px-1.5
        py-1
      "
    >
      {/* Faint HUD halo */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(0,220,150,0.1),transparent_72%)]
        "
      />

      {/* Status light */}
      <span className="relative flex h-2 w-2">
        <span
          aria-hidden="true"
          className="
            absolute
            inline-flex
            h-full
            w-full
            animate-ping
            rounded-full
            bg-emerald-400/60
            motion-reduce:animate-none
          "
        />

        <span
          className="
            relative
            inline-flex
            h-2
            w-2
            rounded-full
            bg-emerald-400
            shadow-[0_0_6px_rgba(52,211,153,0.9)]
          "
        />
      </span>

      <span
        className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.14em]
          text-emerald-300
        "
      >
        Live
      </span>

      <Activity
        aria-hidden="true"
        className="
          h-3
          w-3
          text-cyan-300
          drop-shadow-[0_0_4px_rgba(80,210,255,0.7)]
        "
        strokeWidth={2.5}
      />
    </div>
  )
}

export default MarketTicker