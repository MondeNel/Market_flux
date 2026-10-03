/**
 * @file src/features/market-flux/components/PredictionBar.jsx
 *
 * @description
 * Market Flux round-status instrument.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Floating HUD rather than a conventional glass card.
 * - Result/status message runs through the centre.
 * - Market movement percentage on the left.
 * - Compact countdown instrument in the centre.
 * - Round and stake information on the right.
 * - Broken cyan structural accents.
 * - No heavy backdrop.
 *
 * The component is presentational. All game state comes from the simulation
 * hook through props.
 */

import { ArrowDown, ArrowUp } from 'lucide-react'

import {
  ROUND_MS,
  TOTAL_ROUNDS,
} from '../hooks/useMarketSimulation'

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------ */

const RING_RADIUS = 15
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

const pad = (value) =>
  String(value).padStart(2, '0')

const money = (value) =>
  `R${Number(value).toLocaleString('en-US')}`

/* ---------------------------------------------------------------------------
 * Title / result state
 * ------------------------------------------------------------------------ */

/**
 * Resolve the current status message.
 *
 * @param {object} props
 * @param {'idle'|'live'|'revealing'|'result'} props.phase
 * @param {object|null} props.outcome
 * @returns {{text: string, tone: string}}
 */
function getTitle({ phase, outcome }) {
  if (outcome) {
    if (outcome.bonus) {
      return {
        text: `Bonus hit! +${money(
          outcome.payout -
            outcome.stake +
            outcome.bonus,
        )}`,
        tone: 'text-amber-300',
      }
    }

    if (outcome.won) {
      return {
        text: `Correct +${money(
          outcome.payout -
            outcome.stake,
        )}`,
        tone: 'text-emerald-300',
      }
    }

    if (outcome.nearMiss === 'bonus') {
      return {
        text: `So close to the bonus! -${money(
          outcome.stake,
        )}`,
        tone: 'text-amber-300',
      }
    }

    if (outcome.nearMiss === 'photo') {
      return {
        text: `Photo finish, missed by ${outcome.marginPct.toFixed(
          2,
        )}% -${money(outcome.stake)}`,
        tone: 'text-amber-300',
      }
    }

    return {
      text: `Missed -${money(outcome.stake)}`,
      tone: 'text-rose-300',
    }
  }

  if (phase === 'revealing') {
    return {
      text: 'Revealing price',
      tone: 'text-cyan-200',
    }
  }

  if (phase === 'live') {
    return {
      text: 'Round live',
      tone: 'text-cyan-200',
    }
  }

  return {
    text: 'Predict the next move',
    tone: 'text-cyan-300/80',
  }
}

/* ---------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */

/**
 * @param {object} props
 * @param {number} props.changePct Price change since round open.
 * @param {number} props.round Current round, 1-based.
 * @param {number} props.stake Current stake.
 * @param {'idle'|'live'|'revealing'|'result'} props.phase Current round phase.
 * @param {'up'|'down'|null} props.prediction Player prediction.
 * @param {number} props.elapsed Milliseconds elapsed in the live round.
 * @param {object|null} props.outcome Last round outcome.
 * @returns {JSX.Element}
 */
