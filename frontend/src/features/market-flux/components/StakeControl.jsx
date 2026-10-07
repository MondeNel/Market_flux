/**
 * @file src/features/market-flux/components/StakeControl.jsx
 *
 * @description
 * Stake control for the middle of the action row.
 *
 *            Stake
 *        [ − ]  R10  [ + ]
 *
 * It sits between the UP and DOWN panels, as in the layout sketch, and
 * replaces the old SPIN hub. The − and + buttons are disabled while a
 * round is running (the hook's canDecrease / canIncrease are false then).
 *
 * OUT OF FUNDS
 * ---------------------------------------------------------------------------
 * When the player cannot afford another round, the stake has no meaning, so
 * the same slot becomes the restart action:
 *
 *          Out of funds
 *         [ ↺ Restart ]
 *
 * SIZE
 * ---------------------------------------------------------------------------
 * About 50px tall, matching the UP and DOWN panels, and about 120px wide.
 * The buttons are 36px with an invisible extra hit area, so they measure
 * 44px to the touch.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * No landmark and no padding. It fills the middle (auto) column of the
 * action row grid in MarketFlux.jsx.
 *
 * Presentational only.
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
          min-w-[120px]
          flex-col
          items-center
          justify-center
          gap-1
        "
      >
        <span
          className="
            text-[10px]
            font-semibold
            leading-none
            text-amber-300
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
            h-9
            items-center
            gap-1.5
            rounded-[12px]
            border
            border-cyan-300/40
            bg-cyan-400/10
            px-3
            text-[12px]
            font-black
            uppercase
            tracking-[0.1em]
            text-cyan-100
            shadow-[0_4px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]
            outline-offset-2
            transition-transform
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-cyan-300
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
            strokeWidth={2.75}
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
        min-w-[120px]
        flex-col
        items-center
        justify-center
        gap-1
      "
    >
      <span
        className="
          text-[10px]
          font-semibold
          leading-none
          text-white/50
        "
      >
        Stake
      </span>

      <div className="flex items-center gap-1.5">
        <StakeButton
          label="Decrease stake"
          icon={Minus}
          disabled={!canDecrease}
          onClick={onDecrease}
        />

        <span
          aria-live="polite"
          className="
            min-w-[44px]
            text-center
            text-[18px]
            font-black
            leading-none
            tabular-nums
            text-white
            [text-shadow:0_0_12px_rgba(0,174,255,0.25)]
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

/* -------------------------------------------------------------------------- */
/* Stake button                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Mechanical plus / minus button.
 *
 * @param {object} props
 * @param {string} props.label Accessible name.
 * @param {React.ElementType} props.icon
 * @param {boolean} props.disabled
 * @param {() => void} props.onClick
 * @returns {JSX.Element}
 */
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
        h-9
        w-9
        shrink-0
        place-items-center
        rounded-[12px]
        border
        border-cyan-400/30
        bg-black/55
        text-cyan-200
        shadow-[0_5px_10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-4px_8px_rgba(0,0,0,0.4)]
        outline-offset-2
        transition-[transform,opacity,border-color]
        after:absolute
        after:-inset-1
        after:content-['']
        hover:border-cyan-300/55
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-cyan-300
        active:translate-y-[1px]
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-30
        disabled:hover:border-cyan-400/30
      "
    >
      {/* top glass reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-2
          top-1
          h-px
          rounded-full
          bg-white/15
        "
      />

      <Icon
        aria-hidden="true"
        className="
          relative
          h-4
          w-4
          transition-transform
          group-hover:scale-110
        "
        strokeWidth={2.75}
      />
    </button>
  )
}

export default StakeControl