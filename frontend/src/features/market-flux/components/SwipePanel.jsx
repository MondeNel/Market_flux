
/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * Reference-inspired directional commitment controls.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Angular, machined-metal silhouette
 * - Emerald UP / crimson DOWN lighting
 * - Raised outer housing and recessed illuminated face
 * - Metallic bevels, glass reflections and inner shadows
 * - Compact mobile-first sizing
 * - Clearly visible selected and disabled states
 *
 * BEHAVIOUR
 * ---------------------------------------------------------------------------
 * - Preserves the existing onSelect(direction) API
 * - Does not alter market simulation or settlement
 * - Uses native button semantics
 */

const PALETTES = {
  up: {
    label: 'UP',
    ariaLabel: 'Predict the market will go up',
    accent: '#39FF88',
    bright: '#C1FFE0',
    dark: '#042C20',
    edge: '#087D55',
    glow: 'rgba(57,255,136,0.65)',
    ambient: 'rgba(57,255,136,0.25)',
  },

  down: {
    label: 'DOWN',
    ariaLabel: 'Predict the market will go down',
    accent: '#FF3158',
    bright: '#FFD0D7',
    dark: '#350715',
    edge: '#A01B3C',
    glow: 'rgba(255,49,88,0.65)',
    ambient: 'rgba(255,49,88,0.25)',
  },
}

const OUTER_SHAPE =
  'polygon(10% 0,90% 0,100% 24%,100% 76%,90% 100%,10% 100%,0 76%,0 24%)'

const INNER_SHAPE =
  'polygon(9% 0,91% 0,100% 25%,100% 75%,91% 100%,9% 100%,0 75%,0 25%)'

/**
 * @param {object} props
 * @param {'up'|'down'} props.direction
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.selected=false]
 * @param {boolean} [props.dimmed=false]
 * @param {(direction:'up'|'down') => void} props.onSelect
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

  if (!palette) return null

  const isUp = direction === 'up'

  const muted = dimmed || (disabled && !selected)

  const handleClick = () => {
    if (!disabled) {
      onSelect?.(direction)
    }
  }

  return (
    <button
      type="button"
      aria-label={palette.ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onClick={handleClick}
      className={`
        group relative isolate
        block h-[56px] w-full min-w-0
        select-none touch-manipulation
        outline-none
        transition-[opacity,transform,filter]
        duration-200 ease-out
        motion-reduce:transition-none
        focus-visible:rounded-xl
        focus-visible:ring-2
        focus-visible:ring-white
        focus-visible:ring-offset-2
        focus-visible:ring-offset-black
        active:translate-y-[2px]
        disabled:cursor-not-allowed
        sm:h-[64px]
        lg:h-[72px]
        ${
          muted
            ? 'opacity-40 saturate-50'
            : 'opacity-100'
        }
        ${
          selected
            ? 'translate-y-[1px]'
            : ''
        }
      `}
    >
      {/* Atmospheric glow behind the button */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-[12%] bottom-[-5px]
          h-[35%] rounded-full blur-xl
        "
        style={{
          background: palette.accent,
          opacity: selected ? 0.6 : 0.25,
        }}
      />

      {/* Outer metallic silhouette */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          clipPath: OUTER_SHAPE,
          background: `
            linear-gradient(
              165deg,
              ${palette.bright} 0%,
              ${palette.accent} 12%,
              ${palette.edge} 34%,
              #02070B 53%,
              ${palette.edge} 78%,
              ${palette.accent} 100%
            )
          `,
          filter: selected
            ? `drop-shadow(0 0 12px ${palette.glow})`
            : `drop-shadow(0 4px 5px rgba(0,0,0,0.8))`,
        }}
      />

      {/* Black mechanical gasket */}
      <span
        aria-hidden="true"
        className="absolute inset-[2px]"
        style={{
          clipPath: INNER_SHAPE,
          background:
            'linear-gradient(180deg,#07141B 0%,#010408 50%,#09151C 100%)',
        }}
      />

      {/* Illuminated inset face */}
      <span
        aria-hidden="true"
        className="absolute inset-[5px]"
        style={{
          clipPath: INNER_SHAPE,
          background: `
            linear-gradient(
              180deg,
              ${palette.edge} 0%,
              ${palette.dark} 24%,
              #02070B 58%,
              ${palette.dark} 100%
            )
          `,
          boxShadow: `
            inset 0 3px 8px rgba(0,0,0,0.9),
            inset 0 -2px 6px ${palette.ambient}
          `,
        }}
      />

      {/* Upper illuminated panel */}
      <span
        aria-hidden="true"
        className="
          absolute inset-x-[13%]
          top-[5px] h-[2px]
          rounded-full
        "
        style={{
          background: `linear-gradient(90deg,transparent,${palette.bright},transparent)`,
          boxShadow: `0 0 8px ${palette.glow}`,
        }}
      />

      {/* Interior directional light */}
      <span
        aria-hidden="true"
        className="
          absolute inset-x-[16%]
          top-[18%] bottom-[12%]
          rounded-[50%] blur-xl
        "
        style={{
          background: palette.ambient,
          opacity: selected ? 0.9 : 0.45,
        }}
      />

      {/* Main button content */}
      <span
        className="
          relative z-10 flex h-full w-full
          items-center justify-center
          gap-[clamp(5px,1.8vw,12px)]
          px-2
        "
      >
        {/* Large directional arrow */}
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="
            h-[clamp(20px,5.8vw,34px)]
            w-[clamp(20px,5.8vw,34px)]
            shrink-0
            transition-transform duration-150
            group-hover:scale-110
            group-active:scale-95
          "
          fill="none"
          style={{
            filter: `drop-shadow(0 0 6px ${palette.glow})`,
          }}
        >
          {isUp ? (
            <path
              d="M16 26V6M7 15l9-9 9 9"
              stroke={palette.bright}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M16 6v20M7 17l9 9 9-9"
              stroke={palette.bright}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        <span
          className="
            whitespace-nowrap
            text-[clamp(15px,4.4vw,26px)]
            font-black uppercase
            leading-none tracking-[0.06em]
          "
          style={{
            color: palette.bright,
            textShadow: `
              0 1px 2px rgba(0,0,0,0.9),
              0 0 8px ${palette.glow}
            `,
          }}
        >
          {palette.label}
        </span>
      </span>

      {/* Lower polished reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute
          bottom-[3px] left-[20%] right-[20%]
          h-px rounded-full
        "
        style={{
          background: `linear-gradient(90deg,transparent,${palette.accent},transparent)`,
          opacity: selected ? 1 : 0.65,
        }}
      />

      {/* Selected indicator */}
      {selected && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            right-[12%] top-[11%]
            h-[5px] w-[5px]
            rounded-full
          "
          style={{
            background: palette.bright,
            boxShadow: `0 0 8px ${palette.glow}`,
          }}
        />
      )}
    </button>
  )
}

export default SwipePanel
