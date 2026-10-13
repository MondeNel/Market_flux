
/**
 * @file src/features/market-flux/components/MarketSelector.jsx
 *
 * @description
 * Angular mechanical market selector for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Compact cyan-lit metallic housing
 * - Angular reference-inspired silhouette
 * - Physical coin badge with glass reflections
 * - Dark recessed instrument surface
 * - Responsive mobile-first dimensions
 * - Floating dropdown with matching styling
 *
 * ACCESSIBILITY
 * ---------------------------------------------------------------------------
 * - Escape closes the menu
 * - Arrow keys navigate options
 * - Outside click closes the menu
 * - Selected option receives focus when opened
 * - Focus returns to trigger after keyboard selection
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { ChevronDown } from 'lucide-react'

const FRAME_SHAPE =
  'polygon(6% 0,94% 0,100% 24%,100% 76%,94% 100%,6% 100%,0 76%,0 24%)'

/* -------------------------------------------------------------------------- */
/* Coin badge                                                                 */
/* -------------------------------------------------------------------------- */

export function CoinBadge({ market }) {
  return (
    <span
      aria-hidden="true"
      className="
        relative grid
        h-[25px] w-[25px]
        shrink-0 place-items-center
        overflow-hidden rounded-full
        border border-white/30
        shadow-[0_2px_5px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.6)]
      "
      style={{
        backgroundColor: market.color,
        color: market.glyphColor,
      }}
    >
      <span
        className="
          pointer-events-none absolute
          inset-x-[3px] top-[1px]
          h-[38%] rounded-full
          bg-white/35 blur-[0.5px]
        "
      />

      <span
        className="
          relative z-10
          text-[12px] font-black leading-none
          drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]
        "
      >
        {market.glyph}
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Market selector                                                            */
/* -------------------------------------------------------------------------- */

function MarketSelector({
  markets,
  selected,
  onSelect,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)

  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const focusFrameRef = useRef(null)

  const menuId = useId()
  const isOpen = open && !disabled

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return

      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    focusFrameRef.current = requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector('[aria-selected="true"]')
        ?.focus()
    })

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)

      if (focusFrameRef.current !== null) {
        cancelAnimationFrame(focusFrameRef.current)
      }
    }
  }, [isOpen])

  const handleMenuKeyDown = (event) => {
    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp'
    ) {
      return
    }

    event.preventDefault()

    const options = Array.from(
      menuRef.current?.querySelectorAll('[role="option"]') ?? [],
    )

    if (!options.length) return

    const current = options.indexOf(document.activeElement)
    const step = event.key === 'ArrowDown' ? 1 : -1

    const next =
      (current + step + options.length) % options.length

    options[next]?.focus()
  }

  const choose = (marketId, event) => {
    onSelect(marketId)
    setOpen(false)

    if (event.detail === 0) {
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-[340px]"
    >
      {/* Metallic angular trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`Market: ${selected.name} ${selected.pair}`}
        onClick={() => setOpen((value) => !value)}
        className="
          group relative isolate
          flex h-[42px] w-full
          items-center justify-between
          overflow-hidden
          border border-cyan-300/55
          bg-[linear-gradient(180deg,#12506b_0%,#020f1c_17%,#00060e_72%,#0a405c_100%)]
          px-3 text-left
          shadow-[0_5px_14px_rgba(0,0,0,0.7),0_0_12px_rgba(0,190,255,0.18),inset_0_1px_2px_rgba(210,250,255,0.4)]
          backdrop-blur-xl
          outline-none
          transition-[filter,transform]
          duration-150
          hover:brightness-125
          active:translate-y-px
          disabled:cursor-not-allowed
          disabled:opacity-45
          focus-visible:ring-2
          focus-visible:ring-cyan-200
          motion-reduce:transition-none
        "
        style={{ clipPath: FRAME_SHAPE }}
      >
        {/* Upper chrome reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-x-[12%] top-0 h-[2px]
            bg-gradient-to-r
            from-transparent via-cyan-100 to-transparent
            shadow-[0_0_8px_rgba(0,220,255,0.8)]
          "
        />

        {/* Recessed interior */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-[3px]
            bg-[linear-gradient(180deg,rgba(0,10,21,0.85),rgba(0,4,9,0.95))]
          "
          style={{ clipPath: FRAME_SHAPE }}
        />

        <span className="relative z-10 flex min-w-0 items-center gap-2.5">
          <CoinBadge market={selected} />

          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className="
                truncate text-[12px]
                font-black uppercase
                tracking-[0.05em] text-white
              "
            >
              {selected.name}
            </span>

            <span
              className="
                truncate text-[9px]
                font-bold tracking-[0.1em]
                text-cyan-300/70
              "
            >
              {selected.pair}
            </span>
          </span>
        </span>

        <span
          aria-hidden="true"
          className="
            relative z-10 grid
            h-[23px] w-[23px]
            shrink-0 place-items-center
            rounded-md border border-cyan-300/35
            bg-cyan-950/60
            text-cyan-200
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]
          "
        >
          <ChevronDown
            className={`
              h-4 w-4 transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
            strokeWidth={2.5}
          />
        </span>

        {/* Lower illuminated seam */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-0 left-[15%] right-[15%]
            h-px
            bg-gradient-to-r
            from-transparent via-cyan-300/70 to-transparent
          "
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label="Choose a market"
          onKeyDown={handleMenuKeyDown}
          className="
            absolute left-1/2 top-full z-[100]
            mt-2 w-full min-w-[220px]
            -translate-x-1/2
            overflow-hidden rounded-xl
            border border-cyan-400/50
            bg-[linear-gradient(180deg,#092538,#01060d_45%,#03111d)]
            p-1.5
            shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(0,191,255,0.25),inset_0_1px_2px_rgba(255,255,255,0.2)]
            backdrop-blur-2xl
          "
        >
          <div
            className="
              px-2 pb-1.5 pt-1
              text-[9px] font-black uppercase
              tracking-[0.17em]
              text-cyan-300/65
            "
          >
            Select Market
          </div>

          <div className="max-h-[240px] space-y-1 overflow-y-auto">
            {markets.map((market) => {
              const isSelected = market.id === selected.id

              return (
                <button
                  key={market.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(event) => choose(market.id, event)}
                  className={`
                    flex w-full items-center justify-between
                    gap-2 rounded-lg border
                    px-2 py-2 text-left
                    outline-none
                    transition-colors
                    focus-visible:border-cyan-300
                    focus-visible:bg-cyan-900/40
                    ${
                      isSelected
                        ? 'border-cyan-400/50 bg-cyan-950/65'
                        : 'border-transparent hover:border-cyan-500/20 hover:bg-cyan-950/30'
                    }
                  `}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <CoinBadge market={market} />

                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-[11px] font-black text-white">
                        {market.name}
                      </span>

                      <span className="truncate text-[9px] font-bold tracking-wider text-cyan-300/60">
                        {market.pair}
                      </span>
                    </span>
                  </span>

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="
                        h-2 w-2 shrink-0 rounded-full
                        bg-cyan-300
                        shadow-[0_0_8px_rgba(0,220,255,0.9)]
                      "
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketSelector
