/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Bonus panel for Market Flux: the per-round multiplier table and the
 * completion bonus.
 */

import { Check } from 'lucide-react'

import {
  BONUS_MULTIPLIER,
  ROUND_CONFIG,
} from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

const HAS_BONUS = BONUS_MULTIPLIER > 0

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} [props.roundsPlayed] Rounds finished in this run, win or lose.
 * @param {number} [props.completedRounds] Rounds WON in this run.
 * @param {number} [props.stake] Current stake.
 * @returns {JSX.Element}
 */
function MultiplierLadder({
  round,
  roundsPlayed,
  completedRounds,
  stake,
}) {
  const played = roundsPlayed ?? round - 1

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
      className="relative pt-3"
    >
      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[440px]
          rounded-[18px]
          border
          border-cyan-400/40
          bg-gradient-to-b
          from-cyan-950/60
          via-black/85
          to-cyan-950/70
          px-3
          pb-3
          pt-4
          shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,191,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]
          backdrop-blur-xl
        "
      >
        {/* Top title tab matching reference image */}
        <div
          className="
            absolute
            left-1/2
            top-0
            -translate-x-1/2
            -translate-y-1/2
            whitespace-nowrap
            rounded-full
            border
            border-cyan-400/40
            bg-[#04101a]
            px-4
            py-0.5
            text-[10px]
            font-black
            uppercase
            tracking-[0.25em]
            text-cyan-200
            shadow-[0_0_10px_rgba(0,191,255,0.3)]
          "
        >
          Bonus{' '}
          {HAS_BONUS && (
            <span className="text-cyan-400">×{BONUS_MULTIPLIER}</span>
          )}
        </div>

        {/* Horizontal Multiplier Chain */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {ROUND_CONFIG.map((item, index) => {
            const isCurrent = item.round === round
            const isPlayed = item.round <= played
            const isUpcoming = item.round > played

            const currentAmount =
              isCurrent && stake !== undefined
                ? stake * item.multiplier
                : null

            return (
              <div key={item.round} className="flex items-center gap-1.5 flex-1">
                <div
                  className={`
                    relative
                    flex
                    flex-1
                    flex-col
                    items-center
                    rounded-xl
                    border
                    p-1.5
                    text-center
                    transition-all
                    ${
                      isCurrent
                        ? 'border-cyan-400/60 bg-cyan-950/70 shadow-[0_0_15px_rgba(0,191,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                        : isPlayed
                          ? 'border-white/10 bg-black/40 opacity-50'
                          : 'border-cyan-400/20 bg-black/50'
                    }
                  `}
                >
                  {/* Round Node Badge */}
                  <div
                    className={`
                      relative
                      grid
                      h-8
                      w-8
                      place-items-center
                      rounded-full
                      border
                      font-black
                      text-xs
                      shadow-md
                      ${
                        isCurrent
                          ? 'border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_10px_rgba(0,191,255,0.8)]'
                          : isPlayed
                            ? 'border-white/20 bg-white/10 text-white/60'
                            : 'border-cyan-400/30 bg-cyan-950/40 text-cyan-300'
                      }
                    `}
                  >
                    {isPlayed ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
                    ) : (
                      `×${item.multiplier}`
                    )}
                  </div>

                  <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-white/70">
                    Round {item.round}
                  </span>

                  <span className="text-[9px] font-bold tracking-tight text-cyan-300/80">
                    {currentAmount !== null ? formatMoney(currentAmount) : `×${item.multiplier}`}
                  </span>
                </div>

                {index < ROUND_CONFIG.length - 1 && (
                  <span className="text-cyan-400/40 text-xs font-black">→</span>
                )}
              </div>
            )
          })}

          {/* Bonus Node */}
          {HAS_BONUS && (
            <>
              <span className="text-cyan-400/40 text-xs font-black">→</span>
              <div
                className={`
                  relative
                  flex
                  flex-1
                  flex-col
                  items-center
                  rounded-xl
                  border
                  p-1.5
                  text-center
                  transition-all
                  ${
                    bonusAlive
                      ? 'border-amber-400/60 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                      : 'border-white/10 bg-black/40 opacity-40'
                  }
                `}
              >
                <div
                  className={`
                    relative
                    grid
                    h-8
                    w-8
                    place-items-center
                    rounded-full
                    border
                    font-black
                    text-xs
                    shadow-md
                    ${
                      bonusAlive
                        ? 'border-amber-300 bg-amber-400/30 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                        : 'border-white/20 bg-white/10 text-white/50'
                    }
                  `}
                >
                  ★
                </div>

                <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-amber-200/90">
                  Bonus
                </span>

                <span className="text-[9px] font-bold tracking-tight text-amber-300">
                  {bonusAmount === null
                    ? `×${BONUS_MULTIPLIER}`
                    : formatMoney(bonusAmount, { sign: true })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MultiplierLadder