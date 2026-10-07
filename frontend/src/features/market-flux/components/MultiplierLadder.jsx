/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Bonus panel for Market Flux: the per-round multiplier table and the
 * completion bonus.
 *
 * LAYOUT
 * ---------------------------------------------------------------------------
 *   ┌────────────[ Bonus ×10 ]────────────┐
 *   │  ┌──────────────────────┐ ┌────────┐ │
 *   │  │ Round 3  →  ×8       │ │Win all 3│ │
 *   │  │ Round 2  →  ×6       │ │  +R100  │ │
 *   │  │ Round 1  →  ×3  R30  │ │  bonus  │ │
 *   │  └──────────────────────┘ └────────┘ │
 *   └──────────────────────────────────────┘
 *
 * - Best payout first, as in the layout sketch.
 * - The current round is highlighted and also shows the amount at stake
 *   (stake × multiplier). A win adds it and a loss removes it.
 * - Rounds already played this run are dimmed with a tick, won or lost.
 * - The "×10" in the title is the completion bonus: winning all three
 *   rounds pays stake × 10 on top of the Round 3 win. The block on the
 *   right shows the amount for the current stake. Once a round has been
 *   lost the bonus is out of reach for that run, and the block dims.
 *
 * The rows read from ROUND_CONFIG and the bonus from BONUS_MULTIPLIER, so
 * changing either in the simulation hook updates this panel. A bonus
 * multiplier of 0 hides the bonus entirely.
 *
 * "Round N" is written out in full rather than "R N", because R also means
 * rand and "R3 → ×8" next to "R30" is easy to misread.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * No landmark and no horizontal padding. The wrapper in MarketFlux.jsx owns
 * both.
 *
 * Presentational only; all state comes from the simulation hook.
 */

import { ArrowRight, Check } from 'lucide-react'

import {
  BONUS_MULTIPLIER,
  ROUND_CONFIG,
} from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

/**
 * Highest payout first.
 */
const ROWS = [...ROUND_CONFIG].reverse()

const HAS_BONUS = BONUS_MULTIPLIER > 0

/* -------------------------------------------------------------------------- */
/* Row styling                                                                */
/* -------------------------------------------------------------------------- */

const ROW_STATES = {
  current:
    'border-cyan-300/55 bg-cyan-400/[0.14] text-white shadow-[0_0_10px_rgba(40,200,255,0.25)]',

  played:
    'border-transparent text-white/35',

  upcoming:
    'border-transparent text-white/70',
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} [props.roundsPlayed] Rounds finished in this run, win or
 *   lose. Defaults to `round - 1`.
 * @param {number} [props.completedRounds] Rounds WON in this run. When
 *   given, the bonus dims once a round has been lost.
 * @param {number} [props.stake] Current stake. When given, the current row
 *   shows the amount at stake and the bonus block shows its amount.
 * @returns {JSX.Element}
 */
