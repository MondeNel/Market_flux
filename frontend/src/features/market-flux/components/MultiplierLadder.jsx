/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Centre column: gold bonus crown above a vertical ladder of hexagon steps.
 *
 * Step states:
 * - reached: step <= current streak (dim cyan)
 * - target:  the step a correct call lands on next (bright, glowing)
 * - locked:  everything above the target
 */

import { Crown } from 'lucide-react'
import { BONUS_AMOUNT, MULTIPLIERS, TOP_STEP } from '../hooks/useMarketSimulation'

const HEX = 'polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%)'
const OCTAGON =
  'polygon(28% 0%, 72% 0%, 100% 30%, 100% 70%, 72% 100%, 28% 100%, 0% 70%, 0% 30%)'

// Rendered top (highest) to bottom (0).
const STEPS = Array.from({ length: MULTIPLIERS.length }, (_, i) => TOP_STEP - i)

/**
 * @param {object} props
 * @param {number} props.step Current streak step (0 to TOP_STEP).
 * @returns {JSX.Element}
 */
function MultiplierLadder({ step }) {
  const target = step < TOP_STEP ? step + 1 : null

  return (
    <ol
      aria-label="Multiplier ladder"
      className="relative flex h-full flex-col items-stretch justify-between"
    >
      {/* Vertical energy line */}
      <span
        aria-hidden="true"
        className="
          absolute
          inset-y-2
          left-1/2
          w-px
          -translate-x-1/2
          bg-gradient-to-b
          from-amber-300/70
          via-cyan-400/70
          to-cyan-400/20
          shadow-[0_0_8px_rgba(34,211,238,0.8)]
        "
      />

      {STEPS.map((n) => {
        const state = n === target ? 'target' : n <= step ? 'reached' : 'locked'
        return <LadderStep key={n} n={n} state={state} />
      })}
    </ol>
  )
}

/**
 * Gold bonus badge. Rendered by the screen above the ladder column.
 *
 * @param {object} props
 * @param {boolean} props.reached Whether the top step has just been cleared.
 * @returns {JSX.Element}
 */
export function BonusBadge({ reached }) {
  return (
    <div
      className={`
        relative
        transition-[filter]
        duration-300
        ${
          reached
            ? 'drop-shadow-[0_0_18px_rgba(251,191,36,1)]'
            : 'drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]'
        }
      `}
    >
      {/* Connector down to the ladder */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-full h-2 w-px -translate-x-1/2 bg-amber-300/70"
      />
      <div
        style={{ clipPath: OCTAGON }}
        className="bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 p-[2px]"
      >
        <div
          style={{ clipPath: OCTAGON }}
          className="
            flex
            h-[66px]
            w-[100px]
            flex-col
            items-center
            justify-center
            bg-[radial-gradient(circle_at_50%_30%,rgba(120,53,15,0.9),rgba(28,13,2,0.97))]
          "
        >
          <Crown
            aria-hidden="true"
            className="h-4 w-4 text-amber-300"
            strokeWidth={2.5}
          />
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
            Bonus
          </span>
          <span className="text-[14px] font-black leading-none text-amber-300">
            R {BONUS_AMOUNT.toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </div>
  )
}

const STEP_STYLES = {
  target: {
    ring: 'from-cyan-200 via-cyan-400 to-blue-500',
    fill: 'bg-[radial-gradient(circle,rgba(8,145,178,0.75),rgba(3,20,40,0.95))]',
    text: 'text-white',
    glow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]',
    label: 'text-cyan-200',
  },
  reached: {
    ring: 'from-cyan-400/70 to-blue-600/70',
    fill: 'bg-[radial-gradient(circle,rgba(8,80,110,0.55),rgba(3,14,30,0.96))]',
    text: 'text-cyan-200',
    glow: 'drop-shadow-[0_0_4px_rgba(34,211,238,0.45)]',
    label: 'text-cyan-200',
  },
  locked: {
    ring: 'from-cyan-500/55 to-blue-700/55',
    fill: 'bg-slate-950/95',
    text: 'text-slate-200',
    glow: 'drop-shadow-[0_0_3px_rgba(34,211,238,0.3)]',
    label: 'text-slate-300',
  },
}

function LadderStep({ n, state }) {
  const style = STEP_STYLES[state]

  return (
    <li
      aria-current={state === 'target' ? 'step' : undefined}
      className="relative grid grid-cols-[1fr_auto_1fr] items-center"
    >
      <span />

      <div className={`transition-[filter] duration-300 ${style.glow}`}>
        <div
          style={{ clipPath: HEX }}
          className={`bg-gradient-to-b p-[2px] ${style.ring}`}
        >
          <div
            style={{ clipPath: HEX }}
            className={`grid h-[42px] w-[48px] place-items-center ${style.fill}`}
          >
            <span className={`text-[19px] font-black tabular-nums ${style.text}`}>
              {n}
            </span>
          </div>
        </div>
      </div>

      <span
        className={`
          justify-self-start
          pl-1.5
          text-[10px]
          font-bold
          tabular-nums
          ${style.label}
        `}
      >
        x{MULTIPLIERS[n]}
      </span>
    </li>
  )
}

export default MultiplierLadder