function PredictionBar({
  changePct,
  round,
  stake,
  phase,
  prediction,
  elapsed,
  outcome,
}) {
  /* -----------------------------------------------------------------------
   * Market movement
   * -------------------------------------------------------------------- */

  const rounded =
    Number(changePct.toFixed(2))

  const pctText =
    `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}%`

  const pctTone =
    rounded > 0
      ? 'text-emerald-300'
      : rounded < 0
        ? 'text-rose-300'
        : 'text-white'

  /* -----------------------------------------------------------------------
   * Countdown
   * -------------------------------------------------------------------- */

  const progress =
    phase === 'live'
      ? Math.min(elapsed / ROUND_MS, 1)
      : phase === 'revealing'
        ? 1
        : 0

  const remaining =
    phase === 'live'
      ? Math.max(
          0,
          Math.ceil(
            (ROUND_MS - elapsed) / 1000,
          ),
        )
      : 0

  const title = getTitle({
    phase,
    outcome,
  })

  const PredictionIcon =
    prediction === 'up'
      ? ArrowUp
      : ArrowDown

  return (
    <section
      aria-label="Round status"
      className="
        relative
        mx-3
        py-2
      "
    >
      {/* -------------------------------------------------------------------
       * Top structural rail
       * ---------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-3
          right-3
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-300/45
          to-transparent
        "
      />

      {/* Small mechanical breaks */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-px
          w-7
          bg-cyan-300/80
          shadow-[0_0_5px_rgba(80,210,255,0.6)]
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-px
          w-7
          bg-cyan-300/80
          shadow-[0_0_5px_rgba(80,210,255,0.6)]
        "
      />

      {/* -------------------------------------------------------------------
       * Status headline
       * ---------------------------------------------------------------- */}
      <div
        className="
          flex
          min-h-[18px]
          items-center
          gap-2
        "
      >
        <span
          aria-hidden="true"
          className="
            h-px
            flex-1
            bg-gradient-to-r
            from-transparent
            to-cyan-400/35
          "
        />

        <h2
          aria-live="polite"
          className={`
            max-w-[72%]
            truncate
            text-center
            text-[8px]
            font-bold
            uppercase
            tracking-[0.22em]
            ${title.tone}
          `}
        >
          {title.text}
        </h2>

        <span
          aria-hidden="true"
          className="
            h-px
            flex-1
            bg-gradient-to-l
            from-transparent
            to-cyan-400/35
          "
        />
      </div>

      {/* -------------------------------------------------------------------
       * Main status row
       * ---------------------------------------------------------------- */}
      <div
        className="
          relative
          mt-2
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {/* ---------------------------------------------------------------
         * Price movement
         * ------------------------------------------------------------ */}
        <div
          className="
            flex
            min-w-[62px]
            flex-col
            items-start
          "
        >
          <span
            className="
              text-[6px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-slate-500
            "
          >
            Movement
          </span>

          <span
            className={`
              mt-1
              text-[15px]
              font-black
              leading-none
              tabular-nums
              ${pctTone}
            `}
          >
            {pctText}
          </span>

          {/* Movement direction indicator */}
          <div
            className={`
              mt-1
              h-px
              w-8
              ${
                rounded > 0
                  ? 'bg-emerald-400/70'
                  : rounded < 0
                    ? 'bg-rose-400/70'
                    : 'bg-cyan-300/40'
              }
            `}
          />
        </div>

        {/* ---------------------------------------------------------------
         * Countdown instrument
         * ------------------------------------------------------------ */}
        <div
          className="
            relative
            h-[48px]
            w-[48px]
            shrink-0
          "
        >
          {/* Outer atmospheric glow */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              bg-[radial-gradient(circle,rgba(40,180,255,0.12),transparent_70%)]
            "
          />

          <svg
            viewBox="0 0 40 40"
            className="
              relative
              h-full
              w-full
              -rotate-90
              overflow-visible
            "
            aria-hidden="true"
          >
            {/* Mechanical outer ring */}
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS + 2}
              fill="none"
              stroke="rgba(90,190,255,0.12)"
              strokeWidth="1"
            />

            {/* Dark track */}
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="rgba(2,8,20,0.72)"
              stroke="rgba(34,211,238,0.16)"
              strokeWidth="3"
            />

            {/* Progress */}
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="none"
              stroke={
                phase === 'revealing'
                  ? 'rgb(103,232,249)'
                  : 'rgb(103,232,249)'
              }
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={
                RING_LENGTH *
                (1 - progress)
              }
              className="
                transition-[stroke-dashoffset]
                duration-[400ms]
                ease-linear
              "
              style={{
                filter:
                  'drop-shadow(0 0 3px rgba(80,210,255,0.85))',
              }}
            />

            {/* Small mechanical ticks */}
            <circle
              cx="20"
              cy="3"
              r="0.8"
              fill="rgba(160,235,255,0.8)"
            />

            <circle
              cx="20"
              cy="37"
              r="0.8"
              fill="rgba(160,235,255,0.45)"
            />
          </svg>

          {/* Centre content */}
          <span
            className="
              absolute
              inset-0
              grid
              place-items-center
            "
          >
            {prediction ? (
              <PredictionIcon
                aria-hidden="true"
                className={`
                  h-4
                  w-4
                  ${
                    prediction === 'up'
                      ? 'text-emerald-300'
                      : 'text-rose-300'
                  }
                  drop-shadow-[0_0_5px_currentColor]
                `}
                strokeWidth={3}
              />
            ) : phase === 'live' ? (
              <span
                className="
                  text-[11px]
                  font-black
                  tabular-nums
                  text-cyan-200
                "
              >
                {remaining}
              </span>
            ) : (
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-cyan-300/65
                  shadow-[0_0_5px_rgba(80,210,255,0.8)]
                "
              />
            )}
          </span>
        </div>

        {/* ---------------------------------------------------------------
         * Round / stake
         * ------------------------------------------------------------ */}
        <div
          className="
            flex
            min-w-[100px]
            items-center
            justify-end
            gap-3
          "
        >
          <Stat
            label="Round"
            value={`${pad(round)}/${TOTAL_ROUNDS}`}
            align="center"
          />

          <span
            aria-hidden="true"
            className="
              h-6
              w-px
              bg-gradient-to-b
              from-transparent
              via-cyan-300/30
              to-transparent
            "
          />

          <Stat
            label="Stake"
            value={`R ${stake}`}
            valueClassName="text-cyan-300"
            align="center"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------------
       * Bottom structural rail
       * ---------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          mt-2
          flex
          items-center
          gap-2
        "
      >
        <span className="h-px w-8 bg-cyan-400/35" />

        <span className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />

        <span
          className="
            h-[3px]
            w-[3px]
            rounded-full
            bg-cyan-300/70
            shadow-[0_0_5px_rgba(80,210,255,0.7)]
          "
        />

        <span className="h-px flex-1 bg-gradient-to-l from-cyan-400/20 to-transparent" />

        <span className="h-px w-8 bg-cyan-400/35" />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Stat
 * ------------------------------------------------------------------------ */

/**
 * Small HUD statistic.
 *
 * @param {object} props
 * @param {string} props.label Statistic label.
 * @param {string|number} props.value Statistic value.
 * @param {string} [props.valueClassName='text-white'] Value styling.
 * @param {'left'|'center'} [props.align='center'] Alignment.
 * @returns {JSX.Element}
 */
function Stat({
  label,
  value,
  valueClassName = 'text-white',
  align = 'center',
}) {
  const alignment =
    align === 'left'
      ? 'items-start'
      : 'items-center'

  return (
    <div
      className={`
        flex
        min-w-[42px]
        flex-col
        ${alignment}
      `}
    >
      <span
        className="
          text-[6px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-slate-500
        "
      >
        {label}
      </span>

      <span
        className={`
          mt-1
          text-[12px]
          font-black
          leading-none
          tabular-nums
          ${valueClassName}
        `}
      >
        {value}
      </span>
    </div>
  )
}

export default PredictionBar