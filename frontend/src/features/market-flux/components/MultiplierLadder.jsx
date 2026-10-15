/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Compact, connected mechanical multiplier rail for the one-screen mobile game.
 * All multipliers and round outcomes remain owned by the simulation hook.
 */

import { Check, Star } from 'lucide-react'
import { BONUS_MULTIPLIER, ROUND_CONFIG } from '../hooks/useMarketSimulation'

const HAS_BONUS = BONUS_MULTIPLIER > 0

function MultiplierNode({ multiplier, label, active, played, won, bonus, disabled }) {
  const color = bonus ? '#f3c66a' : active || won ? '#39ffb0' : '#6caac6'

  return (
    <div className={`relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 ${disabled ? 'opacity-40' : ''}`}>
      <div
        className="relative grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-[2px] bg-[radial-gradient(circle_at_45%_25%,#153c4d,#020a12_72%)] shadow-[inset_0_2px_5px_rgba(0,0,0,.9),0_2px_5px_rgba(0,0,0,.8)] min-[400px]:h-[38px] min-[400px]:w-[38px] sm:h-[46px] sm:w-[46px]"
        style={{ borderColor: color, boxShadow: `inset 0 2px 5px rgba(0,0,0,.9), 0 0 ${active || bonus ? '9px' : '3px'} ${color}55` }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[22%] top-[3px] h-[5px] rounded-full bg-white/15 blur-[2px]" />
        {played && won && !bonus ? (
          <Check aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={3} style={{ color }} />
        ) : (
          <span className="relative flex flex-col items-center justify-center font-black leading-none tracking-tight text-[13px] min-[400px]:text-[14px] sm:text-[17px]" style={{ color, textShadow: `0 0 7px ${color}77` }}>
            {bonus && <Star aria-hidden="true" className="mb-[1px] h-[9px] w-[9px] sm:h-[12px] sm:w-[12px]" fill="currentColor" />}
            ×{multiplier}
          </span>
        )}
      </div>
      <span className="max-w-full truncate whitespace-nowrap text-center text-[8px] font-extrabold uppercase leading-none tracking-[0.025em] min-[400px]:text-[9px] sm:text-[10px]" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

/**
 * @param {{round:number, roundsPlayed?:number, completedRounds?:number, stake?:number}} props
 */
function MultiplierLadder({ round, roundsPlayed, completedRounds }) {
  const played = roundsPlayed ?? round - 1
  const bonusAlive = completedRounds === undefined || completedRounds >= played

  const nodes = [
    ...ROUND_CONFIG.map((item) => ({
      id: `round-${item.round}`,
      round: item.round,
      multiplier: item.multiplier,
      label: `Round ${item.round}`,
      bonus: false,
    })),
    ...(HAS_BONUS ? [{ id: 'bonus', multiplier: BONUS_MULTIPLIER, label: 'Bonus', bonus: true }] : []),
  ]

  return (
    <section
      role="group"
      aria-label={HAS_BONUS ? `Round multipliers. Win all rounds for a ×${BONUS_MULTIPLIER} bonus.` : 'Round multipliers'}
      className="relative mx-auto w-full max-w-[860px] min-w-0"
    >
      <div
        className="relative isolate h-[65px] overflow-hidden border border-cyan-300/35 bg-[linear-gradient(180deg,rgba(10,47,66,.86),rgba(0,9,18,.94)_36%,rgba(2,21,33,.94))] px-2 pt-[7px] shadow-[inset_0_1px_1px_rgba(180,240,255,.35),inset_0_-2px_5px_rgba(0,0,0,.85)] min-[400px]:h-[69px] sm:h-[84px] sm:px-4 sm:pt-[9px]"
        style={{ clipPath: 'polygon(3% 0,97% 0,100% 16%,100% 84%,97% 100%,3% 100%,0 84%,0 16%)' }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[12%] right-[12%] top-[24px] h-[4px] rounded-full bg-[#01070d] shadow-[inset_0_1px_2px_#000,0_0_5px_rgba(0,180,255,.25)] min-[400px]:top-[26px] sm:top-[32px]">
          <div className="absolute inset-x-0 top-[1px] h-[2px] bg-gradient-to-r from-emerald-400/75 via-cyan-400/75 to-amber-400/75" />
        </div>
        <div className="relative flex w-full items-start justify-between gap-1">
          {nodes.map((node) => {
            const active = !node.bonus && node.round === round
            const isPlayed = !node.bonus && node.round <= played
            const won = isPlayed && completedRounds !== undefined && completedRounds >= node.round
            return (
              <div key={node.id} className="relative flex min-w-0 flex-1 justify-center" aria-current={active ? 'step' : undefined}>
                <MultiplierNode
                  multiplier={node.multiplier}
                  label={node.label}
                  active={active}
                  played={isPlayed}
                  won={won}
                  bonus={node.bonus}
                  disabled={node.bonus && !bonusAlive}
                />
              </div>
            )
          })}
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[22%] bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      </div>
    </section>
  )
}

export default MultiplierLadder
