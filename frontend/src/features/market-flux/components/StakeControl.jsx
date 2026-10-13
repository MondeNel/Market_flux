
/**
 * @file src/features/market-flux/components/StakeControl.jsx
 *
 * @description
 * Compact mechanical stake selector for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Reference-inspired metallic control module
 * - Recessed liquid-glass stake display
 * - Compact physical +/- adjustment buttons
 * - Cyan specular highlights
 * - Dark machined-metal construction
 * - Mobile-first dimensions
 *
 * BEHAVIOUR
 * ---------------------------------------------------------------------------
 * - Preserves the existing stake-control API
 * - Supports disabled adjustment buttons
 * - Displays an accessible restart control when broke
 * - Does not modify simulation logic
 */

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { formatMoney } from '../utils/formatMoney'

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const FRAME_SHAPE =
  'polygon(12% 0,88% 0,100% 13%,100% 87%,88% 100%,12% 100%,0 87%,0 13%)'

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.stake
 * @param {boolean} props.canDecrease
 * @param {boolean} props.canIncrease
 * @param {() => void} props.onDecrease
 * @param {() => void} props.onIncrease
 * @param {boolean} [props.isBroke=false]
 * @param {() => void} [props.onRestart]
 * @returns {JSX.Element}
 */
function StakeControl({
  stake,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  isBroke = false,
  onRestart,
}) {
  if (isBroke) {
    return (
      <div
        role="group"
        aria-label="Out of funds"
        className="
          relative flex w-[92px] shrink-0
          flex-col items-center justify-center
          gap-1 sm:w-[110px]
        "
      >
        <span
          className="
            whitespace-nowrap text-[8px]
            font-black uppercase
            tracking-[0.08em] text-amber-300
          "
        >
          No funds
        </span>

        <button
          type="button"
          disabled={!onRestart}
          onClick={onRestart}
          className="
            flex h-[38px] w-full
            items-center justify-center gap-1
            rounded-lg border border-amber-400/50
            bg-[linear-gradient(180deg,#39260b,#080b10)]
            text-[10px] font-black uppercase
            text-amber-100
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_5px_12px_rgba(0,0,0,0.8)]
            transition-transform
            active:translate-y-px
            disabled:opacity-40
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-amber-300
          "
        >
          <RotateCcw
            aria-hidden="true"
            className="h-3.5 w-3.5"
            strokeWidth={2.5}
          />
          Restart
        </button>
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Stake control"
      className="
        relative flex
        w-[92px] shrink-0
        flex-col items-center
        sm:w-[110px]
      "
    >
      {/* Main mechanical module */}
      <div
        className="
          relative isolate flex
          h-[72px] w-full
          flex-col items-center
          justify-center gap-[3px]
          overflow-hidden
          border border-cyan-300/50
          bg-[linear-gradient(180deg,#17445c_0%,#020c15_14%,#00050b_65%,#10364c_100%)]
          px-[7px] py-[5px]
          shadow-[0_7px_16px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(220,250,255,0.4),inset_0_-3px_5px_rgba(0,0,0,0.9)]
          sm:h-[80px]
        "
        style={{
          clipPath: FRAME_SHAPE,
        }}
      >
        {/* Upper chrome reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-[20%] right-[20%] top-0
            h-[2px] rounded-full
            bg-cyan-100/80
            shadow-[0_0_7px_rgba(0,220,255,0.8)]
          "
        />

        {/* Label */}
        <span
          className="
            relative z-10
            text-[8px] font-black
            uppercase leading-none
            tracking-[0.16em]
            text-cyan-200/75
          "
        >
          Stake
        </span>

        {/* Recessed stake amount display */}
        <div
          className="
            relative z-10 flex
            h-[24px] w-full
            items-center justify-center
            overflow-hidden rounded-[5px]
            border border-cyan-400/35
            bg-[linear-gradient(180deg,#000308,#061c2b_55%,#000408)]
            shadow-[inset_0_3px_6px_rgba(0,0,0,0.95),inset_0_-1px_2px_rgba(0,200,255,0.15)]
          "
        >
          <span
            aria-live="polite"
            className="
              relative z-10 max-w-full
              truncate px-1
              text-center text-[clamp(12px,3.3vw,17px)]
              font-black leading-none
              tabular-nums tracking-tight
              text-white
              drop-shadow-[0_0_6px_rgba(0,200,255,0.65)]
            "
          >
            {formatMoney(stake)}
          </span>

          {/* Display reflection */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute
              inset-x-[6%] top-0 h-[40%]
              bg-gradient-to-b
              from-cyan-200/10 to-transparent
            "
          />
        </div>

        {/* Mechanical adjustment controls */}
        <div
          className="
            relative z-10 flex
            w-full items-center
            justify-between gap-[5px]
          "
        >
          <StakeButton
            label="Decrease stake"
            icon={Minus}
            disabled={!canDecrease}
            onClick={onDecrease}
          />

          {/* Centre illuminated separator */}
          <span
            aria-hidden="true"
            className="
              h-[3px] w-[3px]
              shrink-0 rounded-full
              bg-cyan-300
              shadow-[0_0_6px_rgba(0,220,255,0.9)]
            "
          />

          <StakeButton
            label="Increase stake"
            icon={Plus}
            disabled={!canIncrease}
            onClick={onIncrease}
          />
        </div>

        {/* Bottom structural highlight */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-0 left-[18%] right-[18%]
            h-px
            bg-gradient-to-r
            from-transparent via-cyan-300/70 to-transparent
          "
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mechanical adjustment button                                               */
/* -------------------------------------------------------------------------- */

function StakeButton({
  label,
  icon: Icon,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        group relative grid
        h-[20px] min-w-0 flex-1
        place-items-center
        overflow-hidden
        rounded-[5px]
        border border-cyan-300/45
        bg-[linear-gradient(180deg,#1b506a_0%,#061b29_38%,#01070d_100%)]
        text-cyan-100
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_2px_4px_rgba(0,0,0,0.75)]
        transition-[transform,filter]
        duration-150
        hover:brightness-125
        active:translate-y-px
        disabled:cursor-not-allowed
        disabled:opacity-30
        focus-visible:outline-2
        focus-visible:outline-cyan-200
        motion-reduce:transition-none
      "
    >
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-[15%] top-0 h-px
          bg-cyan-100/60
        "
      />

      <Icon
        aria-hidden="true"
        className="
          relative z-10 h-[12px] w-[12px]
          transition-transform
          group-hover:scale-110
        "
        strokeWidth={3}
      />
    </button>
  )
}

export default StakeControl
