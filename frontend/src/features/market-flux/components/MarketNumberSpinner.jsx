/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Mechanical 3D liquid-glass result reel for Market Flux.
 *
 * VISUAL DESIGN
 * ---------------------------------------------------------------------------
 * - Wide, recessed black-glass reel
 * - Layered mechanical housing
 * - Metallic bevels and reflective highlights
 * - Selective cyan edge illumination
 * - Cylindrical digit chambers with physical depth
 * - Bright white digits while idle or spinning
 * - Green/red changed digits after the result settles
 *
 * GAMEPLAY
 * ---------------------------------------------------------------------------
 * idle      -> zeroed reel
 * live      -> reels spin immediately
 * revealing -> reels brake sequentially, left to right
 * result    -> final price remains visible
 *
 * API
 * ---------------------------------------------------------------------------
 * value      Final market price
 * decimals   Number of decimal places
 * phase      Current game phase
 * tease      Optional near-miss landing effect
 * startPrice Price at the beginning of the round
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { formatPrice } from '../utils/formatMoney'
import ReelFrame from './ReelFrame'

/* -------------------------------------------------------------------------- */
/* Mechanical dimensions                                                      */
/* -------------------------------------------------------------------------- */

const CELL_HEIGHT = 60
const DISPLAY_HEIGHT = 76

const SPIN_SPEED = 19
const SPIN_SPEED_STEP = 0.7
const RAMP_MS = 100

const LAND_STAGGER_MS = 80
const LAND_BRAKE_MS = 750
const LAND_MIN_DISTANCE = 3

const SETTLE_MS = 150
const OVERSHOOT = 0.22

const TEASE_HOLD_S = 0.15
const TEASE_CREEP_S = 0.22

const DIGIT_STRIP = Array.from(
  { length: 30 },
  (_, index) => index % 10,
)

/* -------------------------------------------------------------------------- */
/* Digit appearance                                                           */
/* -------------------------------------------------------------------------- */

