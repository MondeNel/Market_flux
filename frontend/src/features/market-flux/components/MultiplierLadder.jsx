/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Centre column, matched to the Wave-Ride reference.
 *
 * - BonusBadge: layered gold glass hexagon with side flares, crown and
 *   "BONUS R 1,000". Rendered by the screen above the ladder.
 * - MultiplierLadder: a tall glass capsule with neon blue side edges and a
 *   light beam at the bottom. Inside, a centre line (gold above the next
 *   target, blue from it downwards) runs through six steps. Each step is a
 *   number tile overlapping a wider multiplier tile, joined by small rings.
 *
 * Step states:
 * - upcoming: gold outline (above the target)
 * - target:   neon blue with lens flares (the step a correct call lands on)
 * - reached:  dim steel blue (steps already cleared, and the base step 0)
 */

import { useId } from 'react'
import { Crown } from 'lucide-react'

import { BONUS_AMOUNT, MULTIPLIERS, TOP_STEP } from '../hooks/useMarketSimulation'

// Rendered top (highest) to bottom (0).
const STEPS = Array.from({ length: MULTIPLIERS.length }, (_, i) => TOP_STEP - i)

const ROW_HEIGHT = 34 // px, one step row

// useId contains colons, which are awkward inside url(#...).
const useSafeId = (prefix) => `${prefix}-${useId().replace(/:/g, '')}`

/* ---------------------------------------------------------------------------
 * Bonus badge
 * ------------------------------------------------------------------------ */

// Hexagon with pointed sides, in a 120 x 88 box. Two larger copies sit behind
// it, which gives the stacked-glass look of the reference.
const BONUS_MAIN = 'M6 44 L28 10 L92 10 L114 44 L92 78 L28 78 Z'
const BONUS_INNER = 'M12 44 L31 15 L89 15 L108 44 L89 73 L31 73 Z'
const BONUS_HALO_1 = 'M2 44 L26 6 L94 6 L118 44 L94 82 L26 82 Z'
const BONUS_HALO_2 = 'M0 44 L22 2 L98 2 L120 44 L98 86 L22 86 Z'

/**
 * Gold bonus badge. Rendered by the screen above the ladder column.
 *
 * @param {object} props
 * @param {boolean} props.reached Whether the top step has just been cleared.
 * @returns {JSX.Element}
 */
