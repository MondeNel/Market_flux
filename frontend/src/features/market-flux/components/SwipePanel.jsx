
/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * Direction commitment buttons for Market Flux.
 *
 * The original component was a tall swipe gesture surface.
 * Market Flux now uses the market-number spinner as the primary interaction,
 * so these controls are intentionally reduced to compact UP / DOWN buttons
 * positioned beneath the play area.
 *
 * Interaction:
 * - Click / tap -> commits the selected market direction.
 * - Enter / Space -> commits the selected direction.
 *
 * The parent owns the game logic. This component only communicates:
 *
 *     onSelect('up')
 *     onSelect('down')
 *
 * Visual direction:
 * - compact 3D liquid-glass control
 * - dark mechanical housing
 * - green UP / red DOWN energy
 * - directional chevron
 * - physical pressed state
 * - subtle neon edge lighting
 * - no swipe tracking
 */

const PALETTES = {
  up: {
    label: 'UP',

    ariaLabel: 'Predict the market will go up',

    accent: '#31ff9a',

    accentBright: '#9affd2',

    glow: 'rgba(49,255,154,0.42)',

    glowStrong: 'rgba(49,255,154,0.8)',

    body:
      'linear-gradient(145deg, rgba(12,55,45,0.92), rgba(2,15,12,0.96) 52%, rgba(5,43,31,0.92))',

    icon:
      'linear-gradient(180deg, #8affcf 0%, #19dc8b 100%)',

    iconShadow:
      '0 0 7px rgba(49,255,154,0.8), 0 0 18px rgba(20,220,130,0.35)',
  },

  down: {
    label: 'DOWN',

    ariaLabel: 'Predict the market will go down',

    accent: '#ff332f',

    accentBright: '#ffaaa3',

    glow: 'rgba(255,51,47,0.42)',

    glowStrong: 'rgba(255,51,47,0.8)',

    body:
      'linear-gradient(145deg, rgba(74,8,13,0.92), rgba(17,1,3,0.96) 52%, rgba(66,7,12,0.92))',

    icon:
      'linear-gradient(180deg, #ff8c82 0%, #df1010 100%)',

    iconShadow:
      '0 0 7px rgba(255,60,50,0.8), 0 0 18px rgba(220,20,20,0.35)',
  },
}

/**
 * Direction button.
 *
 * @param {object} props
 * @param {'up'|'down'} props.direction
 * @param {boolean} props.disabled
 * @param {boolean} props.selected
 * @param {boolean} props.dimmed
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
        h-[58px]
        w-full
        min-w-0
        items-center
        justify-center
        overflow-hidden
        rounded-[16px]
        border
        border-white/[0.08]
        outline-none
        select-none
        touch-manipulation
        transition-all
        duration-150
        ease-out
        focus-visible:ring-2
        focus-visible:ring-white/50
        active:translate-y-[2px]
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${dimmed ? 'opacity-30' : ''}
        ${selected ? 'translate-y-[1px]' : ''}
      `}
      style={{
        background: palette.body,

        boxShadow: selected
          ? `
              inset 0 1px 0 rgba(255,255,255,0.16),
              inset 0 -8px 18px rgba(0,0,0,0.42),
              0 0 10px ${palette.glowStrong},
              0 0 24px ${palette.glow},
              0 7px 14px rgba(0,0,0,0.65)
            `
          : `
              inset 0 1px 0 rgba(255,255,255,0.13),
              inset 0 -8px 18px rgba(0,0,0,0.45),
              0 4px 10px rgba(0,0,0,0.58)
            `,

        borderColor: selected
          ? `${palette.accent}99`
          : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Broken neon edge                                                 */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[16px]
        "
        style={{
          boxShadow: `
            inset 0 1px 0 ${palette.accent}88,
            inset 0 -1px 0 ${palette.accent}25
          `,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Top glass reflection                                             */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-3
          top-[1px]
          h-[18px]
          rounded-full
          bg-gradient-to-b
          from-white/[0.13]
          to-transparent
          opacity-70
        "
      />

      {/* ---------------------------------------------------------------- */}
      {/* Atmospheric glow                                                 */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-14
          w-24
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-2xl
          transition-opacity
          duration-150
          group-hover:opacity-100
          group-active:opacity-100
        "
        style={{
          background: palette.glow,
          opacity: selected ? 0.8 : 0.3,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Direction icon                                                    */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          relative
          z-10
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-[10px]
          border
          border-white/10
          bg-black/30
          transition-transform
          duration-150
          group-hover:scale-105
          group-active:scale-95
        "
        style={{
          boxShadow: selected
            ? `0 0 12px ${palette.glow}`
            : 'inset 0 2px 5px rgba(0,0,0,0.45)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          style={{
            filter: palette.iconShadow,
          }}
        >
          {isUp ? (
            <path
              d="M12 19V5M6 11l6-6 6 6"
              fill="none"
              stroke={palette.accentBright}
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M12 5v14M6 13l6 6 6-6"
              fill="none"
              stroke={palette.accentBright}
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </span>

      {/* ---------------------------------------------------------------- */}
      {/* Label                                                             */}
      {/* ---------------------------------------------------------------- */}

      <span
        className="
          relative
          z-10
          ml-3
          flex
          flex-col
          items-start
          justify-center
          leading-none
        "
      >
        <span
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.22em]
            text-white/50
          "
        >
          Predict
        </span>

        <span
          className="
            mt-1
            text-[15px]
            font-black
            uppercase
            tracking-[0.12em]
            text-white
          "
          style={{
            textShadow: selected
              ? `0 0 9px ${palette.glowStrong}`
              : undefined,
          }}
        >
          {palette.label}
        </span>
      </span>

      {/* ---------------------------------------------------------------- */}
      {/* Direction accent                                                 */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          absolute
          right-3
          top-1/2
          h-7
          w-px
          -translate-y-1/2
        "
        style={{
          background: `linear-gradient(
            to bottom,
            transparent,
            ${palette.accent},
            transparent
          )`,
          opacity: selected ? 0.9 : 0.35,
          boxShadow: selected
            ? `0 0 8px ${palette.glowStrong}`
            : undefined,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Bottom mechanical highlight                                      */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-[12%]
          right-[12%]
          h-px
        "
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${palette.accent}66,
            transparent
          )`,
        }}
      />
    </button>
  )
}

export default SwipePanel