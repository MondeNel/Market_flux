/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Bonus panel for Market Flux: the per-round multiplier table.
 *
 * LAYOUT
 * ---------------------------------------------------------------------------
 *   ┌──────────────[ BONUS ]──────────────┐
 *   │  ┌───────────────────────────┐      │
 *   │  │ Round 3  →  ×8            │   🪙 │
 *   │  │ Round 2  →  ×6            │      │
 *   │  │ Round 1  →  ×3     R30    │      │
 *   │  └───────────────────────────┘      │
 *   └─────────────────────────────────────┘
 *
 * - Best payout first, matching the reference.
 * - The current round is highlighted and also shows the amount at stake
 *   (stake × multiplier). A win adds it and a loss removes it.
 * - Rounds already played this sequence are dimmed with a tick, whether
 *   they were won or lost.
 *
 * The rows read from ROUND_CONFIG, so changing a multiplier in the
 * simulation hook updates this table automatically.
 *
 * "Round N" is written out in full rather than "R N", because R also means
 * rand and "R3 → ×8" next to "R30" is easy to misread.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * No landmark and no horizontal padding. The section in MarketFlux.jsx
 * owns both.
 *
 * Presentational only; all state comes from the simulation hook.
 */

import { useId } from 'react'
import { ArrowRight, Check } from 'lucide-react'

import { ROUND_CONFIG } from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

/**
 * Highest payout first.
 */
const ROWS = [...ROUND_CONFIG].reverse()

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
 * @param {number} [props.roundsPlayed] Rounds finished in this sequence,
 *   win or lose. Defaults to `round - 1`.
 * @param {number} [props.stake] Current stake. When given, the current row
 *   shows the amount at stake.
 * @returns {JSX.Element}
 */
function MultiplierLadder({
  round,
  roundsPlayed,
  stake,
}) {
  const played =
    roundsPlayed ?? round - 1

  return (
    <div
      role="group"
      aria-label="Round multipliers"
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
        </p>

        <div
          className="
            grid
            grid-cols-[1fr_auto]
            items-center
            gap-3
          "
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
          {/* Multiplier icon                                               */}
          {/* ============================================================ */}

          <CoinStack className="h-14 w-14" />
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
/* Coin stack                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Stacked-coins multiplier icon: three coins, an up arrow, a small cross.
 *
 * @param {object} props
 * @param {string} [props.className] Sizing, e.g. "h-14 w-14".
 * @returns {JSX.Element}
 */
function CoinStack({ className = '' }) {
  const id =
    useId().replace(/:/g, '')

  const sideId =
    `coin-side-${id}`

  const topId =
    `coin-top-${id}`

  /* Coin centres, bottom to top. */
  const coins = [34, 27, 20]

  return (
    <svg
      viewBox="0 0 56 54"
      aria-hidden="true"
      className={className}
      style={{
        filter:
          'drop-shadow(0 0 6px rgba(40,190,255,0.35))',
      }}
    >
      <defs>
        <linearGradient
          id={sideId}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0" stopColor="#12344a" />
          <stop offset="0.45" stopColor="#6fd3ff" />
          <stop offset="1" stopColor="#0d2b3f" />
        </linearGradient>

        <linearGradient
          id={topId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#d6f6ff" />
          <stop offset="1" stopColor="#3aa6d8" />
        </linearGradient>
      </defs>

      {coins.map((cy) => (
        <g key={cy}>
          {/* Coin edge */}
          <path
            d={`M13 ${cy} v5 a15 5.5 0 0 0 30 0 v-5 a15 5.5 0 0 0 -30 0 Z`}
            fill={`url(#${sideId})`}
            stroke="rgba(160,230,255,0.55)"
            strokeWidth="0.6"
          />

          {/* Coin face */}
          <ellipse
            cx="28"
            cy={cy}
            rx="15"
            ry="5.5"
            fill={`url(#${topId})`}
            stroke="rgba(200,240,255,0.8)"
            strokeWidth="0.6"
          />
        </g>
      ))}

      {/* Up arrow */}
      <path
        d="M28 12 V4 M23.5 8.5 L28 4 L32.5 8.5"
        fill="none"
        stroke="#7DE8FF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Multiplier cross */}
      <path
        d="M44 44 l5 5 M49 44 l-5 5"
        fill="none"
        stroke="#7DE8FF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default MultiplierLadder