const DIGIT_TONES = {
  idle: {
    color: '#EAF8FF',
    shadow: [
      '0 0 2px rgba(255,255,255,0.95)',
      '0 0 7px rgba(190,235,255,0.65)',
      '0 0 15px rgba(90,200,255,0.24)',
    ].join(', '),
  },

  up: {
    color: '#39FF88',
    shadow: [
      '0 0 2px rgba(255,255,255,1)',
      '0 0 7px rgba(57,255,136,0.95)',
      '0 0 15px rgba(0,255,102,0.65)',
      '0 0 25px rgba(0,255,102,0.25)',
    ].join(', '),
  },

  down: {
    color: '#FF3158',
    shadow: [
      '0 0 2px rgba(255,255,255,1)',
      '0 0 7px rgba(255,49,88,0.95)',
      '0 0 15px rgba(255,23,68,0.65)',
      '0 0 25px rgba(255,23,68,0.25)',
    ].join(', '),
  },
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mod10(value) {
  return ((value % 10) + 10) % 10
}

function isDigit(char) {
  return /^\d$/.test(char)
}

/**
 * Keep the digits legible on narrow mobile screens.
 *
 * @param {number} digitCount
 * @returns {string}
 */
function getFontSize(digitCount) {
  if (digitCount >= 7) {
    return 'clamp(29px, 9.2vw, 43px)'
  }

  if (digitCount === 6) {
    return 'clamp(33px, 10.2vw, 48px)'
  }

  return 'clamp(37px, 11.5vw, 54px)'
}

/**
 * Compare numeric digit positions from right to left.
 * The decimal separator does not affect alignment.
 *
 * @param {string} current
 * @param {string} previous
 * @returns {boolean[]}
 */
function getChangedDigits(current, previous) {
  const currentDigits = current
    .split('')
    .filter(isDigit)

  const previousDigits = previous
    .split('')
    .filter(isDigit)

  return currentDigits.map((digit, index) => {
    const distanceFromRight =
      currentDigits.length - 1 - index

    const previousIndex =
      previousDigits.length - 1 - distanceFromRight

    return (
      digit !==
      (
        previousIndex >= 0
          ? previousDigits[previousIndex]
          : null
      )
    )
  })
}

/**
 * Accessible description for the current reel state.
 *
 * @param {string} phase
 * @param {string} formatted
 * @returns {string}
 */
function getLabel(phase, formatted) {
  if (phase === 'live') {
    return 'Market result reel spinning'
  }

  if (phase === 'revealing') {
    return 'Market result reel stopping'
  }

  if (phase === 'result') {
    return `Market result ${formatted}`
  }

  return 'Market result reel ready'
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.value
 * @param {number} [props.decimals=2]
 * @param {'idle'|'live'|'revealing'|'result'} [props.phase='idle']
 * @param {boolean} [props.tease=false]
 * @param {number} [props.startPrice]
 * @returns {JSX.Element}
 */
function MarketNumberSpinner({
  value,
  decimals = 2,
  phase = 'idle',
  tease = false,
  startPrice,
}) {
  const formatted = formatPrice(value, decimals)

  // The reel retains the market price's character layout,
  // but shows zeroes before the result is revealed.
  const resting = phase === 'idle' || phase === 'live'

  const shown = resting
    ? formatted.replace(/\d/g, '0')
    : formatted

  const mode =
    phase === 'live'
      ? 'spin'
      : phase === 'revealing'
        ? 'land'
        : 'rest'

  const [settled, setSettled] = useState(false)

  const previousPhase = useRef(phase)

  useEffect(() => {
    if (previousPhase.current !== phase) {
      previousPhase.current = phase

      if (phase === 'live' || phase === 'idle') {
        setSettled(false)
      }
    }
  }, [phase])

  const handleLastReelComplete = useCallback(() => {
    setSettled(true)
  }, [])

  const isMoving =
    phase === 'live' ||
    (phase === 'revealing' && !settled)

  const resultVisible =
    phase === 'result' ||
    (phase === 'revealing' && settled)

  const direction =
    startPrice === undefined
      ? 'idle'
      : value > startPrice
        ? 'up'
        : value < startPrice
          ? 'down'
          : 'idle'

  const changedDigits =
    !resting && startPrice !== undefined
      ? getChangedDigits(
          formatted,
          formatPrice(startPrice, decimals),
        )
      : []

  const chars = shown.split('')
  const numericDigitCount = chars.filter(isDigit).length
  const fontSize = getFontSize(numericDigitCount)

  let digitIndex = -1

  return (
    <div
      role="img"
      aria-label={getLabel(phase, formatted)}
      className="relative w-full px-0 py-1"
    >
      {/* ================================================================ */}
      {/* OUTER MACHINE HOUSING                                            */}
      {/* ================================================================ */}

      <div
        className="
          relative
          mx-auto
          w-full
          rounded-[17px]
          border
          border-black/90
          bg-[#03090e]
          p-[3px]
          shadow-[0_12px_22px_rgba(0,0,0,0.65),0_4px_0_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_0_rgba(0,0,0,0.95)]
        "
      >
        {/* Polished upper metal bevel */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[8%]
            right-[8%]
            top-0
            z-50
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/55
            to-transparent
          "
        />

        {/* Thin cyan reflection across the housing */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[12%]
            right-[12%]
            top-[2px]
            z-50
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-300/55
            to-transparent
            shadow-[0_0_5px_rgba(0,191,255,0.35)]
          "
        />

        {/* Deep inset mounting channel */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[12px]
            border
            border-cyan-300/20
            bg-[#020609]
            p-[2px]
            shadow-[inset_0_5px_9px_rgba(0,0,0,0.95),inset_0_-2px_4px_rgba(255,255,255,0.06),0_0_0_1px_rgba(0,0,0,0.9)]
          "
        >
          {/* Internal glass surface */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[9px]
              border
              border-white/[0.055]
              bg-[linear-gradient(180deg,rgba(13,29,38,0.96)_0%,rgba(2,9,14,0.98)_20%,rgba(0,5,9,0.99)_52%,rgba(4,15,21,0.98)_100%)]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-7px_12px_rgba(0,0,0,0.75)]
            "
          >
            {/* Top glass reflection */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[4%]
                right-[4%]
                top-0
                z-50
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
              "
            />

            {/* Cyan illumination behind the digits */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[18%]
                right-[18%]
                top-1/2
                z-0
                h-10
                -translate-y-1/2
                rounded-full
                bg-cyan-400/[0.045]
                blur-xl
              "
            />

            {/* ======================================================== */}
            {/* REEL FRAME                                                */}
            {/* ======================================================== */}

            <ReelFrame
              height={DISPLAY_HEIGHT}
              tease={tease}
            >
              {chars.map((char, index) => {
                if (!isDigit(char)) {
                  return (
                    <span
                      key={`separator-${index}`}
                      aria-hidden="true"
                      className="
                        relative
                        z-20
                        flex
                        h-full
                        w-[9px]
                        shrink-0
                        items-center
                        justify-center
                        font-black
                        leading-none
                        text-sky-100/75
                      "
                      style={{
                        fontSize,
                        transform: 'translateY(0.3em)',
                        textShadow:
                          '0 0 7px rgba(125,211,252,0.35)',
                      }}
                    >
                      {char}
                    </span>
                  )
                }

                digitIndex += 1

                const isLast =
                  digitIndex === numericDigitCount - 1

                const digitChanged =
                  Boolean(changedDigits[digitIndex])

                const tone =
                  resultVisible &&
                  digitChanged
                    ? direction
                    : 'idle'

                return (
                  <DigitReel
                    key={`digit-${index}`}
                    digit={Number(char)}
                    order={digitIndex}
                    mode={mode}
                    tease={tease && isLast}
                    tone={DIGIT_TONES[tone] ?? DIGIT_TONES.idle}
                    fontSize={fontSize}
                    onComplete={
                      isLast
                        ? handleLastReelComplete
                        : undefined
                    }
                  />
                )
              })}
            </ReelFrame>

            {/* ======================================================== */}
            {/* GLASS / CYLINDER OPTICS                                   */}
            {/* ======================================================== */}

            {/* Darkened edges create a cylindrical lens effect */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-40
                bg-gradient-to-r
                from-black/25
                via-transparent
                to-black/25
              "
            />

            {/* Upper lens shadow */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                z-40
                h-[17px]
                bg-gradient-to-b
                from-black/45
                via-black/[0.12]
                to-transparent
              "
            />

            {/* Lower lens shadow */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-40
                h-[17px]
                bg-gradient-to-t
                from-black/55
                via-black/[0.12]
                to-transparent
              "
            />

            {/* Thin reflection across the reel window */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[3%]
                right-[3%]
                top-[19%]
                z-50
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/[0.10]
                to-transparent
              "
            />

            {/* Cyan-lit inner rails */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-[12%]
                left-0
                top-[12%]
                z-50
                w-px
                bg-gradient-to-b
                from-transparent
                via-cyan-300/70
                to-transparent
                shadow-[0_0_5px_rgba(0,191,255,0.35)]
              "
            />

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-[12%]
                right-0
                top-[12%]
                z-50
                w-px
                bg-gradient-to-b
                from-transparent
                via-cyan-300/50
                to-transparent
                shadow-[0_0_5px_rgba(0,191,255,0.25)]
              "
            />
          </div>
        </div>

        {/* Bottom bevel reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[2px]
            left-[14%]
            right-[14%]
            z-50
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-100/20
            to-transparent
          "
        />

        {/* Small mechanical side details */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[1px]
            top-[36%]
            z-50
            h-[28%]
            w-[2px]
            rounded-full
            bg-cyan-300/70
            shadow-[0_0_6px_rgba(0,191,255,0.55)]
          "
        />

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-[1px]
            top-[36%]
            z-50
            h-[28%]
            w-[2px]
            rounded-full
            bg-cyan-300/60
            shadow-[0_0_6px_rgba(0,191,255,0.45)]
          "
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Individual mechanical digit reel                                           */
/* -------------------------------------------------------------------------- */

/**
 * Each digit runs independently so the reels stop sequentially.
 *
 * @param {object} props
 * @param {number} props.digit
 * @param {number} props.order
 * @param {'rest'|'spin'|'land'} props.mode
 * @param {boolean} props.tease
 * @param {{color:string,shadow:string}} props.tone
 * @param {string} props.fontSize
 * @param {() => void} [props.onComplete]
 * @returns {JSX.Element}
 */
function DigitReel({
  digit,
  order,
  mode,
  tease,
  tone,
  fontSize,
  onComplete,
}) {
  const stripRef = useRef(null)
  const positionRef = useRef(digit)
  const completeRef = useRef(onComplete)
  const completedRef = useRef(false)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const strip = stripRef.current

    if (!strip) {
      return undefined
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    const draw = (position, speed = 0) => {
      const cell = mod10(position)

      const y =
        -(cell + 10) * CELL_HEIGHT +
        (DISPLAY_HEIGHT - CELL_HEIGHT) / 2

      strip.style.transform =
        `translate3d(0, ${y}px, 0)`

      const blur =
        speed > 5
          ? Math.min(1.8, speed / 12)
          : 0

      strip.style.filter =
        blur > 0
          ? `blur(${blur.toFixed(1)}px)`
          : 'none'
    }

    // Resting digits snap cleanly into place.
    if (mode === 'rest') {
      positionRef.current = digit
      completedRef.current = false
      draw(digit)
      return undefined
    }

    // Respect reduced-motion preferences while still completing the result.
    if (reducedMotion) {
      positionRef.current = digit
      draw(digit)

      if (mode === 'land' && !completedRef.current) {
        completedRef.current = true
        completeRef.current?.()
      }

      return undefined
    }

    const speed =
      SPIN_SPEED + order * SPIN_SPEED_STEP

    // --------------------------------------------------------------
    // Free spin
    // --------------------------------------------------------------

    if (mode === 'spin') {
      completedRef.current = false

      const start = positionRef.current
      const startedAt = performance.now()
      const ramp = RAMP_MS / 1000

      let frameId = 0

      const spinFrame = (now) => {
        const elapsed = Math.max(
          0,
          (now - startedAt) / 1000,
        )

        const ramping = elapsed < ramp

        const offset = ramping
          ? (speed * elapsed * elapsed) / (2 * ramp)
          : speed * (elapsed - ramp / 2)

        const currentSpeed = ramping
          ? (speed * elapsed) / ramp
          : speed

        const position = start + offset

        positionRef.current = position
        draw(position, currentSpeed)

        frameId = requestAnimationFrame(spinFrame)
      }

      frameId = requestAnimationFrame(spinFrame)

      return () => cancelAnimationFrame(frameId)
    }

    // --------------------------------------------------------------
    // Sequential braking and landing
    // --------------------------------------------------------------

    completedRef.current = false

    const start = positionRef.current
    const startedAt = performance.now()

    const brakeAt =
      (order * LAND_STAGGER_MS) / 1000

    const brakeTime =
      LAND_BRAKE_MS / 1000

    const teaseSteps = tease ? 1 : 0

    const brakeStart =
      start + speed * brakeAt

    const minTarget =
      brakeStart + LAND_MIN_DISTANCE + teaseSteps

    const target =
      minTarget + mod10(digit - minTarget)

    const brakeTarget =
      target - teaseSteps

    const distance =
      brakeTarget - brakeStart

    const exponent = Math.max(
      1,
      (speed * brakeTime) / distance,
    )

    const holdAt = brakeAt + brakeTime

    const creepAt =
      holdAt + (tease ? TEASE_HOLD_S : 0)

    const settleAt =
      creepAt + (tease ? TEASE_CREEP_S : 0)

    const settle = SETTLE_MS / 1000
    const endAt = settleAt + settle

    let frameId = 0

    const landFrame = (now) => {
      const elapsed = Math.max(
        0,
        (now - startedAt) / 1000,
      )

      let position
      let currentSpeed = 0

      if (elapsed < brakeAt) {
        position = start + speed * elapsed
        currentSpeed = speed
      } else if (elapsed < holdAt) {
        const remaining =
          1 - (elapsed - brakeAt) / brakeTime

        position =
          brakeStart +
          distance * (1 - remaining ** exponent)

        currentSpeed =
          speed * remaining ** (exponent - 1)
      } else if (elapsed < creepAt) {
        position = brakeTarget
      } else if (elapsed < settleAt) {
        const progress =
          (elapsed - creepAt) / TEASE_CREEP_S

        const eased =
          progress < 0.5
            ? 4 * progress ** 3
            : 1 -
              ((-2 * progress + 2) ** 3) / 2

        position =
          brakeTarget + teaseSteps * eased
      } else if (elapsed < endAt) {
        const progress =
          (elapsed - settleAt) / settle

        position =
          target +
          OVERSHOOT *
            Math.sin(Math.PI * progress) *
            (1 - progress)
      } else {
        positionRef.current = digit
        draw(digit)

        if (!completedRef.current) {
          completedRef.current = true
          completeRef.current?.()
        }

        return
      }

      positionRef.current = position
      draw(position, currentSpeed)

      frameId = requestAnimationFrame(landFrame)
    }

    frameId = requestAnimationFrame(landFrame)

    return () => cancelAnimationFrame(frameId)
  }, [mode, digit, order, tease])

  return (
    <span
      aria-hidden="true"
      className="
        relative
        z-20
        block
        min-w-0
        flex-1
        overflow-hidden
      "
      style={{ height: DISPLAY_HEIGHT }}
    >
      {/* Deep sidewalls inside the digit chamber */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-[3px]
          inset-x-[1px]
          z-10
          rounded-[3px]
        "
        style={{
          boxShadow: [
            'inset 2px 0 4px rgba(0,0,0,0.65)',
            'inset -2px 0 4px rgba(0,0,0,0.65)',
            'inset 0 0 5px rgba(0,0,0,0.80)',
          ].join(', '),
        }}
      />

      {/* Moving digit strip */}
      <span
        ref={stripRef}
        className="
          relative
          z-20
          block
          will-change-transform
        "
        style={{ transformStyle: 'preserve-3d' }}
      >
        {DIGIT_STRIP.map((number, index) => (
          <span
            key={index}
            className="
              relative
              grid
              place-items-center
              overflow-hidden
              pb-[1px]
              font-black
              leading-none
              tabular-nums
              antialiased
            "
            style={{
              height: CELL_HEIGHT,
              fontSize,
              color: tone.color,
              textShadow: tone.shadow,
              transform: 'translateZ(0)',
            }}
          >
            {/* Soft reflection across each digit cell */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[20%]
                right-[20%]
                top-[5px]
                h-px
                bg-white/[0.11]
                blur-[0.5px]
              "
            />

            {number}
          </span>
        ))}
      </span>

      {/* Cylindrical shading */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-40
          bg-gradient-to-r
          from-black/25
          via-transparent
          to-black/25
        "
      />

      {/* Upper and lower depth shadows */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-40
          h-[18px]
          bg-gradient-to-b
          from-black/40
          to-transparent
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-40
          h-[18px]
          bg-gradient-to-t
          from-black/50
          to-transparent
        "
      />

      {/* Narrow separator between reel chambers */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[14%]
          right-0
          top-[14%]
          z-50
          w-px
          bg-gradient-to-b
          from-transparent
          via-cyan-200/20
          to-transparent
        "
      />

      {/* Selective blue-lit chamber edge */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[20%]
          left-0
          top-[20%]
          z-50
          w-px
          bg-gradient-to-b
          from-transparent
          via-cyan-300/55
          to-transparent
        "
        style={{
          boxShadow: '0 0 5px rgba(0,191,255,0.30)',
        }}
      />
    </span>
  )
}

export default MarketNumberSpinner