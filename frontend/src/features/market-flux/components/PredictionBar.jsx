/**
 * @file src/features/market-flux/components/PredictionBar.jsx
 *
 * @description
 * Status bar under the play area: title/result line, price change since the
 * round opened, a countdown ring, round counter and stake.
 */

import { ArrowDown, ArrowUp } from 'lucide-react'
import { ROUND_MS, TOTAL_ROUNDS } from '../hooks/useMarketSimulation'

const RING_RADIUS = 15
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

const pad = (n) => String(n).padStart(2, '0')
const money = (n) => `R${Number(n).toLocaleString('en-US')}`

function getTitle({ phase, outcome }) {
  if (outcome) {
    if (outcome.bonus) {
      return {
        text: `Bonus hit! +${money(outcome.payout - outcome.stake + outcome.bonus)}`,
        tone: 'text-amber-300',
      }
    }
    if (outcome.won) {
      return {
        text: `Correct +${money(outcome.payout - outcome.stake)}`,
        tone: 'text-emerald-300',
      }
    }
    return { text: `Missed -${money(outcome.stake)}`, tone: 'text-rose-300' }
  }
  if (phase === 'live') return { text: 'Round live', tone: 'text-cyan-200' }
  return { text: 'Predict the next move', tone: 'text-cyan-300/80' }
}

/**
 * @param {object} props
 * @param {number} props.changePct Price change since round open, in percent.
 * @param {number} props.round Current round (1-based).
 * @param {number} props.stake Current stake.
 * @param {'idle'|'live'|'result'} props.phase
 * @param {'up'|'down'|null} props.prediction
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
  const rounded = Number(changePct.toFixed(2))
  const pctText = `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}%`
  const pctTone =
    rounded > 0 ? 'text-emerald-300' : rounded < 0 ? 'text-rose-300' : 'text-white'

  const progress = phase === 'live' ? Math.min(elapsed / ROUND_MS, 1) : 0
  const title = getTitle({ phase, outcome })
  const PredictionIcon = prediction === 'up' ? ArrowUp : ArrowDown

  return (
    <section
      aria-label="Round status"
      className="
        market-flux-glass
        relative
        mx-3
        overflow-hidden
        rounded-[18px]
        border
        border-cyan-400/30
        px-3
        pb-3
        pt-2
      "
    >
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/40" />
        <h2
          aria-live="polite"
          className={`text-[8px] font-bold uppercase tracking-[0.24em] ${title.tone}`}
        >
          {title.text}
        </h2>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/40" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Stat label="Market price" value={pctText} valueClassName={pctTone} align="left" />

        <div className="relative h-11 w-11 shrink-0">
          <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="rgba(2,8,20,0.8)"
              stroke="rgba(34,211,238,0.2)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="none"
              stroke="rgb(103,232,249)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-200 ease-linear"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center">
            {prediction ? (
              <PredictionIcon
                aria-hidden="true"
                className={`h-4 w-4 ${prediction === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}
                strokeWidth={3}
              />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/60" />
            )}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Stat label="Round" value={`${pad(round)}/${TOTAL_ROUNDS}`} align="center" />
          <Stat label="Stake" value={`R ${stake}`} valueClassName="text-cyan-300" align="center" />
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, valueClassName = 'text-white', align }) {
  const alignment = align === 'left' ? 'items-start' : 'items-center'
  return (
    <div className={`flex min-w-[52px] flex-col ${alignment}`}>
      <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <span
        className={`mt-1 text-[13px] font-black leading-none tabular-nums ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  )
}

export default PredictionBar