function MultiplierLadder({
  round,
  roundsPlayed,
  completedRounds,
  stake,
}) {
  const played =
    roundsPlayed ?? round - 1

  /**
   * The bonus needs every finished round to have been won.
   */
  const bonusAlive =
    completedRounds === undefined ||
    completedRounds >= played

  const bonusAmount =
    stake === undefined
      ? null
      : stake * BONUS_MULTIPLIER

  return (
    <div
      role="group"
      aria-label={
        HAS_BONUS
          ? `Round multipliers. Win all three rounds for a ×${BONUS_MULTIPLIER} bonus.`
          : 'Round multipliers'
      }
      className="
        relative
        pt-2.5
      "
    >
      <div
        className="
          market-flux-mechanical
          relative
          rounded-[14px]
          border
          border-cyan-300/25
          bg-black/45
          px-2.5
          pb-2.5
          pt-4
        "
      >
        {/* Title tab on the top edge */}

        <p
          className="
            absolute
            left-1/2
            top-0
            -translate-x-1/2
            -translate-y-1/2
            whitespace-nowrap
            rounded-full
            border
            border-cyan-300/30
            bg-[#04101a]
            px-3
            py-px
            text-[10px]
            font-bold
            uppercase
            tracking-[0.3em]
            text-cyan-200
          "
        >
          Bonus

          {HAS_BONUS && (
            <span
              className="
                ml-1
                inline-block
                -translate-y-[3px]
                text-[10px]
                font-black
                tracking-normal
                text-cyan-100
              "
            >
              ×{BONUS_MULTIPLIER}
            </span>
          )}
        </p>

        <div
          className={`
            grid
            items-stretch
            gap-2.5
            ${
              HAS_BONUS
                ? 'grid-cols-[1fr_auto]'
                : 'grid-cols-1'
            }
          `}
        >
          {/* ============================================================ */}
          {/* Payout table                                                  */}
          {/* ============================================================ */}

          <ul
            className="
              flex
              flex-col
              gap-0.5
              rounded-[10px]
              border
              border-white/10
              bg-black/40
              p-1
            "
          >
            {ROWS.map((item) => {
              const current =
                item.round === round

              const state =
                current
                  ? 'current'
                  : item.round <= played
                    ? 'played'
                    : 'upcoming'

              return (
                <PayoutRow
                  key={item.round}
                  round={item.round}
                  multiplier={item.multiplier}
                  state={state}
                  amount={
                    current &&
                    stake !== undefined
                      ? stake * item.multiplier
                      : null
                  }
                />
              )
            })}
          </ul>

          {/* ============================================================ */}
          {/* Completion bonus                                              */}
          {/* ============================================================ */}

          {HAS_BONUS && (
            <BonusBadge
              amount={bonusAmount}
              alive={bonusAlive}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Payout row                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.round
 * @param {number} props.multiplier
 * @param {'current'|'played'|'upcoming'} props.state
 * @param {number|null} props.amount Amount at stake (current row only).
 * @returns {JSX.Element}
 */
function PayoutRow({
  round,
  multiplier,
  state,
  amount,
}) {
  const current =
    state === 'current'

  return (
    <li
      aria-current={
        current
          ? 'step'
          : undefined
      }
      className={`
        flex
        h-[22px]
        items-center
        gap-1.5
        rounded-[7px]
        border
        px-1.5
        transition-colors
        duration-300
        ${ROW_STATES[state]}
      `}
    >
      {/* Played tick (the slot is always reserved so rows line up) */}

      <span
        aria-hidden="true"
        className="
          grid
          w-3
          shrink-0
          place-items-center
        "
      >
        {state === 'played' && (
          <Check
            className="
              h-3
              w-3
              text-emerald-300/70
            "
            strokeWidth={3}
          />
        )}
      </span>

      <span
        className="
          min-w-0
          flex-1
          truncate
          text-[11px]
          font-bold
        "
      >
        Round {round}
      </span>

      <ArrowRight
        aria-hidden="true"
        className="
          h-3
          w-3
          shrink-0
          text-cyan-300/70
        "
        strokeWidth={2.5}
      />

      <span
        className={`
          w-6
          shrink-0
          text-right
          text-[13px]
          font-black
          tabular-nums
          ${
            current
              ? 'text-cyan-200 drop-shadow-[0_0_6px_rgba(80,220,255,0.6)]'
              : ''
          }
        `}
      >
        ×{multiplier}
      </span>

      {/* Amount column (reserved on every row so the multipliers align) */}

      <span
        className="
          w-[44px]
          shrink-0
          text-right
          text-[10px]
          font-bold
          tabular-nums
          text-cyan-200/80
        "
      >
        {amount !== null &&
          formatMoney(amount)}
      </span>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/* Completion bonus                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The prize for winning all three rounds.
 *
 * @param {object} props
 * @param {number|null} props.amount Bonus for the current stake, or null
 *   when no stake is known (the multiplier is shown instead).
 * @param {boolean} props.alive False once a round has been lost this run.
 * @returns {JSX.Element}
 */
function BonusBadge({
  amount,
  alive,
}) {
  return (
    <div
      className={`
        flex
        w-[76px]
        flex-col
        items-center
        justify-center
        gap-0.5
        rounded-[10px]
        border
        px-1
        py-1.5
        text-center
        transition-[opacity,background-color,border-color]
        duration-300
        ${
          alive
            ? 'border-cyan-300/35 bg-cyan-400/[0.08]'
            : 'border-white/10 bg-white/[0.02] opacity-45'
        }
      `}
    >
      <span
        className="
          text-[10px]
          font-semibold
          leading-tight
          text-white/60
        "
      >
        Win all 3
      </span>

      <span
        className={`
          whitespace-nowrap
          text-[15px]
          font-black
          leading-none
          tabular-nums
          ${
            alive
              ? 'text-cyan-200 drop-shadow-[0_0_6px_rgba(80,220,255,0.6)]'
              : 'text-white/50'
          }
        `}
      >
        {amount === null
          ? `×${BONUS_MULTIPLIER}`
          : formatMoney(amount, { sign: true })}
      </span>

      <span
        className="
          text-[10px]
          font-semibold
          leading-tight
          text-white/45
        "
      >
        {alive ? 'bonus' : 'missed'}
      </span>
    </div>
  )
}

export default MultiplierLadder