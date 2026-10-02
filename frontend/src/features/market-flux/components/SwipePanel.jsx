/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * 3D liquid-glass prediction control for Market Flux.
 *
 * Visual direction:
 * - Tall, narrow mechanical control inspired by the Wave-Ride reference.
 * - Heavy dark-metal extrusion gives the panel physical depth.
 * - Deep glass interior with green/red plasma.
 * - Bright neon inner rim and structural side rails.
 * - Three large directional chevrons floating above the glass.
 * - Compact SWIPE UP / SWIPE DOWN label near the lower section.
 *
 * Interaction:
 * - Swipe upward  -> Up
 * - Swipe downward -> Down
 * - Tap / click   -> Select
 * - Enter / Space -> Select
 *
 * The Down panel mirrors the Up panel.
 */

import { useId, useRef } from 'react'

const SWIPE_DISTANCE = 36
const TAP_TOLERANCE = 10

/*
 * ---------------------------------------------------------------------------
 * Mechanical geometry
 * ---------------------------------------------------------------------------
 */

const W = 88
const H = 300

const SLICES = 12
const DEPTH = 24

const SLICE_SHADES = [
  '#153b58',
  '#12334d',
  '#102d45',
  '#0e283e',
  '#0c2236',
  '#0a1d2f',
  '#081827',
  '#06131f',
  '#050f19',
  '#040b14',
  '#030810',
  '#02060c',
]

const SMALL = { dx: 8, dy: 12 }
const LARGE = { dx: 18, dy: 25 }

function chamfer(x, y, w, h, tl, tr, br, bl) {
  return [
    `M${x + tl.dx} ${y}`,
    `L${x + w - tr.dx} ${y}`,
    `L${x + w} ${y + tr.dy}`,
    `L${x + w} ${y + h - br.dy}`,
    `L${x + w - br.dx} ${y + h}`,
    `L${x + bl.dx} ${y + h}`,
    `L${x} ${y + h - bl.dy}`,
    `L${x} ${y + tl.dy}`,
    'Z',
  ].join(' ')
}

const OUTER = chamfer(0, 0, W, H, SMALL, LARGE, SMALL, LARGE)

const INNER = chamfer(
  7,
  7,
  W - 14,
  H - 14,
  { dx: 5, dy: 10 },
  { dx: 14, dy: 21 },
  { dx: 5, dy: 10 },
  { dx: 14, dy: 21 },
)

const INNER_SHADOW = chamfer(
  10,
  10,
  W - 20,
  H - 20,
  { dx: 4, dy: 8 },
  { dx: 11, dy: 17 },
  { dx: 4, dy: 8 },
  { dx: 11, dy: 17 },
)

/*
 * ---------------------------------------------------------------------------
 * Direction palettes
 * ---------------------------------------------------------------------------
 */

const PALETTES = {
  up: {
    label: 'Up',
    ariaLabel: 'Predict the price will go up',
    mirror: false,

    body: ['#06382a', '#031e17', '#020f0c', '#073b29'],

    rim: '#31ff9a',
    rimBright: '#8affcf',
    plasma: '#43f6ad',

    chevron: ['#65ffc0', '#0acb82'],

    rail: '#27e9a0',
    railBright: '#9affd2',

    glow: 'drop-shadow-[0_0_7px_rgba(40,255,155,0.38)]_drop-shadow-[0_15px_14px_rgba(0,0,0,0.7)]',

    glowActive:
      'drop-shadow-[0_0_18px_rgba(40,255,155,0.95)]_drop-shadow-[0_20px_18px_rgba(0,0,0,0.75)]',

    chevronGlow:
      'drop-shadow-[0_0_5px_rgba(60,255,170,0.8)]_drop-shadow-[0_0_12px_rgba(20,220,130,0.45)]',

    tilt:
      '[transform:perspective(520px)_rotateY(17deg)_translateZ(0)]',

    tiltSelected:
      '[transform:perspective(520px)_rotateY(17deg)_translateZ(15px)]',

    tiltPressed:
      'active:[transform:perspective(520px)_rotateY(17deg)_translateZ(-7px)]',

    focus: 'focus-visible:outline-emerald-300',
  },

  down: {
    label: 'Down',
    ariaLabel: 'Predict the price will go down',
    mirror: true,

    body: ['#4a080d', '#250306', '#110103', '#52080d'],

    rim: '#ff332f',
    rimBright: '#ff9188',
    plasma: '#ff5148',

    chevron: ['#ff6659', '#df1010'],

    rail: '#ff3732',
    railBright: '#ffaaa3',

    glow: 'drop-shadow-[0_0_7px_rgba(255,50,45,0.4)]_drop-shadow-[0_15px_14px_rgba(0,0,0,0.7)]',

    glowActive:
      'drop-shadow-[0_0_18px_rgba(255,55,45,0.95)]_drop-shadow-[0_20px_18px_rgba(0,0,0,0.75)]',

    chevronGlow:
      'drop-shadow-[0_0_5px_rgba(255,60,50,0.85)]_drop-shadow-[0_0_12px_rgba(220,20,20,0.5)]',

    tilt:
      '[transform:perspective(520px)_rotateY(-17deg)_translateZ(0)]',

    tiltSelected:
      '[transform:perspective(520px)_rotateY(-17deg)_translateZ(15px)]',

    tiltPressed:
      'active:[transform:perspective(520px)_rotateY(-17deg)_translateZ(-7px)]',

    focus: 'focus-visible:outline-red-300',
  },
}

