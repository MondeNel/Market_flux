/**
 * @file src/features/market-flux/components/StakeControl.jsx
 *
 * @description
 * Stake control for the middle of the action row.
 */

import { Minus, Plus, RotateCcw } from 'lucide-react'

import { formatMoney } from '../utils/formatMoney'

/**
 * @param {object} props
 * @param {number} props.stake Current stake.
 * @param {boolean} props.canDecrease
 * @param {boolean} props.canIncrease
 * @param {() => void} props.onDecrease
 * @param {() => void} props.onIncrease
 * @param {boolean} [props.isBroke=false] The player cannot afford a round.
 * @param {() => void} [props.onRestart] Restarts the demo when broke.
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
          flex
          min-w-[130px]
          flex-col
          items-center
          justify-center
          gap-1
        "
      >
        <span
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.2em]
            text-amber-400
          "
        >
          Out of funds
        </span>

        <button
          type="button"
          onClick={onRestart}
          className="
            group
            inline-flex
            h-10
            items-center
            gap-1.5
            rounded-xl
            border
            border-cyan-400/40
            bg-cyan-950/80
            px-3.5
            text-[11px]
            font-black
            uppercase
            tracking-[0.15em]
            text-cyan-100
            shadow-[0_0_15px_rgba(0,191,255,0.25),inset_0_1px_2px_rgba(255,255,255,0.3)]
            outline-none
            transition-transform
            hover:border-cyan-300
            active:scale-95
          "
        >
          <RotateCcw
            aria-hidden="true"
            className="
              h-3.5
              w-3.5
              transition-transform
              group-hover:-rotate-[35deg]
            "
            strokeWidth={3}
          />
          Restart
        </button>
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Stake"
      className="
        flex
        min-w-[140px]
        flex-col
        items-center
        justify-center
        gap-1
      "
    >
      <span
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.2em]
          text-cyan-400/60
        "
      >
        Stake
      </span>

      <div
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          border
          border-cyan-400/30
          bg-black/80
          p-1
          shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)]
          backdrop-blur-xl
        "
      >
        <StakeButton
          label="Decrease stake"
          icon={Minus}
          disabled={!canDecrease}
          onClick={onDecrease}
        />

        <span
          aria-live="polite"
          className="
            min-w-[50px]
            text-center
            text-[15px]
            font-black
            leading-none
            tabular-nums
            text-white
            drop-shadow-[0_0_8px_rgba(0,191,255,0.6)]
          "
        >
          {formatMoney(stake)}
        </span>

        <StakeButton
          label="Increase stake"
          icon={Plus}
          disabled={!canIncrease}
          onClick={onIncrease}
        />
      </div>
    </div>
  )
}

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
        group
        relative
        grid
        h-8
        w-8
        shrink-0
        place-items-center
        rounded-xl
        border
        border-cyan-400/30
        bg-cyan-950/50
        text-cyan-300
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]
        outline-none
        transition-all
        hover:border-cyan-400/60
        hover:bg-cyan-900/60
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      <Icon
        aria-hidden="true"
        className="
          relative
          h-3.5
          w-3.5
          transition-transform
          group-hover:scale-110
        "
        strokeWidth={3}
      />
    </button>
  )
}

export default StakeControl