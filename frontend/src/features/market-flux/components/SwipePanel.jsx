/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * Green (Up) and red (Down) prediction panels.
 * Works with a vertical swipe (touch or mouse drag) or a plain tap/click.
 * Keyboard users can focus the panel and press Enter or Space.
 */

import { useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const SWIPE_DISTANCE = 36
const TAP_TOLERANCE = 10

const THEMES = {
  up: {
    Icon: ChevronUp,
    label: 'Up',
    ariaLabel: 'Predict the price will go up',
    border: 'border-emerald-400',
    surface:
      'bg-[linear-gradient(180deg,rgba(16,185,129,0.3),rgba(2,24,18,0.9)_50%,rgba(16,185,129,0.34))]',
    glow: 'shadow-[0_0_26px_rgba(16,185,129,0.5),inset_0_0_34px_rgba(16,185,129,0.35)]',
    activeGlow:
      'shadow-[0_0_36px_rgba(52,211,153,0.75),inset_0_0_38px_rgba(16,185,129,0.45)]',
    icon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
    focus: 'focus-visible:outline-emerald-300',
    // Brightest chevron points the way of travel.
    opacities: [1, 0.68, 0.4],
  },
  down: {
    Icon: ChevronDown,
    label: 'Down',
    ariaLabel: 'Predict the price will go down',
    border: 'border-red-500',
    surface:
      'bg-[linear-gradient(180deg,rgba(239,68,68,0.3),rgba(28,4,6,0.9)_50%,rgba(239,68,68,0.34))]',
    glow: 'shadow-[0_0_26px_rgba(239,68,68,0.5),inset_0_0_34px_rgba(239,68,68,0.35)]',
    activeGlow:
      'shadow-[0_0_36px_rgba(248,113,113,0.75),inset_0_0_38px_rgba(239,68,68,0.45)]',
    icon: 'text-red-500 drop-shadow-[0_0_8px_rgba(248,113,113,0.9)]',
    focus: 'focus-visible:outline-red-300',
    opacities: [0.4, 0.68, 1],
  },
}

/**
 * @param {object} props
 * @param {'up'|'down'} props.direction Which side this panel represents.
 * @param {boolean} props.disabled Blocks input (round running, etc.).
 * @param {boolean} props.selected This panel holds the player's prediction.
 * @param {boolean} props.dimmed The other panel was picked.
 * @param {(direction: 'up'|'down') => void} props.onSelect
 * @returns {JSX.Element}
 */
function SwipePanel({ direction, disabled, selected, dimmed, onSelect }) {
  const theme = THEMES[direction]
  const { Icon } = theme
  const startY = useRef(null)

  const handlePointerDown = (event) => {
    startY.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (startY.current === null) return
    const delta = event.clientY - startY.current
    startY.current = null

    const swiped = direction === 'up' ? delta < -SWIPE_DISTANCE : delta > SWIPE_DISTANCE
    const tapped = Math.abs(delta) < TAP_TOLERANCE

    if (!disabled && (swiped || tapped)) onSelect(direction)
  }

  const handleKeyboardClick = (event) => {
    // Pointer taps are handled above; detail === 0 means keyboard activation.
    if (event.detail === 0 && !disabled) onSelect(direction)
  }

  return (
    <button
      type="button"
      aria-label={theme.ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startY.current = null
      }}
      onClick={handleKeyboardClick}
      className={`
        relative
        flex
        h-full
        w-full
        touch-none
        select-none
        flex-col
        items-center
        justify-between
        overflow-hidden
        rounded-[20px]
        border-2
        px-2
        pb-5
        pt-8
        outline-offset-2
        transition-[box-shadow,opacity,transform]
        duration-200
        focus-visible:outline
        focus-visible:outline-2
        active:scale-[0.98]
        motion-reduce:transition-none
        ${theme.border}
        ${theme.surface}
        ${selected ? theme.activeGlow : theme.glow}
        ${theme.focus}
        ${dimmed ? 'opacity-40' : ''}
        ${disabled && !selected ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Glass highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />

      <span className="flex flex-col items-center -space-y-3">
        {theme.opacities.map((opacity, index) => (
          <Icon
            key={index}
            aria-hidden="true"
            className={`h-11 w-14 ${theme.icon}`}
            strokeWidth={4}
            style={{ opacity }}
          />
        ))}
      </span>

      <span className="text-center leading-tight">
        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">
          Swipe
        </span>
        <span className="block text-[15px] font-black uppercase tracking-[0.12em] text-white">
          {theme.label}
        </span>
      </span>
    </button>
  )
}

export default SwipePanel