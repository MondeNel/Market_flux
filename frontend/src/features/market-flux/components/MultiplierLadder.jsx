/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Market Flux three-round progression instrument.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * The game consists of three fixed rounds:
 *
 *   Round 1 → ×3
 *   Round 2 → ×6
 *   Round 3 → ×8
 *
 * Each round has an independent value:
 *
 *   stake × multiplier
 *
 * The component visually communicates:
 *
 * - Completed rounds
 * - Current round
 * - Upcoming rounds
 * - Current multiplier
 * - Current round value
 * - Three-round progression
 *
 * Visual language:
 * - Floating liquid-glass structure
 * - Dark mechanical depth
 * - Neon-blue structural lighting
 * - Cyan illumination around the active round
 * - Subtle green completion state
 * - No conventional solid card
 * - No old step/ladder progression
 */

import { Check } from 'lucide-react'

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------ */

export const ROUND_CONFIG = [
  {
    round: 1,
    multiplier: 3,
  },
  {
    round: 2,
    multiplier: 6,
  },
  {
    round: 3,
    multiplier: 8,
  },
]

const TOTAL_ROUNDS = ROUND_CONFIG.length

/* ---------------------------------------------------------------------------
 * Formatting
 * ------------------------------------------------------------------------ */

const money = (value) =>
  `R${Number(value).toLocaleString('en-US')}`

/* ---------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */

/**
 * Render the three-round Market Flux progression.
 *
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} props.multiplier Current round multiplier.
 * @param {number} props.completedRounds Number of completed rounds.
 * @param {number} props.stake Current stake.
 * @returns {JSX.Element}
 */
