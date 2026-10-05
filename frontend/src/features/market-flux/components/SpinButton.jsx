/**
 * @file src/features/market-flux/components/SpinButton.jsx
 *
 * @description
 * Raised centre hub of the action row.
 *
 * UP and DOWN start the round, so this hub is a status instrument rather
 * than a trigger. It carries the round countdown ring that used to live in
 * PredictionBar:
 *
 *   idle        SPIN        faint pulsing halo
 *   live        8 7 6 …     ring fills over the round, with the player's arrow
 *   revealing   REVEAL      ring full
 *   result      ✓ / ✗       ring turns green or red
 *   broke       RESTART     the hub becomes a button that restarts the demo
 *
 * The only interactive state is `isBroke`. In every other state it is a
 * plain image with a label that changes per phase (not per second, so
 * screen readers are not read the countdown).
 *
 * Presentational only.
 */

import {
  ArrowDown,
  ArrowUp,
  Check,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react'

import { ROUND_MS } from '../hooks/useMarketSimulation'

const RING_RADIUS = 34
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

const RING_TONES = {
  cyan: {
    stroke: '#67e8f9',
    glow: 'rgba(40,190,255,0.35)',
  },

  win: {
    stroke: '#34d399',
    glow: 'rgba(52,211,153,0.5)',
  },

  loss: {
    stroke: '#fb7185',
    glow: 'rgba(251,113,133,0.5)',
  },
}

const LABELS = {
  idle: 'Spin. Tap Up or Down to start.',
  live: 'Round live',
  revealing: 'Revealing price',
  result: 'Round result',
}

const CAPTION =
  'mt-1 text-[10px] font-black uppercase leading-none tracking-[0.14em] text-white'

/**
 * @param {object} props
 * @param {'idle'|'live'|'revealing'|'result'} props.phase
 * @param {'up'|'down'|null} props.prediction
 * @param {number} props.elapsed Milliseconds elapsed in the live round.
 * @param {object|null} props.outcome Last round outcome.
 * @param {boolean} props.isBroke
 * @param {() => void} props.onRestart
 * @returns {JSX.Element}
 */
function SpinButton({
  phase = 'idle',
  prediction = null,
  elapsed = 0,
  outcome = null,
  isBroke = false,
  onRestart,
}) {
  const progress =
    phase === 'live'
      ? Math.min(elapsed / ROUND_MS, 1)
      : phase === 'idle'
        ? 0
        : 1

  const remaining =
    Math.max(
      0,
      Math.ceil(
        (ROUND_MS - elapsed) / 1000,
      ),
    )

  const tone =
    phase === 'result' && outcome
      ? outcome.won
        ? RING_TONES.win
        : RING_TONES.loss
      : RING_TONES.cyan

  const hub = (
    <Hub
      progress={progress}
      tone={tone}
      pulsing={phase === 'idle'}
    >
      <Face
        phase={phase}
        prediction={prediction}
        remaining={remaining}
        outcome={outcome}
        isBroke={isBroke}
      />
    </Hub>
  )

  if (isBroke) {
    return (
      <button
        type="button"
        aria-label="Restart demo"
        onClick={onRestart}
        className="
          rounded-full
          outline-offset-4
          transition-transform
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-cyan-300
          active:scale-95
        "
      >
        {hub}
      </button>
    )
  }

  return (
    <div
      role="img"
      aria-label={LABELS[phase] ?? LABELS.idle}
    >
      {hub}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

function Hub({
  progress,
  tone,
  pulsing,
  children,
}) {
  return (
    <span
      className="
        relative
        grid
        h-[76px]
        w-[76px]
        place-items-center
        rounded-full
      "
      style={{
        background: `
          radial-gradient(
            circle at 50% 30%,
            rgba(30,70,100,0.9),
            rgba(3,9,15,0.98) 70%
          )
        `,

        border:
          '1px solid rgba(120,220,255,0.35)',

        boxShadow: `
          inset 0 2px 0 rgba(255,255,255,0.18),
          inset 0 -8px 14px rgba(0,0,0,0.7),
          0 0 18px ${tone.glow},
          0 10px 18px rgba(0,0,0,0.6)
        `,
      }}
    >
      {/* Idle halo */}

      {pulsing && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -inset-1
            rounded-full
            border
            border-cyan-300/30
            motion-safe:animate-pulse
          "
        />
      )}

      {/* Countdown ring */}

      <svg
        aria-hidden="true"
        viewBox="0 0 80 80"
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          -rotate-90
        "
      >
        <circle
          cx="40"
          cy="40"
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(90,190,255,0.14)"
          strokeWidth="4"
        />

        <circle
          cx="40"
          cy="40"
          r={RING_RADIUS}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={
            RING_LENGTH * (1 - progress)
          }
          className="
            transition-[stroke-dashoffset,stroke]
            duration-1000
            ease-linear
            motion-reduce:transition-none
          "
          style={{
            filter: `drop-shadow(0 0 3px ${tone.glow})`,
          }}
        />
      </svg>

      {/* Glass reflection */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-4
          top-1.5
          h-3
          rounded-full
          bg-gradient-to-b
          from-white/[0.16]
          to-transparent
        "
      />

      <span
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          justify-center
        "
      >
        {children}
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Face                                                                       */
/* -------------------------------------------------------------------------- */

function Face({
  phase,
  prediction,
  remaining,
  outcome,
  isBroke,
}) {
  if (isBroke) {
    return (
      <>
        <RotateCcw
          aria-hidden="true"
          className="h-5 w-5 text-cyan-200"
          strokeWidth={2.6}
        />

        <span className={CAPTION}>
          Restart
        </span>
      </>
    )
  }

  if (phase === 'live') {
    const Arrow =
      prediction === 'up'
        ? ArrowUp
        : ArrowDown

    return (
      <>
        <span className="text-[24px] font-black leading-none tabular-nums text-cyan-100">
          {remaining}
        </span>

        {prediction && (
          <Arrow
            aria-hidden="true"
            className={`
              mt-0.5
              h-3.5
              w-3.5
              ${
                prediction === 'up'
                  ? 'text-emerald-300'
                  : 'text-rose-300'
              }
            `}
            strokeWidth={3}
          />
        )}
      </>
    )
  }

  if (phase === 'revealing') {
    return (
      <span
        className="
          text-[11px]
          font-black
          uppercase
          leading-none
          tracking-[0.12em]
          text-cyan-200
          motion-safe:animate-pulse
        "
      >
        Reveal
      </span>
    )
  }

  if (phase === 'result' && outcome) {
    const Icon =
      outcome.won ? Check : X

    return (
      <>
        <Icon
          aria-hidden="true"
          className={`
            h-6
            w-6
            ${
              outcome.won
                ? 'text-emerald-300'
                : 'text-rose-300'
            }
          `}
          strokeWidth={3.2}
        />

        <span className={CAPTION}>
          {outcome.won ? 'Win' : 'Miss'}
        </span>
      </>
    )
  }

  return (
    <>
      <RefreshCw
        aria-hidden="true"
        className="h-4 w-4 text-cyan-300"
        strokeWidth={2.6}
      />

      <span className="mt-0.5 text-[15px] font-black uppercase leading-none tracking-[0.12em] text-white">
        Spin
      </span>
    </>
  )
}

export default SpinButton