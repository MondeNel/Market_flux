/**
 * @file src/features/market-flux/components/MarketSelector.jsx
 *
 * @description
 * Mobile-first asset selector for Market Flux.
 *
 * Responsibilities:
 * - Display the currently selected market.
 * - Allow the player to switch between supported assets.
 * - Provide a compact HUD-style control.
 *
 * The selector does not fetch or simulate market data.
 */

import { ChevronDown, CircleDollarSign } from 'lucide-react'

/**
 * Supported Market Flux assets.
 */
const MARKETS = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    pair: 'BTC/USDT',
    price: '86,538.74',
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    pair: 'ETH/USDT',
    price: '2,513.40',
  },
  {
    id: 'SOL',
    name: 'Solana',
    pair: 'SOL/USDT',
    price: '103.80',
  },
  {
    id: 'XRP',
    name: 'XRP',
    pair: 'XRP/USDT',
    price: '1.445',
  },
  {
    id: 'ADA',
    name: 'Cardano',
    pair: 'ADA/USDT',
    price: '0.2215',
  },
]

/**
 * Market selector component.
 *
 * @param {object} props
 * @param {string} [props.value='BTC'] Selected market ID.
 * @param {(market: object) => void} [props.onChange] Selection callback.
 * @returns {JSX.Element}
 */
function MarketSelector({
  value = 'BTC',
  onChange,
}) {
  const selectedMarket =
    MARKETS.find((market) => market.id === value) ?? MARKETS[0]

  const handleChange = (event) => {
    const market = MARKETS.find(
      (item) => item.id === event.target.value,
    )

    if (market && onChange) {
      onChange(market)
    }
  }

  return (
    <section className="relative px-3 pt-3">
      {/* Atmospheric glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/4
          top-1
          h-16
          w-1/2
          rounded-full
          bg-cyan-400/5
          blur-2xl
        "
      />

      <div
        className="
          relative
          overflow-hidden
          rounded-[14px]
          border
          border-white/10
          bg-[#050b13]/90
          shadow-[0_8px_30px_rgba(0,0,0,0.3)]
        "
      >
        {/* Top highlight */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-4
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-300/30
            to-transparent
          "
        />

        <div className="flex min-h-[58px] items-center gap-3 px-3">
          {/* Market icon */}
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-[10px]
              border
              border-cyan-400/20
              bg-cyan-400/[0.07]
              shadow-[inset_0_0_14px_rgba(0,180,255,0.06)]
            "
          >
            <CircleDollarSign
              aria-hidden="true"
              className="h-5 w-5 text-cyan-300"
              strokeWidth={1.7}
            />
          </div>

          {/* Market information */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.1em]
                  text-white
                "
              >
                {selectedMarket.name}
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.06]
                  px-1.5
                  py-0.5
                  text-[7px]
                  font-bold
                  tracking-[0.08em]
                  text-cyan-300
                "
              >
                {selectedMarket.id}
              </span>
            </div>

            <span
              className="
                mt-0.5
                block
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-slate-500
              "
            >
              {selectedMarket.pair}
            </span>
          </div>

          {/* Current reference price */}
          <div className="hidden min-[390px]:block shrink-0 text-right">
            <span
              className="
                block
                text-[7px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              Market
            </span>

            <span
              className="
                mt-0.5
                block
                font-mono
                text-[10px]
                font-bold
                tracking-tight
                text-slate-300
              "
            >
              {selectedMarket.price}
            </span>
          </div>

          {/* Native select */}
          <div className="relative shrink-0">
            <select
              aria-label="Select market"
              value={selectedMarket.id}
              onChange={handleChange}
              className="
                h-9
                w-9
                cursor-pointer
                appearance-none
                rounded-[9px]
                border
                border-cyan-400/25
                bg-slate-950
                px-0
                text-transparent
                outline-none
                transition
                hover:border-cyan-300/45
                focus:border-cyan-300/60
                focus:ring-1
                focus:ring-cyan-400/20
              "
            >
              {MARKETS.map((market) => (
                <option
                  key={market.id}
                  value={market.id}
                  className="bg-slate-950 text-white"
                >
                  {market.name} ({market.pair})
                </option>
              ))}
            </select>

            <ChevronDown
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-4
                w-4
                -translate-x-1/2
                -translate-y-1/2
                text-cyan-300
              "
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Bottom status line */}
        <div
          aria-hidden="true"
          className="
            h-px
            w-full
            bg-gradient-to-r
            from-transparent
            via-cyan-400/20
            to-transparent
          "
        />
      </div>
    </section>
  )
}

export { MARKETS }

export default MarketSelector