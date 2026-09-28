/**
 * @file src/features/market-flux/MarketNumber.jsx
 *
 * @description
 * Primary market-number display for Market Flux.
 *
 * This component represents the central market value that the player
 * will eventually manipulate through the game's swipe/spin mechanic.
 *
 * Responsibilities:
 * - Display the current market value
 * - Format the value for the South African locale
 * - Display the selected market symbol
 * - Communicate the current market movement visually
 * - Establish the visual foundation for the future number spinner
 *
 * Game interaction is intentionally not implemented here yet.
 */

import { ArrowDown, ArrowUp } from 'lucide-react'

/**
 * Market number display.
 *
 * @param {Object} props
 * @param {number} [props.value=86538.74] - Current market value.
 * @param {number} [props.previousValue=86520.31] - Previous market value.
 * @param {string} [props.symbol='BTC/USDT'] - Active market symbol.
 * @param {string} [props.marketName='Bitcoin'] - Active market name.
 * @returns {JSX.Element}
 */
function MarketNumber({
  value = 86538.74,
  previousValue = 86520.31,
  symbol = 'BTC/USDT',
  marketName = 'Bitcoin',
}) {
  const direction =
    value > previousValue
      ? 'up'
      : value < previousValue
        ? 'down'
        : 'neutral'

  const movement =
    previousValue === 0
      ? 0
      : ((value - previousValue) / previousValue) * 100

  const formattedValue = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

  const formattedMovement = `${Math.abs(movement).toFixed(2)}%`

  const directionConfig = {
    up: {
      label: 'MARKET UP',
      icon: (
        <ArrowUp
          size={13}
          strokeWidth={2.5}
        />
      ),
      color: 'text-emerald-300',
      border: 'border-emerald-300/20',
      background: 'bg-emerald-300/[0.06]',
      glow: 'shadow-[0_0_18px_rgba(52,211,153,0.10)]',
    },

    down: {
      label: 'MARKET DOWN',
      icon: (
        <ArrowDown
          size={13}
          strokeWidth={2.5}
        />
      ),
      color: 'text-red-300',
      border: 'border-red-300/20',
      background: 'bg-red-300/[0.06]',
      glow: 'shadow-[0_0_18px_rgba(248,113,113,0.10)]',
    },

    neutral: {
      label: 'MARKET FLAT',
      icon: null,
      color: 'text-white/40',
      border: 'border-white/[0.08]',
      background: 'bg-white/[0.025]',
      glow: '',
    },
  }

  const currentDirection = directionConfig[direction]

  return (
    <section
      className="
        relative
        z-10
        flex
        w-full
        flex-col
        items-center
        px-4
        pt-10
      "
    >
      {/* ================================================================
          MARKET IDENTIFICATION
          ================================================================ */}

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <span
          className="
            text-[7px]
            font-bold
            uppercase
            tracking-[0.24em]
            text-white/25
          "
        >
          {marketName}
        </span>

        <span
          aria-hidden="true"
          className="
            h-[3px]
            w-[3px]
            rounded-full
            bg-cyan-300/50
          "
        />

        <span
          className="
            font-mono
            text-[7px]
            font-bold
            tracking-[0.14em]
            text-cyan-300/45
          "
        >
          {symbol}
        </span>
      </div>

      {/* ================================================================
          PRIMARY NUMBER
          ================================================================ */}

      <div
        className="
          relative
          mt-5
          flex
          min-h-[112px]
          w-full
          items-center
          justify-center
        "
      >
        {/* Ambient number glow */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-24
            w-64
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-300/[0.035]
            blur-3xl
          "
        />

        {/* Number */}

        <div
          className="
            relative
            flex
            items-baseline
            justify-center
            whitespace-nowrap
          "
        >
          <span
            className="
              relative
              font-mono
              text-[clamp(42px,13vw,64px)]
              font-black
              leading-none
              tracking-[-0.065em]
              text-white
              [text-shadow:0_1px_0_rgba(255,255,255,0.25),0_0_22px_rgba(103,232,249,0.12)]
            "
          >
            {formattedValue}
          </span>
        </div>

        {/* ==============================================================
            TOP GLASS REFLECTION
            ============================================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[13%]
            h-px
            w-32
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent
          "
        />
      </div>

      {/* ================================================================
          MOVEMENT INDICATOR
          ================================================================ */}

      <div
        className={`
          ${currentDirection.background}
          ${currentDirection.border}
          ${currentDirection.glow}
          flex
          items-center
          gap-1.5
          rounded-full
          border
          px-3
          py-1.5
          backdrop-blur-md
        `}
      >
        <span className={currentDirection.color}>
          {currentDirection.icon}
        </span>

        <span
          className={`
            text-[7px]
            font-bold
            uppercase
            tracking-[0.18em]
            ${currentDirection.color}
          `}
        >
          {currentDirection.label}
        </span>

        {direction !== 'neutral' && (
          <>
            <span
              aria-hidden="true"
              className="h-2.5 w-px bg-white/10"
            />

            <span
              className={`
                font-mono
                text-[8px]
                font-bold
                ${currentDirection.color}
              `}
            >
              {formattedMovement}
            </span>
          </>
        )}
      </div>

      {/* ================================================================
          SPIN AREA PLACEHOLDER
          ================================================================ */}

      <div
        className="
          mt-8
          flex
          flex-col
          items-center
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-white/20
          "
        >
          <span
            aria-hidden="true"
            className="
              h-px
              w-7
              bg-gradient-to-r
              from-transparent
              to-white/15
            "
          />

          <span
            className="
              text-[6px]
              font-bold
              uppercase
              tracking-[0.25em]
            "
          >
            Swipe to move
          </span>

          <span
            aria-hidden="true"
            className="
              h-px
              w-7
              bg-gradient-to-l
              from-transparent
              to-white/15
            "
          />
        </div>
      </div>
    </section>
  )
}

export default MarketNumber