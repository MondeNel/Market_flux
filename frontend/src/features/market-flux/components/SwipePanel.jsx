/**
 * @file src/features/market-flux/components/SwipePanel.jsx
 *
 * @description
 * Swipe Up (green) and Swipe Down (red) prediction panels, matched to the
 * Wave-Ride reference:
 *
 * - A chamfered steel frame with a bright rim, specular glints and amber side
 *   tabs.
 * - An inner glass panel with a neon edge and a plasma texture (glowing wisps
 *   and a star glint).
 * - Three solid chevrons that fade from top to bottom, then the label.
 *
 * The artwork is one SVG that stretches to the panel, with non-scaling
 * strokes. The Down panel is the Up panel mirrored. Interaction is unchanged:
 * swipe (touch or mouse drag) or tap/click, and Enter/Space from the keyboard.
 */

import { useId, useRef } from 'react'

const SWIPE_DISTANCE = 36
const TAP_TOLERANCE = 10

// Artwork box. The SVG stretches to the panel, so only proportions matter.
const W = 88
const H = 300

const SMALL = { dx: 8, dy: 12 }
const LARGE = { dx: 17, dy: 23 }

/**
 * Rectangle with a diagonal cut on each corner.
 * Corners are { dx, dy }: how far the cut runs along x and y.
 */
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

// Small cut top-left and bottom-right, large cut top-right and bottom-left.
const OUTER = chamfer(0, 0, W, H, SMALL, LARGE, SMALL, LARGE)
const INNER = chamfer(
  7,
  6,
  W - 14,
  H - 12,
  { dx: 5, dy: 9 },
  { dx: 13, dy: 19 },
  { dx: 5, dy: 9 },
  { dx: 13, dy: 19 },
)

const PALETTES = {
  up: {
    label: 'Up',
    ariaLabel: 'Predict the price will go up',
    mirror: false,
    body: ['#0c5238', '#052a1c', '#04251a', '#0b603f'],
    rim: '#37ff9e',
    wisp: '#6dffc0',
    chevron: ['#58f0b0', '#10b878'],
    glow: 'drop-shadow-[0_0_6px_rgba(52,255,160,0.35)]',
    glowActive: 'drop-shadow-[0_0_16px_rgba(52,255,160,0.9)]',
    chevronGlow: 'drop-shadow-[0_0_6px_rgba(52,255,160,0.55)]',
    focus: 'focus-visible:outline-emerald-300',
  },
  down: {
    label: 'Down',
    ariaLabel: 'Predict the price will go down',
    mirror: true,
    body: ['#6a0b0f', '#2c0508', '#270507', '#760c11'],
    rim: '#ff3b30',
    wisp: '#ff7a6a',
    chevron: ['#ff5545', '#d90d0d'],
    glow: 'drop-shadow-[0_0_6px_rgba(255,60,50,0.35)]',
    glowActive: 'drop-shadow-[0_0_16px_rgba(255,70,60,0.9)]',
    chevronGlow: 'drop-shadow-[0_0_6px_rgba(255,60,50,0.55)]',
    focus: 'focus-visible:outline-red-300',
  },
}

// Top to bottom: the lowest chevron is the dimmest, for both directions.
const CHEVRON_OPACITY = [1, 0.9, 0.5]

/**
 * @param {object} props
 * @param {'up'|'down'} props.direction Which side this panel represents.
 * @param {boolean} props.disabled Blocks input (round running, etc.).
 * @param {boolean} props.selected This panel holds the player's prediction.
 * @param {boolean} props.dimmed The other panel was picked.
 * @param {(direction: 'up'|'down') => void} props.onSelect
 * @returns {JSX.Element}
 */