const CHEVRON_OPACITY = [1, 0.92, 0.52]

/*
 * ---------------------------------------------------------------------------
 * Main component
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} props
 * @param {'up'|'down'} props.direction
 * @param {boolean} props.disabled
 * @param {boolean} props.selected
 * @param {boolean} props.dimmed
 * @param {(direction: 'up'|'down') => void} props.onSelect
 * @returns {JSX.Element}
 */
function SwipePanel({
  direction,
  disabled,
  selected,
  dimmed,
  onSelect,
}) {
  const palette = PALETTES[direction]
  const startY = useRef(null)

  const id = `mf-${direction}-${useId().replace(/:/g, '')}`

  const handlePointerDown = (event) => {
    startY.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (startY.current === null) return

    const delta = event.clientY - startY.current

    startY.current = null

    const swiped =
      direction === 'up'
        ? delta < -SWIPE_DISTANCE
        : delta > SWIPE_DISTANCE

    const tapped = Math.abs(delta) < TAP_TOLERANCE

    if (!disabled && (swiped || tapped)) {
      onSelect(direction)
    }
  }

  const handleKeyboardClick = (event) => {
    if (event.detail === 0 && !disabled) {
      onSelect(direction)
    }
  }

  /*
   * Important:
   * Do not apply opacity to the button itself.
   * Doing so would flatten the stacked 3D extrusion.
   */
  const dim = dimmed ? 'opacity-35' : ''

  return (
    <button
      type="button"
      aria-label={palette.ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startY.current = null
      }}
      onClick={handleKeyboardClick}
      className={`
        relative
        block
        h-full
        w-full
        touch-none
        select-none
        [transform-style:preserve-3d]
        outline-offset-4
        transition-transform
        duration-200
        ease-out
        focus-visible:outline
        focus-visible:outline-2
        motion-reduce:transition-none
        ${selected ? palette.tiltSelected : palette.tilt}
        ${palette.tiltPressed}
        ${palette.focus}
        ${disabled && !selected ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Deep mechanical body */}
      <Extrusion
        palette={palette}
        dim={dim}
      />

      {/* Main glass / metal artwork */}
      <PanelArtwork
        id={id}
        palette={palette}
        selected={selected}
        dim={dim}
      />

      {/* ----------------------------------------------------------------- */}
      {/* Direction chevrons                                                 */}
      {/* ----------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          inset-x-0
          top-[31%]
          flex
          justify-center
          transition-opacity
          duration-200
          [transform:translateZ(14px)]
          ${dim}
        `}
      >
        <span
          className={`
            flex
            w-[53%]
            flex-col
            items-stretch
            -space-y-[4px]
            ${palette.chevronGlow}
          `}
        >
          {CHEVRON_OPACITY.map((opacity, index) => (
            <Chevron
              key={index}
              direction={direction}
              gradientId={`${id}-chevron`}
              opacity={opacity}
            />
          ))}
        </span>
      </span>

      {/* ----------------------------------------------------------------- */}
      {/* Swipe label                                                        */}
      {/* ----------------------------------------------------------------- */}

      <span
        className={`
          pointer-events-none
          absolute
          inset-x-0
          top-[71%]
          flex
          flex-col
          items-center
          leading-none
          transition-opacity
          duration-200
          [transform:translateZ(12px)]
          ${dim}
        `}
      >
        <span
          className="
            text-[clamp(7px,2vw,9px)]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-white/75
            drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]
          "
        >
          Swipe
        </span>

        <span
          className="
            mt-1
            text-[clamp(12px,3.5vw,15px)]
            font-black
            uppercase
            tracking-[0.08em]
            text-white
            drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]
          "
        >
          {palette.label}
        </span>
      </span>
    </button>
  )
}

