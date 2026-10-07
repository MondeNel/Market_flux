/**
 * @file src/features/market-flux/components/RoundInfoPanel.jsx
 *
 * @description
 * Round information bar: Round, Spins remaining and Current stake.
 *
 *   ┌───────────┬──────────────────┬───────────────┐
 *   │ Round     │ Spins remaining  │ Current stake │
 *   │ 1 / 3     │   ●  ○  ○        │ R10           │
 *   └───────────┴──────────────────┴───────────────┘
 *
 * The stake here is a read-only display. It is changed with the − / +
 * control in the middle of the action row (StakeControl).
 *
 * SPIN DOTS
 * ---------------------------------------------------------------------------
 * One dot per round, showing where the player is in the run:
 *
 *   current   bright and glowing   the round being played
 *   played    dim, filled          rounds already finished (won or lost)
 *   upcoming  hollow               rounds still to come
 *
 * At the start of a run this reads ● ○ ○, as in the layout sketch.
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * No landmark and no horizontal padding. The wrapper in MarketFlux.jsx owns
 * both.
 *
 * Presentational only.
 */

import { TOTAL_ROUNDS } from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

const DOT_STATES = {
  current:
    'border-cyan-200/80 bg-cyan-300 shadow-[0_0_8px_rgba(60,200,255,0.8)]',

  played:
    'border-cyan-300/40 bg-cyan-400/40',

  upcoming:
    'border-white/25 bg-white/[0.04]',
}

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} [props.roundsPlayed] Rounds finished in this run, win or
 *   lose. Defaults to `round - 1`.
 * @param {number} props.stake Current stake.
 * @returns {JSX.Element}
 */
function RoundInfoPanel({
  round,
  roundsPlayed,
  stake,
}) {
  const played =
    roundsPlayed ?? round - 1

  return (
    <div
      role="group"
      aria-label="Round information"
      className="
        market-flux-mechanical
        grid
        grid-cols-3
        items-stretch
        rounded-[14px]
        border
        border-cyan-300/25
        bg-black/45
      "
    >
      <Cell label="Round">
        <span
          className="
            text-[17px]
            font-black
            leading-6
            tabular-nums
            text-white
          "
        >
          {round}
          <span className="text-white/40">
            {' '}
            / {TOTAL_ROUNDS}
          </span>
        </span>
      </Cell>

      <Cell
        label="Spins remaining"
        divided
      >
        <div
          role="img"
          aria-label={`Spin ${Math.min(round, TOTAL_ROUNDS)} of ${TOTAL_ROUNDS}`}
          className="
            flex
            h-6
            items-center
            gap-2
          "
        >
          {Array.from(
            { length: TOTAL_ROUNDS },
            (_, index) => {
              const state =
                index < played
                  ? 'played'
                  : index === round - 1
                    ? 'current'
                    : 'upcoming'

              return (
                <span
                  key={index}
                  className={`
                    h-3
                    w-3
                    rounded-full
                    border
                    transition-colors
                    duration-300
                    ${DOT_STATES[state]}
                  `}
                />
              )
            },
          )}
        </div>
      </Cell>

      <Cell
        label="Current stake"
        divided
      >
        <span
          className="
            text-[17px]
            font-black
            leading-6
            tabular-nums
            text-cyan-200
          "
        >
          {formatMoney(stake)}
        </span>
      </Cell>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Cell                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} [props.divided=false] Draw a divider on the left edge.
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
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
          max-w-full
          truncate
          text-[10px]
          font-semibold
          text-white/50
        "
      >
        {label}
      </span>

      {children}
    </div>
  )
}

export default RoundInfoPanel