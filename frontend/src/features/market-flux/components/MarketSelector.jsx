/**
 * @file src/features/market-flux/components/MarketSelector.jsx
 *
 * @description
 * Market selector for the Market Flux HUD.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Floating mechanical selector rather than a conventional pill.
 * - Liquid-glass surface with dark physical depth.
 * - Neon-blue structural accents.
 * - Market coin remains the primary visual identifier.
 * - Dropdown behaves like a compact instrument tray.
 * - Keyboard navigation and accessibility are preserved.
 * - Disabled while a round is running.
 */

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * Round coin badge, tinted per market.
 *
 * @param {object} props
 * @param {object} props.market
 * @returns {JSX.Element}
 */
export function CoinBadge({ market }) {
  return (
    <span
      aria-hidden="true"
      style={{
        backgroundColor: market.color,
        color: market.glyphColor,
      }}
      className="
        relative
        grid
        h-6
        w-6
        shrink-0
        place-items-center
        overflow-hidden
        rounded-full
        text-[13px]
        font-black
        shadow-[0_2px_5px_rgba(0,0,0,0.45),0_0_9px_rgba(255,255,255,0.12)]
      "
    >
      {/* Glass reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-1
          top-0.5
          h-[35%]
          rounded-full
          bg-white/25
          blur-[1px]
        "
      />

      <span className="relative">{market.glyph}</span>
    </span>
  )
}

/**
 * @param {object} props
 * @param {object[]} props.markets Available markets.
 * @param {object} props.selected Currently selected market.
 * @param {(marketId: string) => void} props.onSelect
 * @param {boolean} props.disabled Locks the picker while a round is running.
 * @returns {JSX.Element}
 */
function MarketSelector({
  markets,
  selected,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false)

  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const menuId = useId()

  const isOpen = open && !disabled

  /*
   * A locked selector should never remain visually open.
   */
  useEffect(() => {
    if (disabled) {
      setOpen(false)
    }
  }, [disabled])

  /*
   * Outside click + Escape handling.
   */
  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    /*
     * Land on the current market when the menu opens.
     */
    requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector('[aria-selected="true"]')
        ?.focus()
    })

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  /*
   * Arrow-key navigation.
   */
  const handleMenuKeyDown = (event) => {
    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp'
    ) {
      return
    }

    event.preventDefault()

    const options = [
      ...menuRef.current.querySelectorAll('[role="option"]'),
    ]

    if (!options.length) return

    const current = options.indexOf(document.activeElement)
    const step = event.key === 'ArrowDown' ? 1 : -1

    options[
      (current + step + options.length) % options.length
    ]?.focus()
  }

  /*
   * Select a market.
   */
  const choose = (marketId, event) => {
    onSelect(marketId)
    setOpen(false)

    /*
     * Keyboard selection returns focus to the trigger.
     * Pointer selection does not leave an unnecessary focus ring.
     */
    if (event.detail === 0) {
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      {/* ================================================================ */}
      {/* Trigger                                                          */}
      {/* ================================================================ */}

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
          group
          relative
          flex
          min-w-[126px]
          items-center
          gap-1.5
          overflow-hidden
          rounded-[13px]
          border
          border-cyan-400/30
          bg-black/45
          py-1
          pl-1
          pr-2
          text-left
          shadow-[0_6px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-5px_10px_rgba(0,0,0,0.35)]
          outline-offset-2
          transition-[border-color,box-shadow,transform,opacity]
          hover:border-cyan-300/55
          hover:shadow-[0_7px_16px_rgba(0,0,0,0.45),0_0_12px_rgba(0,190,255,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-cyan-300
          active:scale-[0.985]
          disabled:cursor-not-allowed
          disabled:opacity-45
        "
      >
        {/* Top glass reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-7
            top-0
            h-px
            bg-white/15
          "
        />

        {/* Left mechanical accent */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-3
            h-px
            w-5
            bg-cyan-400/60
          "
        />

        <CoinBadge market={selected} />

        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[10px] font-bold text-white">
            {selected.name}
          </span>

          <span className="block text-[7px] font-semibold tracking-[0.04em] text-slate-400">
            {selected.pair}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="
            grid
            h-5
            w-5
            shrink-0
            place-items-center
            rounded-[7px]
            border
            border-cyan-400/15
            bg-white/[0.025]
          "
        >
          <ChevronDown
            className={`
              h-3
              w-3
              text-cyan-300
              transition-transform
              motion-reduce:transition-none
              ${isOpen ? 'rotate-180' : ''}
            `}
            strokeWidth={2.5}
          />
        </span>
      </button>

      {/* ================================================================ */}
      {/* Market tray                                                       */}
      {/* ================================================================ */}

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label="Choose a market"
          onKeyDown={handleMenuKeyDown}
          className="
            absolute
            left-0
            top-full
            z-50
            mt-2
            w-[218px]
            overflow-hidden
            rounded-[15px]
            border
            border-cyan-400/30
            bg-black/75
            p-1
            shadow-[0_16px_35px_rgba(0,0,0,0.65),0_0_20px_rgba(0,190,255,0.16),inset_0_1px_0_rgba(255,255,255,0.08)]
            backdrop-blur-xl
          "
        >
          {/* Tray header */}
          <div
            aria-hidden="true"
            className="
              flex
              items-center
              gap-2
              px-2
              pb-1.5
              pt-1
            "
          >
            <span className="h-px w-5 bg-cyan-400/55" />

            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-[0.24em]
                text-slate-500
              "
            >
              Select Market
            </span>

            <span className="h-px flex-1 bg-cyan-400/15" />
          </div>

          {/* Options */}
          <div className="space-y-0.5">
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
                    group
                    relative
                    flex
                    w-full
                    items-center
                    gap-2
                    overflow-hidden
                    rounded-[11px]
                    px-2
                    py-1.5
                    text-left
                    outline-none
                    transition-[background-color,transform]
                    hover:bg-cyan-400/[0.07]
                    focus-visible:bg-cyan-400/[0.10]
                    active:scale-[0.99]
                    ${isSelected ? 'bg-cyan-400/[0.08]' : ''}
                  `}
                >
                  {/* Selected mechanical rail */}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-1.5
                        left-0
                        top-1.5
                        w-px
                        bg-cyan-300/80
                        shadow-[0_0_7px_rgba(0,190,255,0.7)]
                      "
                    />
                  )}

                  <CoinBadge market={market} />

                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[11px] font-bold text-white">
                      {market.name}
                    </span>

                    <span className="block text-[8px] font-semibold tracking-[0.04em] text-slate-500">
                      {market.pair}
                    </span>
                  </span>

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="
                        grid
                        h-5
                        w-5
                        place-items-center
                        rounded-[6px]
                        border
                        border-cyan-400/20
                        bg-cyan-400/[0.06]
                      "
                    >
                      <Check
                        className="h-3 w-3 text-cyan-300"
                        strokeWidth={3}
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom structural rail */}
          <div
            aria-hidden="true"
            className="
              mt-1.5
              flex
              items-center
              gap-1.5
              px-2
              pb-1
            "
          >
            <span className="h-px w-7 bg-cyan-400/40" />
            <span className="h-[2px] w-1 rounded-full bg-cyan-300/60" />
            <span className="h-px flex-1 bg-cyan-400/10" />
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketSelector