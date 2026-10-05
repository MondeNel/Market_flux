/**
 * @file src/features/market-flux/components/RoundInfoPanel.jsx
 *
 * @description
 * Round information panel: Round, Spins Left and Stake.
 *
 *   ┌─────────┬─────────────┬────────────────┐
 *   │ ROUND   │ SPINS LEFT  │ STAKE          │
 *   │ 1 / 3   │  ● ● ●      │  [−]  R10  [+] │
 *   └─────────┴─────────────┴────────────────┘
 *
 * The stake cell replaces StakeControl. Its − and + buttons are 32px with
 * an invisible extra hit area so they stay easy to tap.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * No landmark and no horizontal padding. The wrapper in MarketFlux.jsx owns
 * both.
 *
 * Presentational only.
 */

import { Minus, Plus } from 'lucide-react'

import { TOTAL_ROUNDS } from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} props.spinsRemaining Rounds the player can still start.
 * @param {number} props.stake Current stake.
 * @param {boolean} props.canDecrease
 * @param {boolean} props.canIncrease
 * @param {() => void} props.onDecrease
 * @param {() => void} props.onIncrease
 * @returns {JSX.Element}
 */
function RoundInfoPanel({
  round,
  spinsRemaining,
  stake,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}) {
  return (
    <div
      role="group"
      aria-label="Round information"
      className="
        market-flux-mechanical
        grid
        grid-cols-[0.8fr_1fr_1.4fr]
        items-stretch
        rounded-[14px]
        border
        border-cyan-300/25
        bg-black/45
      "
    >
      <Cell label="Round">
        <span className="text-[17px] font-black tabular-nums text-white">
          {round}
          <span className="text-white/40">
            {' '}
            / {TOTAL_ROUNDS}
          </span>
        </span>
      </Cell>

      <Cell
        label="Spins Left"
        divided
      >
        <div
          role="img"
          aria-label={`${spinsRemaining} of ${TOTAL_ROUNDS} spins remaining`}
          className="flex h-8 items-center gap-2"
        >
          {Array.from(
            { length: TOTAL_ROUNDS },
            (_, index) => (
              <span
                key={index}
                className={`
                  h-3
                  w-3
                  rounded-full
                  border
                  transition-colors
                  duration-300
                  ${
                    index < spinsRemaining
                      ? 'border-cyan-200/80 bg-cyan-300 shadow-[0_0_8px_rgba(60,200,255,0.8)]'
                      : 'border-white/20 bg-white/[0.04]'
                  }
                `}
              />
            ),
          )}
        </div>
      </Cell>

      <Cell
        label="Stake"
        divided
      >
        <div className="flex items-center gap-1.5">
          <StakeButton
            label="Decrease stake"
            icon={Minus}
            disabled={!canDecrease}
            onClick={onDecrease}
          />

          <span
            className="
              min-w-[38px]
              text-center
              text-[17px]
              font-black
              tabular-nums
              text-cyan-200
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
      </Cell>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Cell                                                                       */
/* -------------------------------------------------------------------------- */

function Cell({
  label,
  divided = false,
  children,
}) {
  return (
    <div
      className={`
        flex
        min-w-0
        flex-col
        items-center
        justify-center
        gap-1
        px-2
        py-2
        ${divided ? 'border-l border-white/10' : ''}
      `}
    >
      <span
        className="
          whitespace-nowrap
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-white/45
        "
      >
        {label}
      </span>

      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stake button                                                               */
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
        relative
        grid
        h-8
        w-8
        shrink-0
        place-items-center
        rounded-[10px]
        border
        border-cyan-400/30
        bg-black/55
        text-cyan-200
        shadow-[0_4px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]
        outline-offset-2
        transition-[transform,opacity]
        after:absolute
        after:-inset-1.5
        after:content-['']
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-cyan-300
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      <Icon
        aria-hidden="true"
        className="h-4 w-4"
        strokeWidth={2.75}
      />
    </button>
  )
}

export default RoundInfoPanel