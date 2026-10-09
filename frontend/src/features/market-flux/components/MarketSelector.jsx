/**
 * @file src/features/market-flux/components/MarketSelector.jsx
 *
 * @description
 * Physical liquid-glass market selector for Market Flux.
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import {
  ChevronDown,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Coin badge                                                                 */
/* -------------------------------------------------------------------------- */

export function CoinBadge({ market }) {
  return (
    <span
      aria-hidden="true"
      className="
        relative
        grid
        h-[26px]
        w-[26px]
        shrink-0
        place-items-center
        overflow-hidden
        rounded-full
        border
        border-amber-400/40
        shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.5),0_0_10px_rgba(245,158,11,0.3)]
      "
      style={{
        backgroundColor: market.color,
        color: market.glyphColor,
      }}
    >
      {/* Upper glass reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-[3px]
          top-[1px]
          h-[40%]
          rounded-full
          bg-white/40
          blur-[0.5px]
        "
      />

      <span
        className="
          relative
          z-10
          text-[11px]
          font-black
          leading-none
          drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]
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
  disabled,
}) {
  const [open, setOpen] = useState(false)

  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const menuId = useId()

  const isOpen =
    open &&
    !disabled

  useEffect(() => {
    if (disabled) {
      setOpen(false)
    }
  }, [disabled])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (
        !rootRef.current?.contains(
          event.target,
        )
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    )

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector(
          '[aria-selected="true"]',
        )
        ?.focus()
    })

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
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

    const options = [
      ...(
        menuRef.current
          ?.querySelectorAll(
            '[role="option"]',
          ) ?? []
      ),
    ]

    if (!options.length) {
      return
    }

    const current =
      options.indexOf(
        document.activeElement,
      )

    const step =
      event.key === 'ArrowDown'
        ? 1
        : -1

    const next =
      (
        current +
        step +
        options.length
      ) %
      options.length

    options[next]?.focus()
  }

  const choose = (
    marketId,
    event,
  ) => {
    onSelect(marketId)
    setOpen(false)

    if (event.detail === 0) {
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className="
        relative
        mx-auto
        w-fit
      "
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={
          isOpen
            ? menuId
            : undefined
        }
        aria-label={
          `Market: ${selected.name} ${selected.pair}`
        }
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        className="
          group
          relative
          flex
          h-[42px]
          w-[200px]
          items-center
          justify-between
          overflow-hidden
          rounded-full
          border
          border-cyan-400/40
          bg-gradient-to-b
          from-cyan-950/80
          via-black/90
          to-cyan-950/90
          px-3
          text-left
          shadow-[0_0_20px_rgba(0,191,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.8)]
          backdrop-blur-xl
          outline-none
          transition-all
          hover:border-cyan-300
          hover:shadow-[0_0_25px_rgba(0,191,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)]
          focus-visible:ring-2
          focus-visible:ring-cyan-400
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {/* Top glossy arc highlight */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-4
            top-0
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-cyan-200/60
            to-transparent
          "
        />

        <div className="flex items-center gap-2.5 min-w-0">
          <CoinBadge market={selected} />

          <span className="flex flex-col min-w-0 leading-tight">
            <span
              className="
                truncate
                text-[12px]
                font-black
                tracking-wider
                text-white
                drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
              "
            >
              {selected.name}
            </span>
            <span
              className="
                text-[9px]
                font-bold
                tracking-widest
                text-cyan-400/70
              "
            >
              {selected.pair}
            </span>
          </span>
        </div>

        {/* Dropdown chevron control */}
        <span
          aria-hidden="true"
          className="
            grid
            h-6
            w-6
            place-items-center
            rounded-full
            bg-cyan-950/60
            border
            border-cyan-400/30
            text-cyan-300
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]
          "
        >
          <ChevronDown
            className={`
              h-3.5
              w-3.5
              transition-transform
              duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
            strokeWidth={3}
          />
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label="Choose a market"
          onKeyDown={handleMenuKeyDown}
          className="
            absolute
            left-1/2
            top-full
            z-[100]
            mt-2
            w-[230px]
            -translate-x-1/2
            overflow-hidden
            rounded-2xl
            border
            border-cyan-400/40
            bg-black/90
            p-2
            shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(0,191,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]
            backdrop-blur-2xl
          "
        >
          <div className="mb-2 px-2 pt-1 text-[9px] font-black tracking-[0.2em] text-cyan-400/60 uppercase">
            Select Market
          </div>

          <div className="space-y-1">
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
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    px-2.5
                    py-2
                    text-left
                    outline-none
                    transition-all
                    ${
                      isSelected
                        ? 'border-cyan-400/50 bg-cyan-950/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                        : 'border-transparent bg-transparent hover:border-cyan-500/20 hover:bg-cyan-950/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CoinBadge market={market} />
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="truncate text-[11px] font-black tracking-wider text-white">
                        {market.name}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest text-cyan-400/60">
                        {market.pair}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,191,255,1)]" />
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