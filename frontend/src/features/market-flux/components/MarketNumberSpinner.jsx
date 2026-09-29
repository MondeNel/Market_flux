/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Interactive market-number spinner for Market Flux.
 *
 * The component presents a market value as a mechanical,
 * slot-machine-inspired number display.
 *
 * Interaction:
 * - Swipe up   -> increase value
 * - Swipe down -> decrease value
 *
 * The component does not determine whether a move is correct.
 * It only reports the player's intended direction.
 */

import { useRef, useState } from 'react'

const DEFAULT_VALUE = 86538.74
const STEP = 1
const MIN_VALUE = 0

/**
 * Formats a market value for display.
 *
 * @param {number} value - Numeric market value.
 * @returns {string} Formatted market value.
 */
function formatMarketValue(value) {
  return value.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Interactive market-number spinner.
 *
 * @param {Object} props - Component properties.
 * @param {number} [props.value=DEFAULT_VALUE] - Current market value.
 * @param {(direction: 'up'|'down', value: number) => void} [props.onSpin]
 *   Callback fired after a successful spin.
 *
 * @returns {JSX.Element} Market number spinner.
 */
export default function MarketNumberSpinner({
  value = DEFAULT_VALUE,
  onSpin,
}) {
  const touchStartY = useRef(null)

  const [displayValue, setDisplayValue] = useState(value)
  const [lastDirection, setLastDirection] = useState(null)

  /**
   * Applies a market-value movement.
   *
   * @param {'up'|'down'} direction - Intended market direction.
   */
  function handleSpin(direction) {
    const nextValue =
      direction === 'up'
        ? displayValue + STEP
        : Math.max(MIN_VALUE, displayValue - STEP)

    setDisplayValue(nextValue)
    setLastDirection(direction)

    onSpin?.(direction, nextValue)
  }

  /**
   * Handles the beginning of a touch gesture.
   *
   * @param {React.TouchEvent} event - Touch event.
   */
  function handleTouchStart(event) {
    touchStartY.current = event.touches[0].clientY
  }

  /**
   * Handles completion of a touch gesture.
   *
   * @param {React.TouchEvent} event - Touch event.
   */
  function handleTouchEnd(event) {
    if (touchStartY.current === null) return

    const touchEndY = event.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY

    touchStartY.current = null

    if (Math.abs(deltaY) < 25) return

    if (deltaY > 0) {
      handleSpin('up')
    } else {
      handleSpin('down')
    }
  }

  return (
    <section
      className="relative flex w-full select-none flex-col items-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Direction indicator */}
      <div className="mb-3 flex h-6 items-center justify-center">
        {lastDirection && (
          <span
            className={[
              'text-xs font-bold uppercase tracking-[0.3em]',
              lastDirection === 'up'
                ? 'text-emerald-400'
                : 'text-red-400',
            ].join(' ')}
          >
            {lastDirection === 'up' ? '↑ Market Up' : '↓ Market Down'}
          </span>
        )}
      </div>

      {/* Spinner body */}
      <div className="relative flex w-full items-center justify-center">
        <div
          className="
            relative
            flex
            min-h-[130px]
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-black/90
            px-4
            shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
          "
        >
          {/* Mechanical highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />

          {/* Value */}
          <span
            className="
              font-mono
              text-5xl
              font-black
              tracking-[-0.06em]
              text-white
              drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]
              sm:text-6xl
            "
          >
            {formatMarketValue(displayValue)}
          </span>

          {/* Center guide */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.04]" />
        </div>
      </div>

      {/* Interaction hint */}
      <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
        <span>Swipe</span>
        <span className="text-white/20">↑</span>
        <span>or</span>
        <span className="text-white/20">↓</span>
        <span>to shift</span>
      </div>
    </section>
  )
}