function MultiplierLadder({
  round,
  multiplier,
  completedRounds,
  stake,
}) {
  const currentRound =
    ROUND_CONFIG.find(
      (item) => item.round === round,
    ) ?? ROUND_CONFIG[0]

  return (
    <section
      aria-label="Round progression"
      className="
        relative
        w-full
      "
    >
      {/* -------------------------------------------------------------------
       * Header
       * ---------------------------------------------------------------- */}

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          px-1
        "
      >
        <span
          className="
            text-[7px]
            font-bold
            uppercase
            tracking-[0.24em]
            text-slate-500
          "
        >
          Round progression
        </span>

        <span
          className="
            text-[7px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-cyan-300/70
          "
        >
          {completedRounds}/{TOTAL_ROUNDS} complete
        </span>
      </div>

      {/* -------------------------------------------------------------------
       * Progress structure
       * ---------------------------------------------------------------- */}

      <div
        className="
          relative
          h-[92px]
          w-full
        "
      >
        {/* ---------------------------------------------------------------
         * Background structural rail
         * ------------------------------------------------------------ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[12%]
            right-[12%]
            top-[25px]
            h-px
            bg-cyan-400/15
          "
        />

        {/* ---------------------------------------------------------------
         * Completed progress rail
         * ------------------------------------------------------------ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[12%]
            top-[25px]
            h-px
            bg-gradient-to-r
            from-emerald-300/80
            via-cyan-300/70
            to-cyan-300/30
            shadow-[0_0_6px_rgba(80,220,255,0.55)]
            transition-[width]
            duration-500
          "
          style={{
            width:
              completedRounds <= 0
                ? '0%'
                : completedRounds >= TOTAL_ROUNDS
                  ? '76%'
                  : `${completedRounds * 38}%`,
          }}
        />

        {/* ---------------------------------------------------------------
         * Round nodes
         * ------------------------------------------------------------ */}

        <div
          className="
            relative
            z-10
            grid
            h-full
            grid-cols-3
            gap-2
          "
        >
          {ROUND_CONFIG.map((item) => {
            const isCurrent =
              item.round === round

            const isCompleted =
              item.round <= completedRounds

            const isUpcoming =
              !isCurrent &&
              !isCompleted

            return (
              <RoundNode
                key={item.round}
                round={item.round}
                multiplier={item.multiplier}
                stake={stake}
                current={isCurrent}
                completed={isCompleted}
                upcoming={isUpcoming}
              />
            )
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------------
       * Current round readout
       * ---------------------------------------------------------------- */}

      <div
        className="
          mt-1
          flex
          items-center
          justify-center
          gap-2
        "
      >
        <span
          className="
            h-px
            w-8
            bg-gradient-to-r
            from-transparent
            to-cyan-400/30
          "
        />

        <span
          className="
            text-[7px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-slate-500
          "
        >
          Current round
        </span>

        <span
          className="
            text-[9px]
            font-black
            tabular-nums
            text-cyan-200
          "
        >
          ×{currentRound.multiplier}
        </span>

        <span
          className="
            text-[7px]
            font-bold
            text-slate-600
          "
        >
          ·
        </span>

        <span
          className="
            text-[9px]
            font-black
            tabular-nums
            text-white/80
          "
        >
          {money(
            Number(stake) *
              Number(currentRound.multiplier),
          )}
        </span>

        <span
          className="
            h-px
            w-8
            bg-gradient-to-l
            from-transparent
            to-cyan-400/30
          "
        />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Round node
 * ------------------------------------------------------------------------ */

/**
 * Render one round in the progression.
 *
 * @param {object} props
 * @param {number} props.round Round number.
 * @param {number} props.multiplier Round multiplier.
 * @param {number} props.stake Current stake.
 * @param {boolean} props.current Whether this is the active round.
 * @param {boolean} props.completed Whether this round has been completed.
 * @param {boolean} props.upcoming Whether this round is upcoming.
 * @returns {JSX.Element}
 */
function RoundNode({
  round,
  multiplier,
  stake,
  current,
  completed,
  upcoming,
}) {
  const amount =
    Number(stake) *
    Number(multiplier)

  return (
    <div
      className="
        relative
        flex
        flex-col
        items-center
      "
      aria-current={
        current
          ? 'step'
          : undefined
      }
    >
      {/* ---------------------------------------------------------------
       * Node
       * ------------------------------------------------------------ */}

      <div
        className={`
          relative
          flex
          h-[52px]
          w-[52px]
          items-center
          justify-center
          rounded-[15px]
          border
          transition-all
          duration-300

          ${
            current
              ? `
                border-cyan-200/80
                bg-[linear-gradient(145deg,rgba(35,130,190,0.34),rgba(2,12,24,0.86))]
                shadow-[0_0_16px_rgba(40,190,255,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]
              `
              : completed
                ? `
                  border-emerald-300/45
                  bg-[linear-gradient(145deg,rgba(20,90,75,0.24),rgba(2,12,18,0.78))]
                  shadow-[0_0_8px_rgba(60,220,170,0.18)]
                `
                : `
                  border-cyan-300/18
                  bg-[linear-gradient(145deg,rgba(12,35,55,0.24),rgba(2,8,16,0.72))]
                `
          }
        `}
      >
        {/* Mechanical inner edge */}

        <span
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            inset-[3px]
            rounded-[12px]
            border
            ${
              current
                ? 'border-cyan-200/15'
                : 'border-white/[0.035]'
            }
          `}
        />

        {/* Top reflection */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-3
            right-3
            top-1.5
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent
          "
        />

        {/* Completed check */}

        {completed && !current ? (
          <Check
            aria-hidden="true"
            className="
              relative
              h-5
              w-5
              text-emerald-300
              drop-shadow-[0_0_6px_rgba(60,230,170,0.7)]
            "
            strokeWidth={3}
          />
        ) : (
          <span
            className={`
              relative
              text-[18px]
              font-black
              tabular-nums
              ${
                current
                  ? 'text-white'
                  : upcoming
                    ? 'text-white/55'
                    : 'text-white/75'
              }
            `}
          >
            {round}
          </span>
        )}

        {/* Active glow */}

        {current && (
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -inset-3
              -z-10
              rounded-full
              bg-[radial-gradient(circle,rgba(50,190,255,0.28),transparent_68%)]
            "
          />
        )}
      </div>

      {/* ---------------------------------------------------------------
       * Multiplier
       * ------------------------------------------------------------ */}

      <span
        className={`
          mt-1.5
          text-[10px]
          font-black
          tabular-nums
          ${
            current
              ? 'text-cyan-200 drop-shadow-[0_0_5px_rgba(80,220,255,0.65)]'
              : completed
                ? 'text-emerald-300/75'
                : 'text-white/55'
          }
        `}
      >
        ×{multiplier}
      </span>

      {/* ---------------------------------------------------------------
       * Round value
       * ------------------------------------------------------------ */}

      <span
        className={`
          mt-0.5
          text-[7px]
          font-bold
          tabular-nums
          ${
            current
              ? 'text-white/85'
              : 'text-slate-500'
          }
        `}
      >
        {money(amount)}
      </span>

      {/* ---------------------------------------------------------------
       * Round label
       * ------------------------------------------------------------ */}

      <span
        className="
          mt-0.5
          text-[5px]
          font-bold
          uppercase
          tracking-[0.15em]
          text-slate-600
        "
      >
        Round {round}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------------ */

export default MultiplierLadder