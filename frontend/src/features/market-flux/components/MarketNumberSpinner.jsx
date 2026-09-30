/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Slot-machine price display.
 *
 * Whenever the price changes, every digit drum starts spinning at once and
 * then settles, one after another from left to right, each landing on its
 * digit of the new price, so the number is revealed in reading order.
 *
 * - Each drum is a vertical strip of 0 to 9 (three copies, so it can wrap).
 * - A drum runs one continuous ease-out: fast at the start, slowing into its
 *   digit. The travel distance is chosen so it lands exactly on the digit, and
 *   its duration is fixed by its position, which guarantees the order.
 * - A speed-based blur hides the strobing while it is fast.
 * - The neighbouring digits show as faint ghosts above and below.
 * - The drums share the full width of the cylinder equally, and each digit
 *   scales with its drum (container query units), so the number fills the
 *   space whether it has 5 digits or 8.
 * - Drums are animated by writing transforms straight to the DOM in a
 *   requestAnimationFrame loop, so nothing re-renders per frame.
 *
 * Tune the feel with FIRST_STOP_MS and STAGGER_MS below. Users who prefer reduced motion
 * see the new price immediately, with no spin.
 */

import { useEffect, useRef, useState } from 'react'

const CELL_HEIGHT = 30 // px: height of one digit on the drum
const WINDOW_HEIGHT = 52 // px: visible window; neighbours peek in as ghosts
const DRUM_OFFSET = (WINDOW_HEIGHT - CELL_HEIGHT) / 2

// Every drum finishes at a fixed time: the first digit at FIRST_STOP_MS, and
// each one after it STAGGER_MS later. Finish times never depend on which digit
// a drum has to land on, so the order is always left to right.
const FIRST_STOP_MS = 700
const STAGGER_MS = 160

const TRAVEL_PER_SECOND = 15 // roughly how many cells a drum covers per second of spin
const MIN_TRAVEL = 4 // never a tiny nudge: every drum visibly spins

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
 * @returns {JSX.Element}
 */
function MarketNumberSpinner({ value, decimals, tone = 'idle' }) {
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
 * @param {number} props.epoch Increments on every price change; starts a spin.
 * @param {string} props.toneClass Digit colour classes.
 * @returns {JSX.Element}
 */
function Drum({ digit, order, epoch, toneClass }) {
  const stripRef = useRef(null)
  const positionRef = useRef(digit) // current position, in cells (0 to 10)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return undefined

    let lastBlur = ''
    const draw = (position, speed) => {
      const cell = mod10(position)
      strip.style.transform = `translateY(${DRUM_OFFSET - (cell + 10) * CELL_HEIGHT}px)`

      const blur = speed > 6 ? Math.min(3.2, speed / 14).toFixed(1) : ''
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
    const durationMs = FIRST_STOP_MS + order * STAGGER_MS

    // Distance to travel: lands exactly on `digit` (a whole number of cells
    // past the start, plus the gap to the digit), and grows with the duration
    // so later drums spin at a similar pace to the first.
    const ahead = mod10(digit - startPosition)
    const wanted = (TRAVEL_PER_SECOND * durationMs) / 1000
    const wholeTurns = Math.max(0, Math.round((wanted - ahead) / 10))
    let travel = ahead + 10 * wholeTurns
    if (travel < MIN_TRAVEL) travel += 10

    let frameId = 0
    const frame = (now) => {
      const progress = Math.min(1, Math.max(0, (now - startTime) / durationMs))
      const eased = 1 - (1 - progress) ** 3 // ease-out cubic
      const position = startPosition + travel * eased

      if (progress >= 1) {
        positionRef.current = digit
        draw(digit, 0)
        return
      }

      positionRef.current = mod10(position)
      // Speed in cells per second: the derivative of the easing curve.
      draw(position, ((3 * travel) / (durationMs / 1000)) * (1 - progress) ** 2)
      frameId = requestAnimationFrame(frame)
    }

    frameId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(frameId)
  }, [digit, order, epoch])

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