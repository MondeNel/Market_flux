
/**
 * @file src/features/market-flux/components/RoundInfoPanel.jsx
 *
 * @description
 * Compact mechanical round-progress rail for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Reference-inspired angular glass housing
 * - Cyan metallic frame with recessed dark interior
 * - Round counter on the left
 * - Three illuminated progression indicators
 * - LIVE indicator on the right
 * - Mobile-first dimensions
 *
 * The current stake is still available through the stake
 * controller, so it is not repeated in this status rail.
 *
 * GAME LOGIC
 * ---------------------------------------------------------------------------
 * - Uses TOTAL_ROUNDS from the simulation engine
 * - Supports roundsPlayed for completed progress
 * - Does not modify game state
 */

import { TOTAL_ROUNDS } from '../hooks/useMarketSimulation'

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DOT_STATES = {
  current: {
    outer:
      'border-cyan-200 bg-cyan-400/25 shadow-[0_0_10px_rgba(0,220,255,0.75)]',
    inner:
      'bg-cyan-300 shadow-[0_0_7px_rgba(0,240,255,1)]',
  },

  played: {
    outer:
      'border-emerald-300/70 bg-emerald-400/20 shadow-[0_0_6px_rgba(0,255,170,0.35)]',
    inner: 'bg-emerald-300',
  },

  upcoming: {
    outer:
      'border-sky-400/65 bg-[#021725] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]',
    inner: 'bg-transparent',
  },
}

/* -------------------------------------------------------------------------- */
/* Progress indicator                                                         */
/* -------------------------------------------------------------------------- */

function ProgressDot({ state }) {
  const tone = DOT_STATES[state]

  return (
    <span
      aria-hidden="true"
      className={`
        relative z-10 grid shrink-0 place-items-center
        h-[clamp(12px,3.6vw,22px)]
        w-[clamp(12px,3.6vw,22px)]
        rounded-full border
        transition-all duration-300
        ${tone.outer}
      `}
    >
      <span
        className={`
          h-[55%] w-[55%] rounded-full
          transition-all duration-300
          ${tone.inner}
        `}
      />

      {state === 'current' && (
        <span
          className="
            pointer-events-none absolute -inset-[3px]
            rounded-full border border-cyan-300/25
          "
        />
      )}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} [props.roundsPlayed] Rounds finished.
 * @param {number} props.stake Current stake (kept for API compatibility).
 * @returns {JSX.Element}
 */
function RoundInfoPanel({
  round,
  roundsPlayed,
  stake: _stake,
}) {
  const played = Math.max(
    0,
    Math.min(
      roundsPlayed ?? round - 1,
      TOTAL_ROUNDS,
    ),
  )

  const currentRound = Math.max(
    1,
    Math.min(round, TOTAL_ROUNDS),
  )

  const progress =
    TOTAL_ROUNDS > 0
      ? (played / TOTAL_ROUNDS) * 100
      : 0

  return (
    <div
      role="group"
      aria-label={`Round ${currentRound} of ${TOTAL_ROUNDS}. ${played} rounds completed.`}
      className="
        relative mx-auto w-full
        max-w-[900px]
        px-[2px]
      "
    >
      {/* Outer mechanical frame */}
      <div
        className="
          relative isolate flex
          h-[clamp(43px,7vw,62px)]
          w-full items-center
          overflow-hidden
          border border-cyan-400/65
          bg-[linear-gradient(180deg,rgba(12,75,104,0.9)_0%,rgba(0,13,25,0.95)_30%,rgba(0,8,17,0.97)_70%,rgba(0,71,103,0.85)_100%)]
          px-[clamp(10px,3vw,28px)]
          shadow-[0_6px_16px_rgba(0,0,0,0.75),0_0_12px_rgba(0,191,255,0.3),inset_0_1px_2px_rgba(190,245,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.9)]
          backdrop-blur-xl
        "
        style={{
          clipPath:
            'polygon(4% 0,96% 0,100% 28%,100% 72%,96% 100%,4% 100%,0 72%,0 28%)',
        }}
      >
        {/* Upper specular rail */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-[8%] right-[8%] top-0
            h-[2px]
            bg-gradient-to-r
            from-transparent via-cyan-200 to-transparent
            shadow-[0_0_8px_rgba(0,220,255,0.8)]
          "
        />

        {/* Recessed inner glass */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-[4px]
            border border-cyan-300/10
            bg-[linear-gradient(180deg,rgba(0,180,255,0.06),transparent_55%,rgba(0,160,255,0.04))]
          "
          style={{
            clipPath:
              'polygon(4% 0,96% 0,100% 28%,100% 72%,96% 100%,4% 100%,0 72%,0 28%)',
          }}
        />

        {/* LEFT: Round counter */}
        <div className="relative z-10 flex min-w-0 flex-[1.1] items-center">
          <span
            className="
              whitespace-nowrap
              text-[clamp(11px,2.8vw,20px)]
              font-black uppercase
              tracking-[0.025em]
              text-[#a7ddff]
              drop-shadow-[0_0_7px_rgba(0,180,255,0.4)]
            "
          >
            Round {currentRound} / {TOTAL_ROUNDS}
          </span>
        </div>

        {/* CENTER: Round progression */}
        <div
          role="img"
          aria-label={`${played} of ${TOTAL_ROUNDS} rounds completed`}
          className="
            relative z-10
            flex flex-[1.2] items-center
            justify-center
            gap-[clamp(9px,3vw,34px)]
          "
        >
          {Array.from(
            { length: TOTAL_ROUNDS },
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

          {/* Progress rail below the nodes */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              bottom-[-7px] left-[12%] right-[12%]
              h-[3px] overflow-hidden rounded-full
              bg-cyan-900/70
              shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]
            "
          >
            <div
              className="
                h-full rounded-full
                bg-gradient-to-r
                from-cyan-400 to-emerald-300
                shadow-[0_0_7px_rgba(0,240,255,0.8)]
                transition-[width] duration-500
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* RIGHT: Live indicator */}
        <div
          className="
            relative z-10 flex
            min-w-0 flex-1 items-center
            justify-end gap-[clamp(4px,1.5vw,10px)]
          "
        >
          <span
            aria-hidden="true"
            className="
              h-[clamp(7px,2vw,12px)]
              w-[clamp(7px,2vw,12px)]
              shrink-0 rounded-full
              bg-emerald-400
              shadow-[0_0_9px_rgba(0,255,160,0.9)]
            "
          />

          <span
            className="
              text-[clamp(11px,3vw,20px)]
              font-black uppercase
              tracking-[0.04em]
              text-emerald-300
              drop-shadow-[0_0_8px_rgba(0,255,160,0.4)]
            "
          >
            Live
          </span>
        </div>

        {/* Bottom structural reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-0 left-[10%] right-[10%]
            h-[2px]
            bg-gradient-to-r
            from-transparent via-cyan-400/80 to-transparent
            shadow-[0_0_8px_rgba(0,191,255,0.7)]
          "
        />
      </div>
    </div>
  )
}

export default RoundInfoPanel