/*
 * ---------------------------------------------------------------------------
 * 3D mechanical extrusion
 * ---------------------------------------------------------------------------
 */

function Extrusion({ palette, dim }) {
  const flip = palette.mirror
    ? `translate(${W} 0) scale(-1 1)`
    : undefined

  return SLICE_SHADES.map((shade, index) => (
    <svg
      key={index}
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        transform: `translateZ(-${
          ((index + 1) * DEPTH) / SLICES
        }px)`,
      }}
      className={`
        pointer-events-none
        absolute
        inset-0
        h-full
        w-full
        overflow-visible
        transition-opacity
        duration-200
        ${dim}
      `}
    >
      <g transform={flip}>
        {/* Main extrusion shell */}
        <path
          d={OUTER}
          fill={shade}
          stroke={palette.rim}
          strokeOpacity={index < 2 ? 0.5 : 0.08}
          strokeWidth="0.85"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Deep horizontal bevel */}
        <path
          d={OUTER}
          fill="none"
          stroke="#000000"
          strokeOpacity={0.38}
          strokeWidth={index > 5 ? 1.4 : 0.8}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  ))
}

/*
 * ---------------------------------------------------------------------------
 * Chevron
 * ---------------------------------------------------------------------------
 */

function Chevron({
  direction,
  gradientId,
  opacity,
}) {
  const points =
    direction === 'up'
      ? '50,0 100,45 100,84 50,39 0,84 0,45'
      : '50,84 100,39 100,0 50,45 0,0 0,39'

  return (
    <svg
      viewBox="0 0 100 84"
      className="block w-full"
      style={{ opacity }}
    >
      <polygon
        points={points}
        fill={`url(#${gradientId})`}
      />
    </svg>
  )
}

/*
 * ---------------------------------------------------------------------------
 * Main panel artwork
 * ---------------------------------------------------------------------------
 */