export function BonusBadge({ reached }) {
  const id = useSafeId('mf-bonus')

  return (
    <div
      className={`
        relative
        w-full
        transition-[filter]
        duration-300
        ${
          reached
            ? '[filter:drop-shadow(0_0_16px_rgba(255,190,70,0.95))]'
            : '[filter:drop-shadow(0_0_8px_rgba(255,170,50,0.5))]'
        }
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 120 88"
        className="block w-full overflow-visible"
      >
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe3a0" />
            <stop offset="0.5" stopColor="#e7a437" />
            <stop offset="1" stopColor="#ffd98a" />
          </linearGradient>
          <radialGradient id={`${id}-fill`} cx="0.5" cy="0.45" r="0.65">
            <stop offset="0" stopColor="#8a4510" stopOpacity="0.7" />
            <stop offset="1" stopColor="#2a1204" stopOpacity="0.82" />
          </radialGradient>
          <radialGradient id={`${id}-tip`}>
            <stop offset="0" stopColor="#ffb347" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#ff8a1f" stopOpacity="0.3" />
            <stop offset="1" stopColor="#ff8a1f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff2cf" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#fff2cf" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <path d={BONUS_MAIN} />
          </clipPath>
        </defs>

        {/* Stacked outlines behind */}
        <path d={BONUS_HALO_2} fill="none" stroke="#e7a437" strokeOpacity="0.28" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={BONUS_HALO_1} fill="none" stroke="#ffd27a" strokeOpacity="0.5" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* Glass body */}
        <path d={BONUS_MAIN} fill={`url(#${id}-fill)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <circle cx="8" cy="44" r="28" fill={`url(#${id}-tip)`} />
          <circle cx="112" cy="44" r="28" fill={`url(#${id}-tip)`} />
          <rect x="0" y="0" width="120" height="44" fill={`url(#${id}-sheen)`} />
        </g>

        {/* Rim */}
        <path d={BONUS_INNER} fill="none" stroke="#ffd27a" strokeOpacity="0.35" strokeWidth="0.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={BONUS_MAIN} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* Lens flares on the side points */}
        <ellipse cx="6" cy="44" rx="14" ry="2.2" fill="#ffd9a0" opacity="0.75" />
        <ellipse cx="114" cy="44" rx="14" ry="2.2" fill="#ffd9a0" opacity="0.75" />
        <circle cx="6" cy="44" r="2.4" fill="#fff7e0" />
        <circle cx="114" cy="44" r="2.4" fill="#fff7e0" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5 leading-none">
        <Crown
          aria-hidden="true"
          className="h-[15px] w-[15px] fill-current text-[#f6e2a6] drop-shadow-[0_0_5px_rgba(255,190,80,0.8)]"
          strokeWidth={1.5}
        />
        <span className="mt-1 text-[clamp(7px,2.1vw,9px)] font-bold uppercase tracking-[0.08em] text-[#f3dfae]">
          Bonus
        </span>
        <span className="mt-0.5 text-[clamp(14px,4.4vw,18px)] font-black tracking-tight text-[#fff4d6] drop-shadow-[0_0_6px_rgba(255,180,70,0.7)]">
          R {BONUS_AMOUNT.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Ladder
 * ------------------------------------------------------------------------ */

// Capsule outline in a 104 x 300 box: small cuts on top, larger at the bottom.
const CAPSULE = 'M10 0.8 H94 L103.2 10 V284 L89 299.2 H15 L0.8 284 V10 Z'
const CAPSULE_INNER = 'M12 5 H92 L99 12 V282 L86 295 H18 L5 282 V12 Z'

/**
 * @param {object} props
 * @param {number} props.step Current streak step (0 to TOP_STEP).
 * @returns {JSX.Element}
 */
function MultiplierLadder({ step }) {
  const id = useSafeId('mf-ladder')
  const target = step < TOP_STEP ? step + 1 : null
  const targetIndex = target === null ? -1 : STEPS.indexOf(target)

  // Where the centre line turns from gold to blue: the target row's centre.
  const lastIndex = STEPS.length - 1
  const split =
    targetIndex < 0
      ? '100%'
      : `calc(${ROW_HEIGHT / 2}px + ${targetIndex} * (100% - ${ROW_HEIGHT}px) / ${lastIndex})`

  const items = []
  STEPS.forEach((n, index) => {
    const state = n === target ? 'target' : n < (target ?? TOP_STEP + 1) ? 'reached' : 'upcoming'
    items.push(<LadderStep key={`step-${n}`} n={n} state={state} />)
    if (index < lastIndex) {
      // A ring joins each step to the next: gold above the target, blue below.
      const aboveTarget = targetIndex < 0 || index < targetIndex
      items.push(<Ring key={`ring-${n}`} gold={aboveTarget} />)
    }
  })

  return (
    <div className="relative h-full w-full">
      {/* Glass capsule */}
      <svg
        aria-hidden="true"
        viewBox="0 0 104 300"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible [filter:drop-shadow(0_0_8px_rgba(40,150,255,0.45))]"
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a2a52" stopOpacity="0.4" />
            <stop offset="1" stopColor="#020a18" stopOpacity="0.5" />
          </linearGradient>
          {/* Bright on the left and right edges, quiet in the middle */}
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4cc4ff" />
            <stop offset="0.18" stopColor="#2a8fe0" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#1d5fa8" stopOpacity="0.35" />
            <stop offset="0.82" stopColor="#2a8fe0" stopOpacity="0.7" />
            <stop offset="1" stopColor="#4cc4ff" />
          </linearGradient>
          <filter id={`${id}-soft`} x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>

        <path d={CAPSULE} fill={`url(#${id}-fill)`} />
        <path d={CAPSULE} fill="none" stroke="#38a8ff" strokeOpacity="0.55" strokeWidth="4" filter={`url(#${id}-soft)`} />
        <path d={CAPSULE_INNER} fill="none" stroke="#38a8ff" strokeOpacity="0.22" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d={CAPSULE} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* Bright bottom edge */}
        <path d="M15 299.2 H89" fill="none" stroke="#9ceeff" strokeOpacity="0.95" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Light beam under the capsule */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full h-9 w-[2px] -translate-x-1/2 bg-gradient-to-b from-cyan-200 via-cyan-400/60 to-transparent shadow-[0_0_10px_rgba(80,210,255,0.9)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 left-1/2 h-5 w-24 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(120,230,255,0.6),transparent_70%)]"
      />

      {/* Centre line: gold down to the target, blue from there */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
        style={{
          background: `linear-gradient(to bottom, rgba(255,214,130,0.95) 0, rgba(255,200,110,0.95) calc(${split} - 6px), rgba(90,205,255,0.95) calc(${split} + 6px), rgba(70,170,255,0.9) 100%)`,
          boxShadow: '0 0 8px rgba(120,200,255,0.55)',
        }}
      />

      <ol
        aria-label="Multiplier ladder"
        className="relative flex h-full flex-col justify-between py-[18px]"
      >
        {items}
      </ol>
    </div>
  )
}

/** Small ring on the centre line, between two steps. */
function Ring({ gold }) {
  return (
    <li
      aria-hidden="true"
      className="flex shrink-0 justify-center"
    >
      <span
        className={`h-[7px] w-[7px] rounded-full border bg-[#02060c]/80 ${
          gold
            ? 'border-amber-300 shadow-[0_0_6px_rgba(255,200,100,0.8)]'
            : 'border-cyan-200 shadow-[0_0_6px_rgba(110,220,255,0.8)]'
        }`}
      />
    </li>
  )
}

const TILE_STATES = {
  upcoming: {
    stroke: '#e2a94a',
    numberStroke: 0.95,
    multiplierStroke: 0.55,
    fill: 'rgba(10,14,26,0.55)',
    numberText: 'text-white',
    multiplierText: 'text-white/90',
    glow: '[filter:drop-shadow(0_0_3px_rgba(233,178,76,0.5))]',
  },
  target: {
    stroke: '#6fe3ff',
    numberStroke: 1,
    multiplierStroke: 0.7,
    fill: 'rgba(20,90,170,0.38)',
    numberText: 'text-white',
    multiplierText: 'text-cyan-100',
    glow: '[filter:drop-shadow(0_0_6px_rgba(60,190,255,0.95))]',
  },
  reached: {
    stroke: '#7f9bbd',
    numberStroke: 0.7,
    multiplierStroke: 0.4,
    fill: 'rgba(10,18,32,0.55)',
    numberText: 'text-[#cfe6ff]',
    multiplierText: 'text-slate-300',
    glow: '',
  },
}

/** Octagon-style tile outline in a 40 x 34 box. */
const TILE = 'M9 0.8 H31 L39.2 9 V25 L31 33.2 H9 L0.8 25 V9 Z'

function Tile({ state, kind, className, children }) {
  const style = TILE_STATES[state]
  const isNumber = kind === 'number'

  return (
    <span className={`absolute ${className} ${style.glow}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 40 34"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          d={TILE}
          // The number tile sits in front, so it is nearly opaque.
          fill={isNumber ? 'rgba(5,9,18,0.82)' : style.fill}
          stroke={style.stroke}
          strokeOpacity={isNumber ? style.numberStroke : style.multiplierStroke}
          strokeWidth={state === 'target' ? 1.7 : 1.2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {isNumber && state === 'target' && (
          <path d={TILE} fill={style.fill} />
        )}
      </svg>
      <span className="relative grid h-full place-items-center">{children}</span>
    </span>
  )
}

function LadderStep({ n, state }) {
  const style = TILE_STATES[state]

  return (
    <li
      aria-current={state === 'target' ? 'step' : undefined}
      className="relative shrink-0"
      style={{ height: ROW_HEIGHT }}
    >
      {/* Lens flares on the target */}
      {state === 'target' && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[3px] w-[170%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(150,235,255,0.95)_0%,rgba(40,150,255,0.55)_35%,transparent_70%)] blur-[1px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-24 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(60,170,255,0.4),transparent_70%)]"
          />
        </>
      )}

      {/* Multiplier tile, behind */}
      <Tile
        state={state}
        kind="multiplier"
        className="left-1/2 top-[2px] h-[30px] w-[42px]"
      >
        <span className={`pl-3 text-[10px] font-extrabold tabular-nums ${style.multiplierText}`}>
          ×{MULTIPLIERS[n]}
        </span>
      </Tile>

      {/* Number tile, in front */}
      <Tile
        state={state}
        kind="number"
        className="left-[calc(50%-24px)] top-0 h-[34px] w-[38px]"
      >
        <span className={`text-[19px] font-black tabular-nums ${style.numberText}`}>
          {n}
        </span>
      </Tile>
    </li>
  )
}

export default MultiplierLadder