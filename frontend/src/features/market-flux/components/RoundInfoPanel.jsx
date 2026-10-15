/**
 * @file src/features/market-flux/components/RoundInfoPanel.jsx
 *
 * @description
 * Compact single-screen round progress rail for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Single angular metallic liquid-glass housing
 * - 34px high on compact mobile screens
 * - Round counter on the left
 * - Three illuminated progression indicators
 * - LIVE indicator on the right
 * - No duplicated outer console
 *
 * GAME LOGIC
 * ---------------------------------------------------------------------------
 * - TOTAL_ROUNDS comes from the simulation engine
 * - roundsPlayed determines completed progress
 * - stake retained for API compatibility
 * - No game-state mutations
 */

import { TOTAL_ROUNDS } from '../hooks/useMarketSimulation'

const DOT_STATES = {
  current: {
    outer:
      'border-cyan-100/90 bg-cyan-400/25 shadow-[0_0_7px_rgba(0,220,255,0.7)]',
    inner:
      'bg-cyan-200 shadow-[0_0_6px_rgba(0,240,255,0.9)]',
  },

  played: {
    outer:
      'border-emerald-300/70 bg-emerald-400/20',
    inner:
      'bg-emerald-300 shadow-[0_0_5px_rgba(0,255,170,0.5)]',
  },

  upcoming: {
    outer:
      'border-sky-400/40 bg-[#02121d]',
    inner:
      'bg-transparent',
  },
}

function ProgressDot({ state }) {
  const tone = DOT_STATES[state]

  return (
    <span
      aria-hidden="true"
      className={`
        relative z-10 grid
        h-[11px] w-[11px]
        shrink-0 place-items-center
        rounded-full border
        sm:h-[14px] sm:w-[14px]
        transition-all duration-300
        ${tone.outer}
      `}
    >
      <span
        className={`
          h-[5px] w-[5px]
          rounded-full
          sm:h-[7px] sm:w-[7px]
          ${tone.inner}
        `}
      />

      {state === 'current' && (
        <span
          className="
            pointer-events-none absolute
            -inset-[2px] rounded-full
            border border-cyan-300/20
          "
        />
      )}
    </span>
  )
}

/**
 * @param {object} props
 * @param {number} props.round Current round (1-based).
 * @param {number} [props.roundsPlayed] Finished rounds.
 * @param {number} props.stake Retained for API compatibility.
 */
function RoundInfoPanel({
  round,
  roundsPlayed,
  stake: _stake,
}) {
  const totalRounds = Math.max(1, TOTAL_ROUNDS)

  const currentRound = Math.max(
    1,
    Math.min(round, totalRounds),
  )

  const played = Math.max(
    0,
    Math.min(
      roundsPlayed ?? currentRound - 1,
      totalRounds,
    ),
  )

  const progress = (played / totalRounds) * 100

  return (
    <div
      role="group"
      aria-label={`Round ${currentRound} of ${totalRounds}. ${played} rounds completed.`}
      className="
        relative mx-auto
        h-[34px] w-full
        max-w-[900px]
        sm:h-[42px]
      "
    >
      {/* Single angular machine housing */}
      <div
        className="
          relative isolate
          flex h-full w-full
          items-center
          overflow-hidden
          border border-cyan-300/50
          bg-[linear-gradient(180deg,rgba(9,56,79,0.88)_0%,rgba(0,13,24,0.95)_35%,rgba(0,7,15,0.97)_70%,rgba(4,48,69,0.88)_100%)]
          px-3
          sm:px-5
          shadow-[0_4px_10px_rgba(0,0,0,0.75),inset_0_1px_2px_rgba(190,245,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.85)]
          backdrop-blur-md
        "
        style={{
          clipPath:
            'polygon(3% 0,97% 0,100% 30%,100% 70%,97% 100%,3% 100%,0 70%,0 30%)',
        }}
      >
        {/* Top chrome highlight */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-x-[12%] top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-100/80
            to-transparent
          "
        />

        {/* Round counter */}
        <div className="relative z-10 flex min-w-0 flex-1 items-center">
          <span
            className="
              whitespace-nowrap
              text-[10px] font-black
              uppercase tracking-[0.025em]
              text-[#b8e9ff]
              sm:text-[13px]
            "
          >
            Round {currentRound}/{totalRounds}
          </span>
        </div>

        {/* Progress indicators */}
        <div
          role="img"
          aria-label={`${played} of ${totalRounds} rounds completed`}
          className="
            relative z-10
            flex flex-1
            items-center justify-center
            gap-3 sm:gap-5
          "
        >
          {Array.from(
            { length: totalRounds },
            (_, index) => {
              const state =
                index < played
                  ? 'played'
                  : index === currentRound - 1
                    ? 'current'
                    : 'upcoming'

              return (
                <ProgressDot
                  key={index}
                  state={state}
                />
              )
            },
          )}

          {/* Thin progression track */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute
              bottom-[-5px]
              left-[16%] right-[16%]
              h-[2px] overflow-hidden
              rounded-full bg-cyan-900/60
            "
          >
            <span
              className="
                block h-full
                bg-gradient-to-r
                from-cyan-400 to-emerald-300
                transition-[width] duration-500
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </span>
        </div>

        {/* LIVE indicator */}
        <div
          className="
            relative z-10 flex
            min-w-0 flex-1
            items-center justify-end
            gap-1.5
          "
        >
          <span
            aria-hidden="true"
            className="
              h-[6px] w-[6px]
              shrink-0 rounded-full
              bg-[#39FF88]
              shadow-[0_0_6px_rgba(57,255,136,0.8)]
              sm:h-[8px] sm:w-[8px]
            "
          />

          <span
            className="
              text-[10px] font-black
              uppercase tracking-[0.04em]
              text-[#39FF88]
              sm:text-[13px]
            "
          >
            Live
          </span>
        </div>

        {/* Bottom chrome highlight */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-x-[16%] bottom-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-300/50
            to-transparent
          "
        />
      </div>
    </div>
  )
}

export default RoundInfoPanel