function PanelArtwork({
  id,
  palette,
  selected,
  dim,
}) {
  const {
    body,
    rim,
    rimBright,
    plasma,
    rail,
    railBright,
    mirror,
  } = palette

  const flip = mirror
    ? `translate(${W} 0) scale(-1 1)`
    : undefined

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`
        pointer-events-none
        absolute
        inset-0
        h-full
        w-full
        overflow-visible
        transition-[filter,opacity]
        duration-200
        motion-reduce:transition-none
        ${selected ? palette.glowActive : palette.glow}
        ${dim}
      `}
    >
      <defs>
        {/* --------------------------------------------------------------- */}
        {/* Outer metal                                                      */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-frame`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#183c59"
          />
          <stop
            offset="0.22"
            stopColor="#0c263d"
          />
          <stop
            offset="0.5"
            stopColor="#061522"
          />
          <stop
            offset="0.78"
            stopColor="#0d2c45"
          />
          <stop
            offset="1"
            stopColor="#020811"
          />
        </linearGradient>

        <linearGradient
          id={`${id}-frame-edge`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#d8f8ff"
          />
          <stop
            offset="0.16"
            stopColor="#62cfff"
          />
          <stop
            offset="0.35"
            stopColor="#12527f"
          />
          <stop
            offset="0.62"
            stopColor="#06192b"
          />
          <stop
            offset="0.86"
            stopColor="#2e88bd"
          />
          <stop
            offset="1"
            stopColor="#9ceaff"
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Dark glass                                                       */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-body`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor={body[0]}
          />
          <stop
            offset="0.18"
            stopColor={body[1]}
          />
          <stop
            offset="0.52"
            stopColor={body[2]}
          />
          <stop
            offset="0.78"
            stopColor={body[1]}
          />
          <stop
            offset="1"
            stopColor={body[3]}
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Glass vertical lighting                                          */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-glass-light`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0"
            stopColor={rim}
            stopOpacity="0.55"
          />
          <stop
            offset="0.16"
            stopColor={rim}
            stopOpacity="0.08"
          />
          <stop
            offset="0.5"
            stopColor="#ffffff"
            stopOpacity="0"
          />
          <stop
            offset="0.84"
            stopColor={rim}
            stopOpacity="0.04"
          />
          <stop
            offset="1"
            stopColor={rim}
            stopOpacity="0.34"
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Plasma                                                            */}
        {/* --------------------------------------------------------------- */}

        <radialGradient id={`${id}-plasma`}>
          <stop
            offset="0"
            stopColor={plasma}
            stopOpacity="0.46"
          />
          <stop
            offset="0.42"
            stopColor={plasma}
            stopOpacity="0.18"
          />
          <stop
            offset="1"
            stopColor={plasma}
            stopOpacity="0"
          />
        </radialGradient>

        <radialGradient id={`${id}-plasma-soft`}>
          <stop
            offset="0"
            stopColor={rim}
            stopOpacity="0.22"
          />
          <stop
            offset="1"
            stopColor={rim}
            stopOpacity="0"
          />
        </radialGradient>

        {/* --------------------------------------------------------------- */}
        {/* Metallic bevel                                                   */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-bevel`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="0.7"
          />
          <stop
            offset="0.18"
            stopColor="#8de2ff"
            stopOpacity="0.4"
          />
          <stop
            offset="0.46"
            stopColor="#ffffff"
            stopOpacity="0.04"
          />
          <stop
            offset="0.72"
            stopColor="#000000"
            stopOpacity="0.5"
          />
          <stop
            offset="1"
            stopColor="#000000"
            stopOpacity="0.8"
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Glass reflection                                                 */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-gloss`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="0.22"
          />
          <stop
            offset="0.18"
            stopColor="#ffffff"
            stopOpacity="0.06"
          />
          <stop
            offset="0.55"
            stopColor="#ffffff"
            stopOpacity="0"
          />
          <stop
            offset="1"
            stopColor="#000000"
            stopOpacity="0.3"
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Side rail                                                        */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-rail`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0"
            stopColor={rail}
            stopOpacity="0"
          />
          <stop
            offset="0.45"
            stopColor={railBright}
            stopOpacity="0.95"
          />
          <stop
            offset="0.7"
            stopColor={rail}
            stopOpacity="0.45"
          />
          <stop
            offset="1"
            stopColor={rail}
            stopOpacity="0"
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Neon rim                                                          */}
        {/* --------------------------------------------------------------- */}

        <linearGradient
          id={`${id}-rim`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor={rimBright}
          />
          <stop
            offset="0.3"
            stopColor={rim}
          />
          <stop
            offset="0.7"
            stopColor={rim}
          />
          <stop
            offset="1"
            stopColor={rimBright}
          />
        </linearGradient>

        {/* --------------------------------------------------------------- */}
        {/* Highlight                                                         */}
        {/* --------------------------------------------------------------- */}

        <radialGradient id={`${id}-glint`}>
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="0.95"
          />
          <stop
            offset="0.3"
            stopColor={rimBright}
            stopOpacity="0.65"
          />
          <stop
            offset="1"
            stopColor={rim}
            stopOpacity="0"
          />
        </radialGradient>

        <filter
          id={`${id}-soft`}
          x="-40%"
          y="-20%"
          width="180%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="1.8" />
        </filter>

        <filter
          id={`${id}-strong`}
          x="-50%"
          y="-30%"
          width="200%"
          height="160%"
        >
          <feGaussianBlur stdDeviation="3" />
        </filter>

        <clipPath id={`${id}-inner`}>
          <path d={INNER} />
        </clipPath>

        <clipPath id={`${id}-shadow`}>
          <path d={INNER_SHADOW} />
        </clipPath>

        {/* Shared chevron gradient */}
        <linearGradient
          id={`${id}-chevron`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor={palette.chevron[0]}
          />
          <stop
            offset="1"
            stopColor={palette.chevron[1]}
          />
        </linearGradient>
      </defs>

      <g transform={flip}>
        {/* =============================================================== */}
        {/* Mechanical side tabs                                             */}
        {/* =============================================================== */}

        <g>
          <rect
            x="-1.5"
            y="67"
            width="4"
            height="31"
            rx="1.5"
            fill="#b86616"
            opacity="0.8"
          />

          <rect
            x={W - 2.5}
            y="67"
            width="4"
            height="31"
            rx="1.5"
            fill="#d78320"
            opacity="0.75"
          />

          <rect
            x="-1.5"
            y="199"
            width="4"
            height="31"
            rx="1.5"
            fill="#a95813"
            opacity="0.7"
          />

          <rect
            x={W - 2.5}
            y="199"
            width="4"
            height="31"
            rx="1.5"
            fill="#c87318"
            opacity="0.7"
          />
        </g>

        {/* =============================================================== */}
        {/* Outer metal chassis                                              */}
        {/* =============================================================== */}

        <path
          d={OUTER}
          fill={`url(#${id}-frame)`}
          stroke={`url(#${id}-frame-edge)`}
          strokeWidth="1.45"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Outer dark recess */}
        <path
          d={chamfer(
            2.2,
            2.2,
            W - 4.4,
            H - 4.4,
            { dx: 7, dy: 11 },
            { dx: 16, dy: 23 },
            { dx: 7, dy: 11 },
            { dx: 16, dy: 23 },
          )}
          fill="none"
          stroke="#02070d"
          strokeOpacity="0.8"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Outer metallic highlight */}
        <path
          d={chamfer(
            1.1,
            1.1,
            W - 2.2,
            H - 2.2,
            { dx: 7.5, dy: 11.5 },
            { dx: 16.5, dy: 23 },
            { dx: 7.5, dy: 11.5 },
            { dx: 16.5, dy: 23 },
          )}
          fill="none"
          stroke={`url(#${id}-bevel)`}
          strokeWidth="1.15"
          vectorEffect="non-scaling-stroke"
        />

        {/* =============================================================== */}
        {/* Glass interior                                                   */}
        {/* =============================================================== */}

        <path
          d={INNER}
          fill={`url(#${id}-body)`}
        />

        <g clipPath={`url(#${id}-inner)`}>
          {/* Vertical glass illumination */}
          <rect
            x="0"
            y="0"
            width={W}
            height={H}
            fill={`url(#${id}-glass-light)`}
          />

          {/* Deep central shadow */}
          <ellipse
            cx="44"
            cy="154"
            rx="29"
            ry="132"
            fill="#000000"
            opacity="0.18"
          />

          {/* Plasma cloud upper */}
          <ellipse
            cx="65"
            cy="45"
            rx="38"
            ry="54"
            fill={`url(#${id}-plasma)`}
          />

          {/* Plasma cloud lower */}
          <ellipse
            cx="22"
            cy="257"
            rx="38"
            ry="58"
            fill={`url(#${id}-plasma)`}
          />

          {/* Central atmospheric glow */}
          <ellipse
            cx="44"
            cy="151"
            rx="32"
            ry="92"
            fill={`url(#${id}-plasma-soft)`}
            opacity="0.55"
          />

          {/* ============================================================= */}
          {/* Plasma wisps                                                    */}
          {/* ============================================================= */}

          {[
            ['M18 37 C36 65 66 62 80 24', 1],
            ['M8 86 C30 72 55 90 78 55', 0.72],
            ['M9 131 C31 105 56 120 79 84', 0.6],
            ['M77 116 C55 140 60 169 31 192', 0.6],
            ['M72 159 C52 183 30 177 11 218', 0.8],
            ['M11 270 C29 240 58 253 79 215', 0.9],
            ['M35 12 C27 42 47 60 41 94', 0.55],
            ['M78 210 C61 229 59 255 43 284', 0.45],
          ].map(([d, opacity]) => (
            <g
              key={d}
              opacity={opacity}
            >
              <path
                d={d}
                fill="none"
                stroke={plasma}
                strokeWidth="3.2"
                filter={`url(#${id}-soft)`}
              />

              <path
                d={d}
                fill="none"
                stroke={plasma}
                strokeWidth="0.85"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          {/* ============================================================= */}
          {/* Upper glass reflection                                          */}
          {/* ============================================================= */}

          <path
            d={`
              M0 0
              H${W}
              V86
              C64 67 33 88 0 142
              Z
            `}
            fill={`url(#${id}-gloss)`}
          />

          {/* Thin diagonal glass reflection */}
          <path
            d="M10 26 C29 50 49 61 76 39"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.1"
            strokeWidth="1"
          />

          {/* ============================================================= */}
          {/* Central vertical glass streak                                   */}
          {/* ============================================================= */}

          <rect
            x="43"
            y="0"
            width="1"
            height={H}
            fill={rimBright}
            opacity="0.07"
          />

          {/* ============================================================= */}
          {/* Floating glints                                                  */}
          {/* ============================================================= */}

          <circle
            cx="65"
            cy="34"
            r="12"
            fill={`url(#${id}-glint)`}
          />

          <path
            d="M58 34 H72 M65 27 V41"
            stroke="#ffffff"
            strokeOpacity="0.85"
            strokeWidth="0.65"
            vectorEffect="non-scaling-stroke"
          />

          <circle
            cx="22"
            cy="244"
            r="7"
            fill={`url(#${id}-glint)`}
            opacity="0.45"
          />

          {/* ============================================================= */}
          {/* Glass lower shadow                                              */}
          {/* ============================================================= */}

          <path
            d={INNER_SHADOW}
            fill="#000000"
            opacity="0.14"
          />
        </g>

        {/* =============================================================== */}
        {/* Inner neon rim glow                                               */}
        {/* =============================================================== */}

        <path
          d={INNER}
          fill="none"
          stroke={rim}
          strokeWidth="4"
          strokeOpacity="0.48"
          filter={`url(#${id}-strong)`}
        />

        <path
          d={INNER}
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="1.55"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* =============================================================== */}
        {/* Structural side rails                                             */}
        {/* =============================================================== */}

        {/* Left rail glow */}
        <path
          d="M8 28 L8 272"
          fill="none"
          stroke={rail}
          strokeWidth="3"
          strokeOpacity="0.22"
          filter={`url(#${id}-soft)`}
          vectorEffect="non-scaling-stroke"
        />

        {/* Left rail core */}
        <path
          d="M8 31 L8 269"
          fill="none"
          stroke={`url(#${id}-rail)`}
          strokeWidth="0.9"
          vectorEffect="non-scaling-stroke"
        />

        {/* Right rail glow */}
        <path
          d="M80 28 L80 272"
          fill="none"
          stroke={rail}
          strokeWidth="3"
          strokeOpacity="0.22"
          filter={`url(#${id}-soft)`}
          vectorEffect="non-scaling-stroke"
        />

        {/* Right rail core */}
        <path
          d="M80 31 L80 269"
          fill="none"
          stroke={`url(#${id}-rail)`}
          strokeWidth="0.9"
          vectorEffect="non-scaling-stroke"
        />

        {/* =============================================================== */}
        {/* Mechanical horizontal separators                                  */}
        {/* =============================================================== */}

        {[66, 229].map((y) => (
          <g key={y}>
            <path
              d={`M11 ${y} H77`}
              stroke="#000000"
              strokeOpacity="0.7"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            <path
              d={`M14 ${y - 1} H74`}
              stroke={rail}
              strokeOpacity="0.28"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* =============================================================== */}
        {/* Small mechanical corner lights                                    */}
        {/* =============================================================== */}

        <circle
          cx="9"
          cy="10"
          r="6"
          fill={`url(#${id}-glint)`}
          opacity="0.75"
        />

        <circle
          cx={W - 9}
          cy="10"
          r="5"
          fill={`url(#${id}-glint)`}
          opacity="0.45"
        />

        <circle
          cx="9"
          cy={H - 10}
          r="5"
          fill={`url(#${id}-glint)`}
          opacity="0.4"
        />

        <circle
          cx={W - 9}
          cy={H - 10}
          r="7"
          fill={`url(#${id}-glint)`}
          opacity="0.65"
        />
      </g>
    </svg>
  )
}

export default SwipePanel