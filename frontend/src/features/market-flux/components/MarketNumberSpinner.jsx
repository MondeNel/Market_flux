/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Mechanical 3D liquid-glass result reel for Market Flux.
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
const DISPLAY_HEIGHT = 80

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
      '0 0 4px rgba(255,255,255,0.95)',
      '0 0 12px rgba(125,211,252,0.85)',
      '0 0 25px rgba(0,191,255,0.5)',
    ].join(', '),
  },

  up: {
    color: '#39FF88',
    shadow: [
      '0 0 4px rgba(255,255,255,1)',
      '0 0 12px rgba(57,255,136,0.95)',
      '0 0 25px rgba(0,255,102,0.65)',
      '0 0 40px rgba(0,255,102,0.3)',
    ].join(', '),
  },

  down: {
    color: '#FF3158',
    shadow: [
      '0 0 4px rgba(255,255,255,1)',
      '0 0 12px rgba(255,49,88,0.95)',
      '0 0 25px rgba(255,23,68,0.65)',
      '0 0 40px rgba(255,23,68,0.3)',
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

function getFontSize(digitCount) {
  if (digitCount >= 7) {
    return 'clamp(28px, 8.5vw, 42px)'
  }

  if (digitCount === 6) {
    return 'clamp(32px, 9.5vw, 46px)'
  }

  return 'clamp(36px, 11vw, 52px)'
}

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

function MarketNumberSpinner({
  value,
  decimals = 2,
  phase = 'idle',
  tease = false,
  startPrice,
}) {
  const formatted = formatPrice(value, decimals)

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
      className="relative w-full px-2 py-2"
    >
      {/* ================================================================ */}
      {/* HEAVY SCI-FI CYLINDRICAL MACHINE CASING                           */}
      {/* ================================================================ */}

      <div
        className="
          relative
          mx-auto
          w-full
          rounded-[28px]
          border
          border-cyan-400/45
          bg-[linear-gradient(180deg,#0a1b2a_0%,#02060a_50%,#040d16_100%)]
          p-[6px]
          shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_30px_rgba(0,191,255,0.25),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.9)]
        "
      >
        {/* Left and right heavy mechanical barrel end-caps */}
        <div
          aria-hidden="true"
          className="
            absolute
            -left-3
            top-1/2
            z-30
            h-[88%]
            w-5
            -translate-y-1/2
            rounded-l-xl
            border
            border-cyan-300/50
            bg-[linear-gradient(90deg,#041522_0%,#1a4c6e_50%,#020910_100%)]
            shadow-[0_0_15px_rgba(0,191,255,0.5),inset_1px_0_3px_rgba(255,255,255,0.6)]
          "
        >
          <div className="absolute inset-y-1 left-1.5 w-0.5 bg-cyan-200/40 rounded-full" />
        </div>

        <div
          aria-hidden="true"
          className="
            absolute
            -right-3
            top-1/2
            z-30
            h-[88%]
            w-5
            -translate-y-1/2
            rounded-r-xl
            border
            border-cyan-300/50
            bg-[linear-gradient(90deg,#020910_0%,#1a4c6e_50%,#041522_100%)]
            shadow-[0_0_15px_rgba(0,191,255,0.5),inset_-1px_0_3px_rgba(255,255,255,0.6)]
          "
        >
          <div className="absolute inset-y-1 right-1.5 w-0.5 bg-cyan-200/40 rounded-full" />
        </div>

        {/* Polished upper metal specular arc */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-8
            top-0
            z-50
            h-[2px]
            bg-gradient-to-r
            from-transparent
            via-cyan-200/80
            to-transparent
            shadow-[0_0_8px_rgba(0,191,255,0.8)]
          "
        />

        {/* Deep recessed window channel */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[20px]
            border
            border-cyan-400/40
            bg-black/90
            p-[3px]
            shadow-[inset_0_8px_16px_rgba(0,0,0,0.95),inset_0_-4px_8px_rgba(0,191,255,0.15)]
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[17px]
              border
              border-white/10
              bg-[linear-gradient(180deg,rgba(5,15,24,0.95)_0%,rgba(1,4,7,0.99)_50%,rgba(4,15,24,0.95)_100%)]
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]
            "
          >
            {/* Ambient cyan backlighting glow behind the digits */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-12
                top-1/2
                z-0
                h-12
                -translate-y-1/2
                rounded-full
                bg-cyan-400/[0.08]
                blur-2xl
              "
            />

            {/* ======================================================== */}
            {/* REEL FRAME                                               */}
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
                        w-[12px]
                        shrink-0
                        items-center
                        justify-center
                        font-black
                        leading-none
                        text-cyan-200
                      "
                      style={{
                        fontSize,
                        transform: 'translateY(0.2em)',
                        textShadow: '0 0 10px rgba(0,191,255,0.8)',
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

            {/* Glass optics and strong top/bottom shadows for cylinder depth */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-40
                bg-gradient-to-r
                from-black/50
                via-transparent
                to-black/50
              "
            />

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                z-40
                h-[24px]
                bg-gradient-to-b
                from-black/90
                via-black/40
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
                h-[24px]
                bg-gradient-to-t
                from-black/90
                via-black/40
                to-transparent
              "
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Individual mechanical digit reel                                           */
/* -------------------------------------------------------------------------- */

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

    if (mode === 'rest') {
      positionRef.current = digit
      completedRef.current = false
      draw(digit)
      return undefined
    }

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
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-1
          inset-x-0
          z-10
        "
        style={{
          boxShadow: [
            'inset 3px 0 6px rgba(0,0,0,0.85)',
            'inset -3px 0 6px rgba(0,0,0,0.85)',
          ].join(', '),
        }}
      />

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
            {number}
          </span>
        ))}
      </span>
    </span>
  )
}

export default MarketNumberSpinner