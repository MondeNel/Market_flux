/**
 * @file src/features/market-flux/MarketDirectionControl.jsx
 *
 * @description
 * Direction decision control for Market Flux.
 *
 * The player chooses the expected direction of the market:
 * - UP
 * - DOWN
 *
 * Responsibilities:
 * - Present the two possible market directions
 * - Provide strong visual distinction between UP and DOWN
 * - Track the player's current selection through controlled state
 * - Provide touch-friendly interaction
 * - Communicate the selected direction to the parent
 *
 * Game resolution is intentionally handled outside this component.
 */

import { ArrowDown, ArrowUp } from 'lucide-react'

/**
 * Direction button.
 *
 * @param {Object} props
 * @param {'up'|'down'} props.direction - Direction represented by button.
 * @param {boolean} props.selected - Whether this direction is selected.
 * @param {boolean} props.disabled - Whether the button is disabled.
 * @param {() => void} props.onClick - Selection callback.
 * @returns {JSX.Element}
 */
function DirectionButton({
  direction,
  selected,
  disabled,
  onClick,
}) {
  const isUp = direction === 'up'

  const Icon = isUp ? ArrowUp : ArrowDown

  const label = isUp
    ? 'MARKET UP'
    : 'MARKET DOWN'

  const helper = isUp
    ? 'I THINK IT RISES'
    : 'I THINK IT FALLS'

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Predict market ${isUp ? 'up' : 'down'}`}
      onClick={onClick}
      className={`
        group
        relative
        flex
        h-[68px]
        min-w-0
        flex-1
        touch-manipulation
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[16px]
        border
        transition-all
        duration-200
        ease-out
        active:scale-[0.97]

        ${
          isUp
            ? selected
              ? `
                border-emerald-300/55
                bg-emerald-300/[0.10]
                shadow-[0_0_22px_rgba(52,211,153,0.18),inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-7px_12px_rgba(0,0,0,0.55)]
              `
              : `
                border-emerald-300/20
                bg-[#06110e]/85
                shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-7px_12px_rgba(0,0,0,0.58)]
              `
            : selected
              ? `
                border-red-300/55
                bg-red-300/[0.10]
                shadow-[0_0_22px_rgba(248,113,113,0.18),inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-7px_12px_rgba(0,0,0,0.55)]
              `
              : `
                border-red-300/20
                bg-[#120909]/85
                shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-7px_12px_rgba(0,0,0,0.58)]
              `
        }

        ${
          disabled
            ? 'cursor-not-allowed opacity-35'
            : 'cursor-pointer'
        }
      `}
    >
      {/* ================================================================
          GLASS TOP REFLECTION
          ================================================================ */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-4
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
        "
      />

      {/* ================================================================
          ACTIVE EDGE LIGHT
          ================================================================ */}

      {selected && (
        <span
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            h-px
            w-16
            -translate-x-1/2
            blur-[1px]
            ${
              isUp
                ? 'bg-emerald-300/60'
                : 'bg-red-300/60'
            }
          `}
        />
      )}

      {/* ================================================================
          ICON
          ================================================================ */}

      <div
        className={`
          relative
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-[8px]
          border
          ${
            isUp
              ? selected
                ? 'border-emerald-300/35 bg-emerald-300/10 text-emerald-200'
                : 'border-emerald-300/15 bg-emerald-300/[0.04] text-emerald-300/55'
              : selected
                ? 'border-red-300/35 bg-red-300/10 text-red-200'
                : 'border-red-300/15 bg-red-300/[0.04] text-red-300/55'
          }
          transition-all
          duration-200
        `}
      >
        <Icon
          size={15}
          strokeWidth={2.5}
        />
      </div>

      {/* ================================================================
          LABEL
          ================================================================ */}

      <span
        className={`
          mt-1.5
          text-[8px]
          font-black
          leading-none
          tracking-[0.12em]
          ${
            selected
              ? 'text-white'
              : 'text-white/55'
          }
        `}
      >
        {label}
      </span>

      {/* ================================================================
          HELPER TEXT
          ================================================================ */}

      <span
        className="
          mt-[3px]
          text-[5px]
          font-semibold
          leading-none
          tracking-[0.16em]
          text-white/20
        "
      >
        {helper}
      </span>
    </button>
  )
}

/**
 * Market direction control.
 *
 * @param {Object} props
 * @param {'up'|'down'|null} [props.value=null] - Selected direction.
 * @param {(direction: 'up'|'down') => void} [props.onChange] -
 *   Called when a direction is selected.
 * @param {boolean} [props.disabled=false] - Disable both directions.
 * @returns {JSX.Element}
 */
function MarketDirectionControl({
  value = null,
  onChange,
  disabled = false,
}) {
  return (
    <section
      className="
        relative
        z-10
        w-full
        px-4
        pt-6
      "
    >
      {/* ================================================================
          SECTION LABEL
          ================================================================ */}

      <div className="mb-2.5 flex items-center justify-between px-1">
        <div>
          <span
            className="
              text-[6px]
              font-bold
              uppercase
              tracking-[0.24em]
              text-white/25
            "
          >
            Your Prediction
          </span>

          <div
            className="
              mt-[3px]
              text-[8px]
              font-semibold
              text-white/45
            "
          >
            Where does the market move?
          </div>
        </div>

        {value && (
          <span
            className={`
              rounded-full
              border
              px-2
              py-1
              text-[6px]
              font-bold
              uppercase
              tracking-[0.15em]
              ${
                value === 'up'
                  ? 'border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-300/70'
                  : 'border-red-300/20 bg-red-300/[0.05] text-red-300/70'
              }
            `}
          >
            {value === 'up'
              ? 'UP SELECTED'
              : 'DOWN SELECTED'}
          </span>
        )}
      </div>

      {/* ================================================================
          DIRECTION CONTROLS
          ================================================================ */}

      <div className="flex w-full gap-2.5">
        <DirectionButton
          direction="up"
          selected={value === 'up'}
          disabled={disabled}
          onClick={() => onChange?.('up')}
        />

        <DirectionButton
          direction="down"
          selected={value === 'down'}
          disabled={disabled}
          onClick={() => onChange?.('down')}
        />
      </div>
    </section>
  )
}

export default MarketDirectionControl