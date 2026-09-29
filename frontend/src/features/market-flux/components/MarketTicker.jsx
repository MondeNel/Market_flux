/**
 * @file src/features/market-flux/components/MarketTicker.jsx
 *
 * @description
 * Market row: asset selector, odometer-style live price and LIVE badge.
 * Presentational only; the price comes from the simulation hook.
 */

import { ChevronDown } from 'lucide-react'

/**
 * @param {object} props
 * @param {number} props.price Current market price.
 * @param {'up'|'down'} props.direction Direction of the last tick.
 * @param {boolean} props.isRoundLive Whether a round is running (tints digits).
 * @returns {JSX.Element}
 */
function MarketTicker({ price, direction, isRoundLive }) {
  return (
    <section aria-label="Market" className="px-3 pt-3">
      <div
        className="
          market-flux-glass
          relative
          flex
          items-center
          gap-2
          overflow-hidden
          rounded-[16px]
          border
          border-cyan-400/30
          p-2
        "
      >
        <AssetSelect />
        <Odometer
          price={price}
          direction={direction}
          isRoundLive={isRoundLive}
        />
        <LiveBadge />
      </div>
    </section>
  )
}

function AssetSelect() {
  return (
    <button
      type="button"
      className="
        flex
        shrink-0
        items-center
        gap-1.5
        rounded-[10px]
        border
        border-cyan-300/25
        bg-slate-950/70
        py-1.5
        pl-1.5
        pr-1
        text-left
      "
    >
      <span
        aria-hidden="true"
        className="
          grid
          h-6
          w-6
          shrink-0
          place-items-center
          rounded-full
          bg-orange-500
          text-[13px]
          font-black
          text-white
        "
      >
        ₿
      </span>

      <span className="leading-tight">
        <span className="block text-[10px] font-bold text-white">Bitcoin</span>
        <span className="block text-[7px] font-semibold text-slate-400">
          (BTC/USDT)
        </span>
      </span>

      <ChevronDown
        aria-hidden="true"
        className="h-3 w-3 text-cyan-300"
        strokeWidth={2.5}
      />
    </button>
  )
}

function Odometer({ price, direction, isRoundLive }) {
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  let tone = 'text-cyan-50'
  if (isRoundLive) {
    tone = direction === 'up' ? 'text-emerald-300' : 'text-rose-300'
  }

  return (
    <div
      role="img"
      aria-label={`Bitcoin price ${formatted}`}
      className="
        flex
        min-w-0
        flex-1
        items-center
        justify-center
        gap-[2px]
        rounded-[10px]
        border
        border-cyan-300/30
        bg-slate-950/80
        px-1.5
        py-1
        shadow-[inset_0_0_14px_rgba(0,174,255,0.18)]
      "
    >
      {formatted.split('').map((char, index) => {
        const isDigit = /\d/.test(char)

        if (!isDigit) {
          return (
            <span
              key={index}
              aria-hidden="true"
              className="w-[5px] pt-3 text-center text-[14px] font-black text-cyan-300"
            >
              {char}
            </span>
          )
        }

        return (
          <span
            key={index}
            aria-hidden="true"
            className={`
              relative
              grid
              h-8
              w-[18px]
              place-items-center
              rounded-[4px]
              border
              border-cyan-400/25
              bg-gradient-to-b
              from-slate-800
              to-slate-950
              text-[21px]
              font-black
              tabular-nums
              transition-colors
              duration-200
              ${tone}
            `}
          >
            {char}
            {/* Split-flap seam */}
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
          </span>
        )
      })}
    </div>
  )
}

function LiveBadge() {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1 px-1">
      <span className="flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-300">
          Live
        </span>
      </span>
    </div>
  )
}

export default MarketTicker
