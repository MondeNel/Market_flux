/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * Compact directional commitment control for Market Flux.
 *
 * The market reel is the hero of the screen. These controls commit the
 * player's directional prediction and sit either side of the SPIN button:
 *
 *     UP   -> predict the market will rise
 *     DOWN -> predict the market will fall
 *
 * The parent owns all game logic. This component only communicates:
 *
 *     onSelect('up')
 *     onSelect('down')
 *
 * LAYOUT
 * ---------------------------------------------------------------------------
 * Arrow stacked above the label, centred. The stacked layout keeps the
 * control narrow enough to share a row with the raised centre button on a
 * 360px screen.
 *
 * STATES
 * ---------------------------------------------------------------------------
 * normal    full brightness, subtle direction-coloured edge light
 * selected  the player's pick: pressed in, fully lit, strong glow
 * dimmed    the other direction while a round is running
 * disabled  locked with no pick (for example when the player is out of
 *           funds): faded
 *
 * `disabled` is a BEHAVIOUR flag only. It does not fade a selected panel.
 * During a round both panels are disabled, and the one the player picked
 * must stay bright so the commitment is clear.
 *
 * Visual language:
 * - dark mechanical housing
 * - liquid-glass surface
 * - green / red directional energy
 * - pressed / selected state
 * - restrained neon edge accents
 * - no swipe tracking (tap only)
 */

/**
 * Direction-specific visual configuration.
 */
const PALETTES = {
  up: {
    label: 'UP',
    ariaLabel: 'Predict the market will go up',

    accent: '#31ff9a',
    accentBright: '#a7ffda',

    glow: 'rgba(49,255,154,0.28)',
    glowStrong: 'rgba(49,255,154,0.68)',
  },

  down: {
    label: 'DOWN',
    ariaLabel: 'Predict the market will go down',

    accent: '#ff403d',
    accentBright: '#ffaaa5',

    glow: 'rgba(255,64,61,0.28)',
    glowStrong: 'rgba(255,64,61,0.68)',
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

  /*
   * Opacity is driven by the pick, not by `disabled`, so the selected
   * panel stays bright while the round is running.
   */
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
        h-[50px]
        w-full
        min-w-0
        flex-col
        items-center
        justify-center
        gap-0.5
        overflow-hidden
        rounded-[14px]
        border
        outline-none
        select-none
        touch-manipulation
        transition-all
        duration-150
        ease-out
        motion-reduce:transition-none
        focus-visible:ring-2
        focus-visible:ring-white/40
        active:translate-y-[2px]
        disabled:cursor-not-allowed
        ${opacityClass}
        ${selected ? 'translate-y-[1px]' : ''}
      `}
      style={{
        /*
         * Neutral black structural body.
         *
         * The direction colour comes from the lighting rather than
         * turning the entire control green or red.
         */
        background: `
          linear-gradient(
            145deg,
            rgba(24,28,33,0.96),
            rgba(5,7,10,0.98) 52%,
            rgba(13,16,20,0.96)
          )
        `,

        borderColor: selected
          ? `${palette.accent}88`
          : 'rgba(255,255,255,0.075)',

        boxShadow: selected
          ? `
              inset 0 1px 0 rgba(255,255,255,0.15),
              inset 0 -8px 16px rgba(0,0,0,0.58),
              inset 0 0 18px ${palette.glow},
              0 0 9px ${palette.glowStrong},
              0 0 22px ${palette.glow},
              0 7px 14px rgba(0,0,0,0.72)
            `
          : `
              inset 0 1px 0 rgba(255,255,255,0.11),
              inset 0 -8px 16px rgba(0,0,0,0.62),
              0 5px 12px rgba(0,0,0,0.68)
            `,
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Structural outer edge                                            */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[14px]
        "
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255,255,255,0.11),
              transparent 22%,
              transparent 76%,
              rgba(255,255,255,0.035)
            )
          `,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Direction neon edge accents                                      */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[9%]
          right-[9%]
          top-0
          h-px
        "
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              ${palette.accent}88 22%,
              ${palette.accent}44 78%,
              transparent
            )
          `,
          opacity: selected ? 1 : 0.5,
          boxShadow: selected
            ? `0 0 8px ${palette.glowStrong}`
            : undefined,
        }}
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-[16%]
          right-[16%]
          h-px
        "
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              ${palette.accent}55,
              transparent
            )
          `,
          opacity: selected ? 0.9 : 0.35,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Glass reflection                                                 */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-4
          top-[1px]
          h-[12px]
          rounded-full
          bg-gradient-to-b
          from-white/[0.12]
          to-transparent
          opacity-70
        "
      />

      {/* ---------------------------------------------------------------- */}
      {/* Direction atmosphere                                             */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-10
          w-20
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-xl
          transition-opacity
          duration-150
        "
        style={{
          background: palette.glow,
          opacity: selected ? 0.9 : 0.2,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Direction arrow                                                  */}
      {/* ---------------------------------------------------------------- */}

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
          group-hover:scale-105
          group-active:scale-95
        "
        style={{
          filter: `
            drop-shadow(0 0 4px ${palette.glowStrong})
            drop-shadow(0 0 8px ${palette.glow})
          `,
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

      {/* ---------------------------------------------------------------- */}
      {/* Label                                                             */}
      {/* ---------------------------------------------------------------- */}

      <span
        className="
          relative
          z-10
          text-[14px]
          font-black
          uppercase
          leading-none
          tracking-[0.14em]
          text-white
        "
        style={{
          textShadow: selected
            ? `0 0 9px ${palette.glowStrong}`
            : '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {palette.label}
      </span>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom mechanical reflection                                     */}
      {/* ---------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[3px]
          left-[18%]
          right-[18%]
          h-px
        "
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.12),
              transparent
            )
          `,
        }}
      />
    </button>
  )
}

export default SwipePanel