/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Market Flux multiplier ladder.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * The ladder is built around the three-round progression:
 *
 *   ×1  →  ×3  →  ×6  →  ×8
 *
 * The ×1 step is the starting/base position. Each successful prediction
 * advances the player to the next multiplier.
 *
 * Visual language:
 * - Floating liquid-glass ladder
 * - Dark mechanical depth
 * - Neon-blue structural lighting
 * - Gold progression beam above the active target
 * - Blue progression beam below the active target
 * - Large central step numbers
 * - Multiplier tiles offset behind the number tiles
 * - Target step receives the strongest illumination
 * - Bonus badge sits above the ladder
 *
 * The component deliberately derives its steps from MULTIPLIERS so the
 * simulation remains the single source of truth for the ladder values.
 */

import { useId } from 'react'
import { Crown } from 'lucide-react'

import {
  BONUS_AMOUNT,
  MULTIPLIERS,
  TOP_STEP,
} from '../hooks/useMarketSimulation'

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------ */

const STEPS = Array.from(
  { length: MULTIPLIERS.length },
  (_, index) => TOP_STEP - index,
)

/*
 * Four steps need more breathing room than the previous six-step ladder.
 * The row itself remains compact while the flex container distributes the
 * available vertical space.
 */
const ROW_HEIGHT = 42

/*
 * The ladder uses a slightly wider SVG coordinate system than the previous
 * version to give the glass structure more physical presence.
 */
const LADDER_VIEWBOX_WIDTH = 124
const LADDER_VIEWBOX_HEIGHT = 300

const useSafeId = (prefix) =>
  `${prefix}-${useId().replace(/:/g, '')}`

/* ---------------------------------------------------------------------------
 * Bonus badge geometry
 * ------------------------------------------------------------------------ */

const BONUS_MAIN =
  'M6 44 L27 10 L93 10 L118 44 L93 78 L27 78 Z'

const BONUS_INNER =
  'M13 44 L31 15 L89 15 L111 44 L89 73 L31 73 Z'

const BONUS_HALO_1 =
  'M2 44 L24 6 L96 6 L122 44 L96 82 L24 82 Z'

const BONUS_HALO_2 =
  'M0 44 L20 2 L100 2 L124 44 L100 86 L20 86 Z'

/* ---------------------------------------------------------------------------
 * Bonus badge
 * ------------------------------------------------------------------------ */

/**
 * Bonus badge displayed above the multiplier ladder.
 *
 * @param {object} props
 * @param {boolean} props.reached Whether the maximum multiplier has been
 * reached.
 * @returns {JSX.Element}
 */
