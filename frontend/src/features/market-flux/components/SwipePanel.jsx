/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * Compact directional commitment control for Market Flux.
 */

const PALETTES = {
  up: {
    label: 'UP',
    ariaLabel: 'Predict the market will go up',

    accent: '#39FF88',
    accentBright: '#a7ffda',

    glow: 'rgba(57,255,136,0.3)',
    glowStrong: 'rgba(57,255,136,0.8)',
    border: 'border-emerald-500/50',
    bg: 'from-emerald-950/60 via-black/90 to-emerald-950/70',
  },

  down: {
    label: 'DOWN',
    ariaLabel: 'Predict the market will go down',

    accent: '#FF3158',
    accentBright: '#ffaaa5',

    glow: 'rgba(255,49,88,0.3)',
    glowStrong: 'rgba(255,49,88,0.8)',
    border: 'border-rose-500/50',
    bg: 'from-rose-950/60 via-black/90 to-rose-950/70',
  },
}

/**
 * Direction commitment button.
 *
 * @param {object} props
 * @param {'up'|'down'} props.direction
 * @param {boolean} [props.disabled=false] Prevents interaction.
 * @param {boolean} [props.selected=false] This is the player's pick.
 * @param {boolean} [props.dimmed=false] The other direction is the pick.
 * @param {(direction: 'up'|'down') => void} props.onSelect
 * @returns {JSX.Element}
 */
function SwipePanel({
  direction,
  disabled = false,
  selected = false,
  dimmed = false,
  onSelect,
}) {
  const palette = PALETTES[direction]
  const isUp = direction === 'up'

  const handleClick = () => {
    if (disabled) return
    onSelect(direction)
  }

  const opacityClass =
    dimmed
      ? 'opacity-25'
      : disabled && !selected
        ? 'opacity-35'
        : 'opacity-100'

  return (
    <button
      type="button"
      aria-label={palette.ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onClick={handleClick}
      className={`
        group
        relative
        flex
        h-[54px]
        w-full
        min-w-0
        flex-col
        items-center
        justify-center
        gap-0.5
        overflow-hidden
        rounded-[18px]
        border
        bg-gradient-to-b
        outline-none
        select-none
        touch-manipulation
        transition-all
        duration-200
        ease-out
        motion-reduce:transition-none
        focus-visible:ring-2
        focus-visible:ring-white/40
        active:translate-y-[2px]
        disabled:cursor-not-allowed
        ${opacityClass}
        ${selected ? 'translate-y-[1px]' : ''}
        ${palette.bg}
        ${
          selected
            ? `${palette.border} shadow-[0_0_25px_${palette.glowStrong},inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_10px_rgba(0,0,0,0.85)]`
            : 'border-cyan-400/30 shadow-[0_10px_25px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.8)]'
        }
      `}
    >
      {/* Top glossy reflection line */}
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
          via-white/30
          to-transparent
        "
      />

      {/* Direction glow atmosphere */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-8
          w-16
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-xl
          transition-opacity
          duration-200
        "
        style={{
          background: palette.glow,
          opacity: selected ? 1 : 0.25,
        }}
      />

      {/* Direction Arrow */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="
          relative
          z-10
          h-5
          w-5
          transition-transform
          duration-150
          group-hover:scale-110
          group-active:scale-95
        "
        style={{
          filter: `drop-shadow(0 0 6px ${palette.glowStrong})`,
        }}
      >
        {isUp ? (
          <path
            d="M12 19V5M6 11l6-6 6 6"
            fill="none"
            stroke={palette.accentBright}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M12 5v14M6 13l6 6 6-6"
            fill="none"
            stroke={palette.accentBright}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Label */}
      <span
        className="
          relative
          z-10
          text-[13px]
          font-black
          uppercase
          leading-none
          tracking-[0.18em]
          text-white
        "
        style={{
          textShadow: selected
            ? `0 0 10px ${palette.glowStrong}`
            : '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {palette.label}
      </span>
    </button>
  )
}

export default SwipePanel