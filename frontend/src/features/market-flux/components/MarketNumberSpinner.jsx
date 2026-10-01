/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Slot-machine price display.
 *
 * Modelled on a mechanical slot machine. When the price changes, every reel
 * is kicked into a steady spin (the "governor" holds the speed constant), then
 * the reels are stopped one after another from left to right, like the pawls
 * dropping into each index disk: a short, firm brake, a tiny clunk as the reel
 * settles into its notch, and the next reel a split second behind.
 *
 * - Each drum is a vertical strip of 0 to 9 (three copies, so it can wrap).
 * - Timeline per drum: quick ramp up, constant-speed spin, brake, settle.
 * - Brake start and finish times depend only on the drum's position, never on
 *   its digit, so the stop order is always left to right. The spin speed is
 *   nudged slightly per drum so it lands exactly on its digit at that time.
 * - A speed-based blur hides the strobing while it is fast.
 * - Near-miss tease (`tease` prop): the last reel spins a little longer, brakes
 *   one digit short of the real price, hesitates, then creeps into place. It
 *   always lands on the true digit; only the timing changes.
 * - The neighbouring digits show as faint ghosts above and below.
 * - The drums share the full width of the cylinder equally, and each digit
 *   scales with its drum (container query units).
 * - Drums are animated by writing transforms straight to the DOM in a
 *   requestAnimationFrame loop, so nothing re-renders per frame.
 *
 * Tune the feel with the constants below. Users who prefer reduced motion
 * see the new price immediately, with no spin.
 */

import { useEffect, useRef, useState } from 'react'

const CELL_HEIGHT = 30 // px: height of one digit on the drum
const WINDOW_HEIGHT = 52 // px: visible window; neighbours peek in as ghosts
const DRUM_OFFSET = (WINDOW_HEIGHT - CELL_HEIGHT) / 2

// Timeline, in milliseconds from the moment the price changes.
const SPIN_SPEED = 20 // cells per second while spinning (the governed speed)
const RAMP_MS = 200 // kick from rest up to full speed
const FIRST_SPIN_MS = 1000 // when the first (leftmost) reel's brake engages
const STAGGER_MS = 240 // each reel's brake engages this much later than the last
const BRAKE_MS = 260 // pawl drops: firm slow-down into the notch
const SETTLE_MS = 160 // tiny clunk as the reel seats
const OVERSHOOT = 0.3 // cells the reel rocks past its notch during the clunk

// Near-miss tease on the last reel. Together these add 650ms; the game allows
// 700ms (NEAR_MISS_EXTRA_MS in useMarketSimulation.js), so keep the sum below it.
const TEASE_EXTRA_SPIN_MS = 250 // spins longer before braking
const TEASE_HOLD_MS = 150 // sits one digit short
const TEASE_CREEP_MS = 250 // then eases forward into the true digit
const TEASE_CREEP_CELLS = 1

// Ghost digits stay at most ~16% visible; the centre digit is fully lit.
const FADE_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.16) 14%, #000 36%, #000 64%, rgba(0,0,0,0.16) 86%, transparent 100%)'

// Three copies of 0 to 9 so the strip can wrap without a visible seam.
const STRIP = Array.from({ length: 30 }, (_, i) => i % 10)

const TONES = {
  idle: 'text-sky-100 [text-shadow:0_0_8px_rgba(120,220,255,0.85)]',
  up: 'text-emerald-200 [text-shadow:0_0_8px_rgba(52,211,153,0.9)]',
  down: 'text-rose-200 [text-shadow:0_0_8px_rgba(251,113,133,0.9)]',
}

const mod10 = (n) => ((n % 10) + 10) % 10

/**
 * @param {object} props
 * @param {number} props.value Price to display.
 * @param {number} props.decimals Digits after the decimal point.
 * @param {'idle'|'up'|'down'} [props.tone='idle'] Digit colour.
 * @param {boolean} [props.tease=false] Tease the last reel on this reveal.
 * @returns {JSX.Element}
 */
function MarketNumberSpinner({ value, decimals, tone = 'idle', tease = false }) {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  // Each visible change of the price starts a new spin.
  const [tracked, setTracked] = useState(formatted)
  const [epoch, setEpoch] = useState(0)
  if (formatted !== tracked) {
    setTracked(formatted)
    setEpoch(epoch + 1)
  }

  const chars = formatted.split('')
  const digitCount = chars.filter((char) => /\d/.test(char)).length
  let digitIndex = -1

  return (
    <div
      role="img"
      aria-label={`Price ${formatted}`}
      className="flex w-full items-center justify-center"
    >
      {chars.map((char, index) => {
        // Key from the right so each digit keeps its drum when the number
        // grows or shrinks, instead of every drum remounting.
        const fromRight = chars.length - 1 - index

        if (!/\d/.test(char)) {
          return (
            <span
              key={`s${fromRight}`}
              aria-hidden="true"
              className="w-[9px] shrink-0 self-end pb-[13px] text-center text-[clamp(20px,6.2vw,26px)] font-black leading-none text-sky-100 [text-shadow:0_0_8px_rgba(120,220,255,0.85)]"
            >
              {char}
            </span>
          )
        }

        digitIndex += 1
        return (
          <Drum
            key={`d${fromRight}`}
            digit={Number(char)}
            order={digitIndex}
            isLast={digitIndex === digitCount - 1}
            tease={tease}
            epoch={epoch}
            toneClass={TONES[tone]}
          />
        )
      })}
    </div>
  )
}