export function BonusBadge({ reached }) {
  const id = useSafeId('mf-bonus')

  return (
    <div
      className={`
        relative
        w-full
        transition-[filter,transform]
        duration-300
        ${reached ? 'scale-[1.03]' : ''}
        ${
          reached
            ? '[filter:drop-shadow(0_0_18px_rgba(255,190,70,0.95))]'
            : '[filter:drop-shadow(0_0_9px_rgba(255,170,50,0.48))]'
        }
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 124 88"
        className="block w-full overflow-visible"
      >
        <defs>
          {/* Gold outer frame */}
          <linearGradient
            id={`${id}-gold`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0" stopColor="#fff0bd" />
            <stop offset="0.28" stopColor="#e4a33b" />
            <stop offset="0.55" stopColor="#ffd77d" />
            <stop offset="1" stopColor="#c77d1e" />
          </linearGradient>

          {/* Deep glass body */}
          <radialGradient
            id={`${id}-fill`}
            cx="0.5"
            cy="0.42"
            r="0.7"
          >
            <stop
              offset="0"
              stopColor="#a65a16"
              stopOpacity="0.62"
            />
            <stop
              offset="0.52"
              stopColor="#4a2108"
              stopOpacity="0.76"
            />
            <stop
              offset="1"
              stopColor="#170903"
              stopOpacity="0.9"
            />
          </radialGradient>

          {/* Side flare */}
          <radialGradient id={`${id}-flare`}>
            <stop
              offset="0"
              stopColor="#fff0bd"
              stopOpacity="0.95"
            />
            <stop
              offset="0.32"
              stopColor="#ffb347"
              stopOpacity="0.62"
            />
            <stop
              offset="1"
              stopColor="#ff8a1f"
              stopOpacity="0"
            />
          </radialGradient>

          {/* Glass sheen */}
          <linearGradient
            id={`${id}-sheen`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stopColor="#fff7df"
              stopOpacity="0.3"
            />
            <stop
              offset="0.42"
              stopColor="#fff7df"
              stopOpacity="0.05"
            />
            <stop
              offset="1"
              stopColor="#fff7df"
              stopOpacity="0"
            />
          </linearGradient>

          <clipPath id={`${id}-clip`}>
            <path d={BONUS_MAIN} />
          </clipPath>
        </defs>

        {/* Deep stacked glass outlines */}
        <path
          d={BONUS_HALO_2}
          fill="none"
          stroke="#e7a437"
          strokeOpacity="0.2"
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d={BONUS_HALO_1}
          fill="none"
          stroke="#ffd27a"
          strokeOpacity="0.42"
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Main glass body */}
        <path
          d={BONUS_MAIN}
          fill={`url(#${id}-fill)`}
        />

        <g clipPath={`url(#${id}-clip)`}>
          <circle
            cx="8"
            cy="44"
            r="30"
            fill={`url(#${id}-flare)`}
          />

          <circle
            cx="116"
            cy="44"
            r="30"
            fill={`url(#${id}-flare)`}
          />

          <rect
            x="0"
            y="0"
            width="124"
            height="44"
            fill={`url(#${id}-sheen)`}
          />
        </g>

        {/* Inner glass rim */}
        <path
          d={BONUS_INNER}
          fill="none"
          stroke="#ffd27a"
          strokeOpacity="0.32"
          strokeWidth="0.8"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Main gold frame */}
        <path
          d={BONUS_MAIN}
          fill="none"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.7"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Horizontal lens flares */}
        <ellipse
          cx="7"
          cy="44"
          rx="15"
          ry="2.3"
          fill="#ffe0a3"
          opacity="0.72"
        />

        <ellipse
          cx="117"
          cy="44"
          rx="15"
          ry="2.3"
          fill="#ffe0a3"
          opacity="0.72"
        />

        <circle
          cx="7"
          cy="44"
          r="2.5"
          fill="#fff9e7"
        />

        <circle
          cx="117"
          cy="44"
          r="2.5"
          fill="#fff9e7"
        />
      </svg>

      {/* Badge content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <Crown
          aria-hidden="true"
          className="
            h-[15px]
            w-[15px]
            fill-current
            text-[#f6e2a6]
            drop-shadow-[0_0_6px_rgba(255,190,80,0.8)]
          "
          strokeWidth={1.5}
        />

        <span
          className="
            mt-1
            text-[clamp(7px,2.1vw,9px)]
            font-bold
            uppercase
            tracking-[0.1em]
            text-[#f3dfae]
          "
        >
          Bonus
        </span>

        <span
          className="
            mt-0.5
            text-[clamp(14px,4.4vw,18px)]
            font-black
            tracking-tight
            text-[#fff4d6]
            drop-shadow-[0_0_7px_rgba(255,180,70,0.72)]
          "
        >
          R {BONUS_AMOUNT.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Ladder geometry
 * ------------------------------------------------------------------------ */

const CAPSULE =
  'M13 1 H111 L122 12 V282 L106 299 H18 L2 282 V12 Z'

const CAPSULE_INNER =
  'M16 6 H108 L117 14 V280 L103 294 H21 L7 280 V14 Z'

/* ---------------------------------------------------------------------------
 * Multiplier ladder
 * ------------------------------------------------------------------------ */

/**
 * Render the four-step multiplier progression.
 *
 * @param {object} props
 * @param {number} props.step Current progression step.
 * @returns {JSX.Element}
 */
function MultiplierLadder({ step }) {
  const id = useSafeId('mf-ladder')

  const target =
    step < TOP_STEP
      ? step + 1
      : null

  const targetIndex =
    target === null
      ? -1
      : STEPS.indexOf(target)

  const lastIndex = STEPS.length - 1

  /*
   * Position where the gold progression beam transitions into the blue
   * completed/current section.
   */
  const split =
    targetIndex < 0
      ? '100%'
      : `calc(
          ${ROW_HEIGHT / 2}px +
          ${targetIndex} *
          (100% - ${ROW_HEIGHT}px) /
          ${lastIndex}
        )`

  const items = []

  STEPS.forEach((number, index) => {
    const state =
      number === target
        ? 'target'
        : number < (target ?? TOP_STEP + 1)
          ? 'reached'
          : 'upcoming'

    items.push(
      <LadderStep
        key={`step-${number}`}
        n={number}
        state={state}
      />,
    )

    if (index < lastIndex) {
      const aboveTarget =
        targetIndex < 0 ||
        index < targetIndex

      items.push(
        <Ring
          key={`ring-${number}`}
          gold={aboveTarget}
        />,
      )
    }
  })

  return (
    <div
      className="
        relative
        h-full
        w-full
        min-h-[250px]
      "
    >
      {/* -------------------------------------------------------------------
       * Outer mechanical capsule
       * ---------------------------------------------------------------- */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${LADDER_VIEWBOX_WIDTH} ${LADDER_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          overflow-visible
          [filter:drop-shadow(0_0_9px_rgba(40,150,255,0.42))]
        "
      >
        <defs>
          {/* Deep transparent glass body */}
          <linearGradient
            id={`${id}-fill`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stopColor="#0b315d"
              stopOpacity="0.28"
            />
            <stop
              offset="0.45"
              stopColor="#06172c"
              stopOpacity="0.18"
            />
            <stop
              offset="1"
              stopColor="#010711"
              stopOpacity="0.42"
            />
          </linearGradient>

          {/* Blue edge illumination */}
          <linearGradient
            id={`${id}-edge`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0"
              stopColor="#71dcff"
              stopOpacity="0.95"
            />
            <stop
              offset="0.12"
              stopColor="#36aaff"
              stopOpacity="0.72"
            />
            <stop
              offset="0.5"
              stopColor="#1a5f9c"
              stopOpacity="0.22"
            />
            <stop
              offset="0.88"
              stopColor="#36aaff"
              stopOpacity="0.72"
            />
            <stop
              offset="1"
              stopColor="#71dcff"
              stopOpacity="0.95"
            />
          </linearGradient>

          {/* Vertical glass reflection */}
          <linearGradient
            id={`${id}-reflection`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0"
              stopColor="#ffffff"
              stopOpacity="0.16"
            />
            <stop
              offset="0.08"
              stopColor="#ffffff"
              stopOpacity="0"
            />
            <stop
              offset="0.92"
              stopColor="#ffffff"
              stopOpacity="0"
            />
            <stop
              offset="1"
              stopColor="#ffffff"
              stopOpacity="0.13"
            />
          </linearGradient>

          <filter
            id={`${id}-soft`}
            x="-20%"
            y="-5%"
            width="140%"
            height="110%"
          >
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Deep glass housing */}
        <path
          d={CAPSULE}
          fill={`url(#${id}-fill)`}
        />

        {/* Outer atmospheric glow */}
        <path
          d={CAPSULE}
          fill="none"
          stroke="#38a8ff"
          strokeOpacity="0.48"
          strokeWidth="4"
          filter={`url(#${id}-soft)`}
        />

        {/* Internal reflection rails */}
        <path
          d={CAPSULE_INNER}
          fill="none"
          stroke="#72d8ff"
          strokeOpacity="0.2"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />

        {/* Main blue edge */}
        <path
          d={CAPSULE}
          fill="none"
          stroke={`url(#${id}-edge)`}
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Glass reflection */}
        <path
          d={CAPSULE_INNER}
          fill="none"
          stroke={`url(#${id}-reflection)`}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Bright lower mechanical edge */}
        <path
          d="M18 299 H106"
          fill="none"
          stroke="#a6efff"
          strokeOpacity="0.92"
          strokeWidth="1.7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* -------------------------------------------------------------------
       * Bottom light beam
       * ---------------------------------------------------------------- */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-full
          h-8
          w-[2px]
          -translate-x-1/2
          bg-gradient-to-b
          from-cyan-100
          via-cyan-400/60
          to-transparent
          shadow-[0_0_11px_rgba(80,210,255,0.9)]
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-3
          left-1/2
          h-6
          w-28
          -translate-x-1/2
          bg-[radial-gradient(ellipse_at_center,rgba(120,230,255,0.55),transparent_70%)]
        "
      />

      {/* -------------------------------------------------------------------
       * Central progression beam
       * ---------------------------------------------------------------- */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-1/2
          w-[2px]
          -translate-x-1/2
        "
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(255,214,130,0.95) 0,
              rgba(255,200,110,0.95)
                calc(${split} - 8px),
              rgba(90,205,255,0.95)
                calc(${split} + 8px),
              rgba(70,170,255,0.82) 100%
            )
          `,
          boxShadow:
            '0 0 8px rgba(120,200,255,0.55)',
        }}
      />

      {/* -------------------------------------------------------------------
       * Steps
       * ---------------------------------------------------------------- */}
      <ol
        aria-label="Multiplier ladder"
        className="
          relative
          flex
          h-full
          flex-col
          justify-between
          px-1
          py-[20px]
        "
      >
        {items}
      </ol>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Connector ring
 * ------------------------------------------------------------------------ */

/**
 * Small mechanical connector between ladder steps.
 *
 * @param {object} props
 * @param {boolean} props.gold Whether the connector belongs to the gold
 * progression section.
 * @returns {JSX.Element}
 */
function Ring({ gold }) {
  return (
    <li
      aria-hidden="true"
      className="
        flex
        h-[12px]
        shrink-0
        items-center
        justify-center
      "
    >
      <span
        className={`
          relative
          h-[8px]
          w-[8px]
          rounded-full
          border
          bg-[#02060c]/90
          ${
            gold
              ? `
                border-amber-300
                shadow-[0_0_7px_rgba(255,200,100,0.85)]
              `
              : `
                border-cyan-200
                shadow-[0_0_7px_rgba(110,220,255,0.82)]
              `
          }
        `}
      >
        {/* Small inner mechanical highlight */}
        <span
          className="
            absolute
            left-1/2
            top-1/2
            h-[2px]
            w-[2px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/80
          "
        />
      </span>
    </li>
  )
}

/* ---------------------------------------------------------------------------
 * Step tile styling
 * ------------------------------------------------------------------------ */

const TILE_STATES = {
  upcoming: {
    stroke: '#dca342',
    numberStroke: 0.95,
    multiplierStroke: 0.58,
    fill: 'rgba(10,14,26,0.56)',
    numberText: 'text-white',
    multiplierText: 'text-white/90',
    glow: `
      [filter:drop-shadow(0_0_3px_rgba(233,178,76,0.48))]
    `,
  },

  target: {
    stroke: '#72e4ff',
    numberStroke: 1,
    multiplierStroke: 0.76,
    fill: 'rgba(20,92,172,0.42)',
    numberText: 'text-white',
    multiplierText: 'text-cyan-100',
    glow: `
      [filter:drop-shadow(0_0_8px_rgba(60,190,255,0.98))]
    `,
  },

  reached: {
    stroke: '#7697bb',
    numberStroke: 0.72,
    multiplierStroke: 0.44,
    fill: 'rgba(8,18,32,0.58)',
    numberText: 'text-[#cfe6ff]',
    multiplierText: 'text-slate-300',
    glow: '',
  },
}

/*
 * Larger tile than the original design. The number tile is deliberately
 * dominant while the multiplier tile sits behind it like a second mechanical
 * layer.
 */
const TILE =
  'M10 1 H38 L47 10 V32 L38 41 H10 L1 32 V10 Z'

/* ---------------------------------------------------------------------------
 * Tile
 * ------------------------------------------------------------------------ */

/**
 * Render one glass/octagonal tile.
 *
 * @param {object} props
 * @param {'upcoming'|'target'|'reached'} props.state
 * @param {'number'|'multiplier'} props.kind
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function Tile({
  state,
  kind,
  className,
  children,
}) {
  const style = TILE_STATES[state]
  const isNumber = kind === 'number'

  return (
    <span
      className={`
        absolute
        ${className}
        ${style.glow}
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 42"
        preserveAspectRatio="none"
        className="
          absolute
          inset-0
          h-full
          w-full
          overflow-visible
        "
      >
        {/* Dark glass body */}
        <path
          d={TILE}
          fill={
            isNumber
              ? 'rgba(4,8,16,0.9)'
              : style.fill
          }
          stroke={style.stroke}
          strokeOpacity={
            isNumber
              ? style.numberStroke
              : style.multiplierStroke
          }
          strokeWidth={
            state === 'target'
              ? 1.8
              : 1.2
          }
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Target inner illumination */}
        {isNumber && state === 'target' && (
          <path
            d={TILE}
            fill={style.fill}
            opacity="0.72"
          />
        )}

        {/* Upper glass highlight */}
        <path
          d="M10 2 H38 L45 10"
          fill="none"
          stroke="#ffffff"
          strokeOpacity={
            state === 'target'
              ? 0.2
              : 0.08
          }
          strokeWidth="0.8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span className="relative grid h-full place-items-center">
        {children}
      </span>
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * Ladder step
 * ------------------------------------------------------------------------ */

/**
 * Render an individual multiplier step.
 *
 * @param {object} props
 * @param {number} props.n Step number.
 * @param {'upcoming'|'target'|'reached'} props.state
 * @returns {JSX.Element}
 */
function LadderStep({ n, state }) {
  const style = TILE_STATES[state]

  return (
    <li
      aria-current={
        state === 'target'
          ? 'step'
          : undefined
      }
      className="
        relative
        shrink-0
      "
      style={{
        height: ROW_HEIGHT,
      }}
    >
      {/* -------------------------------------------------------------------
       * Target atmospheric flare
       * ---------------------------------------------------------------- */}
      {state === 'target' && (
        <>
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[4px]
              w-[190%]
              -translate-x-1/2
              -translate-y-1/2
              bg-[radial-gradient(ellipse_at_center,rgba(170,240,255,0.98)_0%,rgba(40,150,255,0.58)_34%,transparent_70%)]
              blur-[1px]
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-14
              w-32
              -translate-x-1/2
              -translate-y-1/2
              bg-[radial-gradient(ellipse_at_center,rgba(60,170,255,0.38),transparent_70%)]
            "
          />
        </>
      )}

      {/* -------------------------------------------------------------------
       * Multiplier tile
       * ---------------------------------------------------------------- */}
      <Tile
        state={state}
        kind="multiplier"
        className="
          left-[calc(50%-2px)]
          top-[5px]
          h-[34px]
          w-[52px]
        "
      >
        <span
          className={`
            pl-4
            text-[11px]
            font-extrabold
            tabular-nums
            ${style.multiplierText}
          `}
        >
          ×{MULTIPLIERS[n]}
        </span>
      </Tile>

      {/* -------------------------------------------------------------------
       * Main step number
       * ---------------------------------------------------------------- */}
      <Tile
        state={state}
        kind="number"
        className="
          left-[calc(50%-29px)]
          top-0
          h-[42px]
          w-[48px]
        "
      >
        <span
          className={`
            text-[20px]
            font-black
            tabular-nums
            ${style.numberText}
          `}
        >
          {n}
        </span>
      </Tile>
    </li>
  )
}

/* ---------------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------------ */

export default MultiplierLadder