function SwipePanel({ direction, disabled, selected, dimmed, onSelect }) {
  const palette = PALETTES[direction]
  const startY = useRef(null)
  // useId contains colons, which are awkward inside url(#...).
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
      direction === 'up' ? delta < -SWIPE_DISTANCE : delta > SWIPE_DISTANCE
    const tapped = Math.abs(delta) < TAP_TOLERANCE

    if (!disabled && (swiped || tapped)) onSelect(direction)
  }

  const handleKeyboardClick = (event) => {
    // Pointer taps are handled above; detail === 0 means keyboard activation.
    if (event.detail === 0 && !disabled) onSelect(direction)
  }

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
        outline-offset-4
        transition-[opacity,transform]
        duration-200
        focus-visible:outline
        focus-visible:outline-2
        active:scale-[0.98]
        motion-reduce:transition-none
        ${palette.focus}
        ${dimmed ? 'opacity-40' : ''}
        ${disabled && !selected ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <PanelArtwork id={id} palette={palette} selected={selected} />

      {/* Chevrons */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[34%] flex justify-center"
      >
        <span
          className={`flex w-[40%] flex-col items-stretch -space-y-[2px] ${palette.chevronGlow}`}
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

      {/* Label */}
      <span className="pointer-events-none absolute inset-x-0 top-[68%] flex flex-col items-center leading-tight">
        <span className="text-[clamp(8px,2.4vw,10px)] font-semibold uppercase tracking-[0.1em] text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Swipe
        </span>
        <span className="text-[clamp(12px,3.5vw,15px)] font-bold uppercase tracking-[0.06em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
          {palette.label}
        </span>
      </span>
    </button>
  )
}

/**
 * Solid chevron. Gradient is defined once in the panel artwork.
 */
function Chevron({ direction, gradientId, opacity }) {
  const points =
    direction === 'up'
      ? '50,0 100,44 100,84 50,40 0,84 0,44'
      : '50,84 100,40 100,0 50,44 0,0 0,40'

  return (
    <svg viewBox="0 0 100 84" className="block w-full" style={{ opacity }}>
      <polygon points={points} fill={`url(#${gradientId})`} />
    </svg>
  )
}

/**
 * Frame, glass body, plasma texture and neon edge.
 * The Down panel draws the same art mirrored.
 */
