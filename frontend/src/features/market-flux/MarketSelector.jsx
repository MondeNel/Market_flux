/**
 * @file src/features/market-flux/MarketSelector.jsx
 *
 * @description
 * Mobile-first market selector for Market Flux.
 *
 * Responsibilities:
 * - Display the currently selected market
 * - Allow the player to switch between supported markets
 * - Provide a compact game-oriented control
 * - Keep market selection state outside of the component
 *
 * The component is presentation-only.
 * The selected market is controlled by the parent component.
 *
 * Market data itself does not belong in the Header.
 */

import { ChevronDown } from 'lucide-react'

/**
 * Supported Market Flux markets.
 *
 * This list can later be moved into a dedicated configuration file
 * once market data becomes dynamic.
 */
export const MARKET_OPTIONS = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    shortName: 'BTC',
    icon: '₿',
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    shortName: 'ETH',
    icon: 'Ξ',
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    shortName: 'SOL',
    icon: 'S',
  },
  {
    symbol: 'XRP/USDT',
    name: 'XRP',
    shortName: 'XRP',
    icon: 'X',
  },
  {
    symbol: 'ADA/USDT',
    name: 'Cardano',
    shortName: 'ADA',
    icon: 'A',
  },
]

/**
 * Market selector.
 *
 * @param {Object} props
 * @param {string} [props.value='BTC/USDT'] - Currently selected market.
 * @param {(symbol: string) => void} [props.onChange] - Called when the
 * selected market changes.
 * @param {boolean} [props.disabled=false] - Prevent market switching.
 * @returns {JSX.Element}
 */
function MarketSelector({
  value = 'BTC/USDT',
  onChange,
  disabled = false,
}) {
  const selectedMarket =
    MARKET_OPTIONS.find((market) => market.symbol === value) ??
    MARKET_OPTIONS[0]

  /**
   * Handle native select changes.
   *
   * A native select is intentionally used here rather than a custom
   * dropdown. It provides reliable mobile touch behaviour and lets
   * the operating system handle the selection UI.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} event
   */
  const handleChange = (event) => {
    const nextSymbol = event.target.value

    onChange?.(nextSymbol)
  }

  return (
    <section
      className="
        relative
        z-20
        w-full
        px-4
        pt-3
      "
    >
      {/* ================================================================
          SELECTOR
          ================================================================ */}

      <div className="relative w-full">
        {/* Physical glass body */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
            rounded-[15px]
            border
            border-white/[0.10]
            bg-[#05090f]/90
            shadow-[inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-6px_12px_rgba(0,0,0,0.62),0_7px_20px_rgba(0,0,0,0.35)]
            backdrop-blur-xl
          "
        >
          {/* Top glass reflection */}

          <span
            className="
              absolute
              inset-x-5
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/25
              to-transparent
            "
          />

          {/* Subtle cyan reflection */}

          <span
            className="
              absolute
              bottom-0
              left-[15%]
              h-px
              w-[24%]
              bg-cyan-300/30
              blur-[1px]
            "
          />
        </div>

        {/* ==============================================================
            ACTUAL CONTROL
            ============================================================== */}

        <div
          className="
            relative
            flex
            h-[52px]
            items-center
            px-3
          "
        >
          {/* Asset icon */}

          <div
            className="
              relative
              flex
              h-[32px]
              w-[32px]
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-[9px]
              border
              border-white/[0.10]
              bg-white/[0.045]
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),inset_0_-4px_7px_rgba(0,0,0,0.5)]
            "
          >
            <span
              aria-hidden="true"
              className="
                absolute
                inset-x-1
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/35
                to-transparent
              "
            />

            <span
              className="
                relative
                text-[15px]
                font-black
                leading-none
                text-cyan-200
                drop-shadow-[0_0_5px_rgba(103,232,249,0.45)]
              "
            >
              {selectedMarket.icon}
            </span>
          </div>

          {/* Market information */}

          <div className="ml-3 min-w-0 flex-1">
            <div
              className="
                text-[6px]
                font-bold
                uppercase
                leading-none
                tracking-[0.22em]
                text-white/30
              "
            >
              SELECT MARKET
            </div>

            <div className="mt-[4px] flex items-center gap-2">
              <span
                className="
                  truncate
                  text-[13px]
                  font-extrabold
                  leading-none
                  tracking-wide
                  text-white
                "
              >
                {selectedMarket.name}
              </span>

              <span
                className="
                  shrink-0
                  rounded-[4px]
                  border
                  border-cyan-300/15
                  bg-cyan-300/[0.05]
                  px-1.5
                  py-[3px]
                  font-mono
                  text-[7px]
                  font-bold
                  leading-none
                  text-cyan-200/65
                "
              >
                {selectedMarket.symbol}
              </span>
            </div>
          </div>

          {/* Dropdown indicator */}

          <div
            aria-hidden="true"
            className="
              ml-2
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-[8px]
              border
              border-white/[0.08]
              bg-white/[0.035]
              text-white/45
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.06)]
            "
          >
            <ChevronDown
              size={14}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* ================================================================
            NATIVE SELECT
            ================================================================ */}

        <select
          value={selectedMarket.symbol}
          onChange={handleChange}
          disabled={disabled}
          aria-label="Select market"
          className="
            absolute
            inset-0
            h-full
            w-full
            cursor-pointer
            appearance-none
            opacity-0
            disabled:cursor-not-allowed
          "
        >
          {MARKET_OPTIONS.map((market) => (
            <option
              key={market.symbol}
              value={market.symbol}
            >
              {market.name} ({market.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* ================================================================
          MARKET STATUS
          ================================================================ */}

      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
              shadow-[0_0_7px_rgba(52,211,153,0.8)]
            "
          />

          <span
            className="
              text-[6px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-white/25
            "
          >
            Market Active
          </span>
        </div>

        <span
          className="
            font-mono
            text-[6px]
            font-semibold
            tracking-[0.12em]
            text-white/20
          "
        >
          {selectedMarket.shortName}
        </span>
      </div>
    </section>
  )
}

export default MarketSelector