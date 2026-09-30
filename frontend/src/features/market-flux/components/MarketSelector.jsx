/**
 * @file src/features/market-flux/components/MarketSelector.jsx
 *
 * @description
 * Symbol picker: a pill showing the selected market that opens a listbox of
 * markets. Disabled while a round is running.
 *
 * Keyboard: Enter/Space opens, Arrow keys move, Enter selects, Escape closes.
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
      style={{ backgroundColor: market.color, color: market.glyphColor }}
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-black shadow-[0_0_8px_rgba(255,255,255,0.15)]"
    >
      {market.glyph}
    </span>
  )
}

/**
 * @param {object} props
 * @param {object[]} props.markets Available markets.
 * @param {object} props.selected Currently selected market.
 * @param {(marketId: string) => void} props.onSelect
 * @param {boolean} props.disabled Locks the picker (round running).
 * @returns {JSX.Element}
 */
function MarketSelector({ markets, selected, onSelect, disabled }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const menuId = useId()

  // A locked picker is never open, even if it was when the round started.
  const isOpen = open && !disabled

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    // Land on the current selection so arrow keys start from there.
    menuRef.current?.querySelector('[aria-selected="true"]')?.focus()

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleMenuKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()

    const options = [...menuRef.current.querySelectorAll('[role="option"]')]
    const current = options.indexOf(document.activeElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    options[(current + step + options.length) % options.length]?.focus()
  }

  const choose = (marketId) => {
    onSelect(marketId)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
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
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-cyan-300/45
          bg-white/[0.03]
          py-1
          pl-1
          pr-2
          text-left
          shadow-[0_0_10px_rgba(0,190,255,0.2),inset_0_0_10px_rgba(0,190,255,0.12)]
          outline-offset-2
          transition-opacity
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-cyan-300
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <CoinBadge market={selected} />

        <span className="leading-tight">
          <span className="block text-[10px] font-bold text-white">
            {selected.name}
          </span>
          <span className="block text-[7px] font-semibold text-slate-300">
            ({selected.pair})
          </span>
        </span>

        <ChevronDown
          aria-hidden="true"
          className={`h-3 w-3 text-cyan-300 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
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
            left-0
            top-full
            z-50
            mt-2
            w-[212px]
            overflow-hidden
            rounded-[16px]
            border
            border-cyan-300/45
            bg-[#03101f]/85
            p-1
            shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_18px_rgba(0,190,255,0.25)]
            backdrop-blur-xl
          "
        >
          {markets.map((market) => {
            const isSelected = market.id === selected.id
            return (
              <button
                key={market.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(market.id)}
                className={`
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-[12px]
                  px-2
                  py-1.5
                  text-left
                  outline-none
                  transition-colors
                  hover:bg-cyan-400/10
                  focus-visible:bg-cyan-400/15
                  ${isSelected ? 'bg-cyan-400/10' : ''}
                `}
              >
                <CoinBadge market={market} />
                <span className="flex-1 leading-tight">
                  <span className="block text-[11px] font-bold text-white">
                    {market.name}
                  </span>
                  <span className="block text-[8px] font-semibold text-slate-400">
                    {market.pair}
                  </span>
                </span>
                {isSelected && (
                  <Check
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-cyan-300"
                    strokeWidth={3}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MarketSelector