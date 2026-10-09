/**
 * @file src/features/market-flux/components/RoundInfoPanel.jsx
 *
 * @description
 * Round information bar: Round, Spins remaining and Current stake.
 */

import { TOTAL_ROUNDS } from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

const DOT_STATES = {
  current:
    'border-cyan-300 bg-cyan-400 shadow-[0_0_8px_rgba(0,191,255,1)]',

  played:
    'border-cyan-400/40 bg-cyan-400/40 shadow-[0_0_4px_rgba(0,191,255,0.4)]',

  upcoming:
    'border-cyan-400/30 bg-cyan-950/60',
}

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} [props.roundsPlayed] Rounds finished in this run, win or lose.
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
        relative
        mx-auto
        flex
        h-[52px]
        w-full
        max-w-[420px]
        items-center
        justify-between
        rounded-full
        border
        border-cyan-400/40
        bg-gradient-to-r
        from-cyan-950/70
        via-black/85
        to-cyan-950/70
        px-5
        shadow-[0_0_25px_rgba(0,191,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-4px_10px_rgba(0,0,0,0.85)]
        backdrop-blur-2xl
      "
    >
      {/* Top glossy reflection line */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-8
          top-0
          h-[1px]
          bg-gradient-to-r
          from-transparent
          via-cyan-200/70
          to-transparent
        "
      />

      <Cell label="Round">
        <span
          className="
            text-[14px]
            font-black
            tracking-wider
            text-white
            drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
            tabular-nums
          "
        >
          {round}
          <span className="text-cyan-400/60 font-bold text-[12px]">
            {' '}
            / {TOTAL_ROUNDS}
          </span>
        </span>
      </Cell>

      <Cell label="Spins remaining" divided>
        <div
          role="img"
          aria-label={`Spin ${Math.min(round, TOTAL_ROUNDS)} of ${TOTAL_ROUNDS}`}
          className="
            relative
            flex
            h-5
            items-center
            gap-2.5
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
                    h-2.5
                    w-2.5
                    rounded-full
                    border
                    transition-all
                    duration-300
                    ${DOT_STATES[state]}
                  `}
                />
              )
            },
          )}

          {/* Progress track line under dots */}
          <span
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              bottom-0
              h-[2px]
              rounded-full
              bg-cyan-400/20
            "
          >
            <span
              className="
                absolute
                left-0
                top-0
                h-full
                rounded-full
                bg-cyan-400
                shadow-[0_0_6px_rgba(0,191,255,0.8)]
                transition-all
                duration-300
              "
              style={{
                width: `${(Math.min(round, TOTAL_ROUNDS) / TOTAL_ROUNDS) * 100}%`,
              }}
            />
          </span>
        </div>
      </Cell>

      <Cell label="Current stake" divided>
        <span
          className="
            text-[14px]
            font-black
            tracking-wider
            text-cyan-200
            drop-shadow-[0_0_8px_rgba(0,191,255,0.6)]
            tabular-nums
          "
        >
          {formatMoney(stake)}
        </span>
      </Cell>
    </div>
  )
}

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
        flex-1
        flex-col
        items-center
        justify-center
        gap-0.5
        px-2
        ${divided ? 'border-l border-cyan-400/20' : ''}
      `}
    >
      <span
        className="
          max-w-full
          truncate
          text-[9px]
          font-black
          uppercase
          tracking-[0.2em]
          text-cyan-400/60
        "
      >
        {label}
      </span>

      {children}
    </div>
  )
}

export default RoundInfoPanel