/**
 * One digit drum.
 *
 * @param {object} props
 * @param {number} props.digit Digit to land on.
 * @param {number} props.order Position among the digits, left to right (0 = first).
 * @param {boolean} props.isLast Whether this is the right-most digit.
 * @param {boolean} props.tease Whether this reveal is a near miss.
 * @param {number} props.epoch Increments on every price change; starts a spin.
 * @param {string} props.toneClass Digit colour classes.
 * @returns {JSX.Element}
 */
function Drum({ digit, order, isLast, tease, epoch, toneClass }) {
  const stripRef = useRef(null)
  const positionRef = useRef(digit) // current position, in cells (0 to 10)

  // Remember the latest `tease` without restarting a spin that is in progress
  // (it can change while the reels are still landing). Declared before the
  // animation effect so it is current when a new spin starts.
  const teaseRef = useRef(tease)
  useEffect(() => {
    teaseRef.current = tease
  })

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return undefined

    let lastBlur = ''
    const draw = (position, speed) => {
      const cell = mod10(position)
      strip.style.transform = `translateY(${DRUM_OFFSET - (cell + 10) * CELL_HEIGHT}px)`

      const blur = speed > 5 ? Math.min(2.4, speed / 10).toFixed(1) : ''
      if (blur !== lastBlur) {
        strip.style.filter = blur ? `blur(${blur}px)` : 'none'
        lastBlur = blur
      }
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // First paint, or reduced motion: show the digit without spinning.
    if (epoch === 0 || reduceMotion) {
      positionRef.current = digit
      draw(digit, 0)
      return undefined
    }

    const startPosition = positionRef.current
    const startTime = performance.now()

    const teasing = isLast && teaseRef.current

    const ramp = RAMP_MS / 1000
    const spinSeconds =
      (FIRST_SPIN_MS + order * STAGGER_MS + (teasing ? TEASE_EXTRA_SPIN_MS : 0)) / 1000 // brake engages
    const brake = BRAKE_MS / 1000
    const settle = SETTLE_MS / 1000
    const hold = teasing ? TEASE_HOLD_MS / 1000 : 0
    const creepSeconds = teasing ? TEASE_CREEP_MS / 1000 : 0
    const creepCells = teasing ? TEASE_CREEP_CELLS : 0

    // Plan the distance. At speed v the reel covers v * (spin - ramp/2) while
    // spinning (the ramp covers half distance) plus v * brake / 3 while braking
    // (cubic ease-out). Pick whole turns so the total lands exactly on the
    // digit, then derive the speed that makes it fit this drum's fixed timeline.
    // A teasing reel brakes `creepCells` short of the digit and creeps the rest.
    const effectiveSeconds = spinSeconds - ramp / 2 + brake / 3
    const ahead = mod10(digit - startPosition)
    const minTurns = teasing ? 1 : 0 // keeps the brake point ahead of the start
    const wholeTurns = Math.max(
      minTurns,
      Math.round((SPIN_SPEED * effectiveSeconds - ahead) / 10),
    )
    const travel = ahead + 10 * wholeTurns // total distance, lands on the digit
    const brakeEnd = travel - creepCells // where the brake stops the reel
    const speed = brakeEnd / effectiveSeconds // cells per second for this drum
    const spinEndPosition = speed * (spinSeconds - ramp / 2)
    const brakeDistance = (speed * brake) / 3

    // Phase boundaries, in seconds.
    const brakeAt = spinSeconds
    const holdAt = brakeAt + brake
    const creepAt = holdAt + hold
    const settleAt = creepAt + creepSeconds
    const endAt = settleAt + settle

    let frameId = 0
    const frame = (now) => {
      const t = Math.max(0, (now - startTime) / 1000)

      let offset // cells travelled so far
      let currentSpeed = 0

      if (t < ramp) {
        offset = (speed * t * t) / (2 * ramp)
        currentSpeed = (speed * t) / ramp
      } else if (t < brakeAt) {
        offset = speed * (t - ramp / 2)
        currentSpeed = speed
      } else if (t < holdAt) {
        const u = (t - brakeAt) / brake
        offset = spinEndPosition + brakeDistance * (1 - (1 - u) ** 3)
        currentSpeed = speed * (1 - u) ** 2
      } else if (t < creepAt) {
        offset = brakeEnd // tease: stopped one digit short
      } else if (t < settleAt) {
        const u = (t - creepAt) / creepSeconds
        const eased = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2
        offset = brakeEnd + creepCells * eased
      } else if (t < endAt) {
        const u = (t - settleAt) / settle
        offset = travel + OVERSHOOT * Math.sin(Math.PI * u) * (1 - u)
      } else {
        positionRef.current = digit
        draw(digit, 0)
        return
      }

      const position = startPosition + offset
      positionRef.current = mod10(position)
      draw(position, currentSpeed)
      frameId = requestAnimationFrame(frame)
    }

    frameId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(frameId)
  }, [digit, order, isLast, epoch])

  return (
    <span
      aria-hidden="true"
      style={{ height: WINDOW_HEIGHT }}
      className="relative block min-w-0 flex-1 overflow-hidden border-l border-cyan-200/10 [container-type:inline-size] first:border-l-0"
    >
      <span
        className="absolute inset-0"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <span ref={stripRef} className="block will-change-transform">
          {STRIP.map((d, i) => (
            <span
              key={i}
              style={{ height: CELL_HEIGHT }}
              className={`grid place-items-center pb-[2px] text-[clamp(20px,105cqw,30px)] font-black leading-none tabular-nums ${toneClass}`}
            >
              {d}
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}

export default MarketNumberSpinner