function PanelArtwork({ id, palette, selected }) {
  const { body, rim, wisp, chevron, mirror } = palette
  const flip = mirror ? `translate(${W} 0) scale(-1 1)` : undefined

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
        transition-[filter]
        duration-200
        motion-reduce:transition-none
        ${selected ? palette.glowActive : palette.glow}
      `}
    >
      <defs>
        {/* Steel frame */}
        <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1d33" />
          <stop offset="1" stopColor="#040912" />
        </linearGradient>
        <linearGradient id={`${id}-frame-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a6ecff" />
          <stop offset="0.3" stopColor="#2a78b8" />
          <stop offset="0.65" stopColor="#0b2f55" />
          <stop offset="1" stopColor="#7fd4ff" />
        </linearGradient>

        {/* Glass body */}
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.4" stopColor={body[1]} />
          <stop offset="0.7" stopColor={body[2]} />
          <stop offset="1" stopColor={body[3]} />
        </linearGradient>

        {/* Brighter along the near edge, like the reference */}
        <linearGradient id={`${id}-edge-glow`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={rim} stopOpacity="0.45" />
          <stop offset="0.3" stopColor={rim} stopOpacity="0" />
          <stop offset="0.85" stopColor={rim} stopOpacity="0" />
          <stop offset="1" stopColor={rim} stopOpacity="0.2" />
        </linearGradient>

        {/* Soft plasma cloud */}
        <radialGradient id={`${id}-cloud`}>
          <stop offset="0" stopColor={rim} stopOpacity="0.5" />
          <stop offset="0.6" stopColor={rim} stopOpacity="0.15" />
          <stop offset="1" stopColor={rim} stopOpacity="0" />
        </radialGradient>

        {/* Star glint near the top */}
        <radialGradient id={`${id}-star`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor={wisp} stopOpacity="0.6" />
          <stop offset="1" stopColor={wisp} stopOpacity="0" />
        </radialGradient>

        {/* Corner glint on the frame */}
        <radialGradient id={`${id}-corner`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#7fd8ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7fd8ff" stopOpacity="0" />
        </radialGradient>

        {/* Amber side tabs */}
        <linearGradient id={`${id}-amber`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb23c" />
          <stop offset="1" stopColor="#b8650d" />
        </linearGradient>

        {/* Chevron fill, shared with the chevron SVGs */}
        <linearGradient id={`${id}-chevron`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={chevron[0]} />
          <stop offset="1" stopColor={chevron[1]} />
        </linearGradient>

        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <clipPath id={`${id}-inner`}>
          <path d={INNER} />
        </clipPath>
      </defs>

      <g transform={flip}>
        {/* Amber tabs, half hidden behind the frame */}
        {[76, 190].map((y) => (
          <g key={y}>
            <rect x="-1.4" y={y} width="3" height={y === 76 ? 26 : 22} rx="1.3" fill={`url(#${id}-amber)`} />
            <rect x={W - 1.6} y={y} width="3" height={y === 76 ? 14 : 22} rx="1.3" fill={`url(#${id}-amber)`} />
          </g>
        ))}

        {/* Steel frame */}
        <path
          d={OUTER}
          fill={`url(#${id}-frame)`}
          stroke={`url(#${id}-frame-edge)`}
          strokeWidth="1.3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={chamfer(2.5, 2.2, W - 5, H - 4.4, { dx: 6, dy: 10 }, { dx: 15, dy: 21 }, { dx: 6, dy: 10 }, { dx: 15, dy: 21 })}
          fill="none"
          stroke="#37a8e8"
          strokeOpacity="0.35"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
        />

        {/* Glass body and plasma */}
        <path d={INNER} fill={`url(#${id}-body)`} />
        <g clipPath={`url(#${id}-inner)`}>
          <rect x="0" y="0" width={W} height={H} fill={`url(#${id}-edge-glow)`} />

          {/* Plasma clouds, top and bottom */}
          <ellipse cx="62" cy="40" rx="36" ry="52" fill={`url(#${id}-cloud)`} />
          <ellipse cx="24" cy="262" rx="38" ry="54" fill={`url(#${id}-cloud)`} />

          {/* Wisps: a soft copy for the glow, a thin copy for the line */}
          {[
            ['M20 40 C40 72 70 56 80 24', 1],
            ['M10 124 C30 92 60 112 78 66', 0.75],
            ['M68 150 C50 182 30 170 12 208', 0.6],
            ['M14 272 C30 240 60 252 80 214', 0.85],
            ['M34 12 C28 40 46 60 40 96', 0.55],
            ['M8 60 C24 90 20 130 34 160', 0.5],
            ['M80 100 C60 130 70 170 50 200', 0.45],
          ].map(([d, opacity]) => (
            <g key={d} opacity={opacity}>
              <path d={d} fill="none" stroke={wisp} strokeWidth="2.6" filter={`url(#${id}-soft)`} />
              <path d={d} fill="none" stroke={wisp} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
            </g>
          ))}

          {/* Star glint */}
          <circle cx="66" cy="34" r="12" fill={`url(#${id}-star)`} />
          <path d="M58 34 H74 M66 26 V42" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        </g>

        {/* Neon edge: soft copy for the glow, crisp copy for the line */}
        <path d={INNER} fill="none" stroke={rim} strokeWidth="3" strokeOpacity="0.55" filter={`url(#${id}-soft)`} />
        <path d={INNER} fill="none" stroke={rim} strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* Specular glints on the steel */}
        <circle cx="10" cy="7" r="9" fill={`url(#${id}-corner)`} />
        <circle cx={W - 14} cy={H - 6} r="6" fill={`url(#${id}-corner)`} opacity="0.7" />
      </g>
    </svg>
  )
}

export default SwipePanel