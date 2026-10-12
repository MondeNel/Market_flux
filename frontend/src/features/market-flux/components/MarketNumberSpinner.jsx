/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Seven-drum mechanical market result spinner. ReelFrame owns the external
 * cylinder; this component owns only the digit drums and their animation.
 *
 * Phases: idle -> live -> revealing -> result.
 * Only digits changed from startPrice receive the final direction colour.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { formatPrice } from '../utils/formatMoney'
import ReelFrame from './ReelFrame'

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
const DIGIT_STRIP = Array.from({ length: 30 }, (_, index) => index % 10)

const DIGIT_TONES = {
  idle: {
    color: '#EAF8FF',
    shadow: '0 0 5px rgba(255,255,255,.95), 0 0 15px rgba(125,211,252,.85), 0 0 28px rgba(0,191,255,.5)',
  },
  up: {
    color: '#39FF88',
    shadow: '0 0 5px rgba(255,255,255,.9), 0 0 14px rgba(57,255,136,.95), 0 0 28px rgba(0,255,102,.65)',
  },
  down: {
    color: '#FF3158',
    shadow: '0 0 5px rgba(255,255,255,.9), 0 0 14px rgba(255,49,88,.95), 0 0 28px rgba(255,23,68,.65)',
  },
}

const mod10 = (value) => ((value % 10) + 10) % 10
const isDigit = (char) => /^\d$/.test(char)

function getChangedDigits(current, previous) {
  const currentDigits = [...current].filter(isDigit)
  const previousDigits = [...previous].filter(isDigit)
  return currentDigits.map((digit, index) => {
    const rightOffset = currentDigits.length - 1 - index
    const oldIndex = previousDigits.length - 1 - rightOffset
    return digit !== (oldIndex >= 0 ? previousDigits[oldIndex] : null)
  })
}

function getLabel(phase, formatted) {
  if (phase === 'live') return 'Market result reel spinning'
  if (phase === 'revealing') return 'Market result reel stopping'
  if (phase === 'result') return `Market result ${formatted}`
  return 'Market result reel ready'
}

/**
 * @param {{value: number, decimals?: number, phase?: string,
 * tease?: boolean, startPrice?: number}} props
 */
function MarketNumberSpinner({
  value,
  decimals = 2,
  phase = 'idle',
  tease = false,
  startPrice,
}) {
  const formatted = formatPrice(value, decimals)
  const resting = phase === 'idle' || phase === 'live'
  const shown = resting ? formatted.replace(/\d/g, '0') : formatted
  const mode = phase === 'live' ? 'spin' : phase === 'revealing' ? 'land' : 'rest'

  const [settled, setSettled] = useState(false)
  const previousPhase = useRef(phase)

  useEffect(() => {
    if (previousPhase.current !== phase) {
      previousPhase.current = phase
      if (phase === 'live' || phase === 'idle') setSettled(false)
    }
  }, [phase])

  const handleLastReelComplete = useCallback(() => setSettled(true), [])
  const resultVisible = phase === 'result' || (phase === 'revealing' && settled)

  const direction = startPrice === undefined
    ? 'idle'
    : value > startPrice ? 'up' : value < startPrice ? 'down' : 'idle'

  const changedDigits = !resting && startPrice !== undefined
    ? getChangedDigits(formatted, formatPrice(startPrice, decimals))
    : []

  const chars = [...shown]
  const digitCount = chars.filter(isDigit).length
  const fontSize = digitCount >= 8
    ? 'clamp(21px, 5.9vw, 64px)'
    : digitCount >= 7
      ? 'clamp(25px, 7vw, 76px)'
      : 'clamp(28px, 8vw, 82px)'

  let digitIndex = -1

  return (
    <div
      role="img"
      aria-label={getLabel(phase, formatted)}
      className="relative w-full min-w-0"
    >
      <ReelFrame height={DISPLAY_HEIGHT} tease={tease}>
        <div className="relative flex h-full w-full min-w-0 items-stretch justify-center overflow-hidden">
          {chars.map((char, index) => {
            if (!isDigit(char)) {
              return (
                <span
                  key={`separator-${index}`}
                  aria-hidden="true"
                  className="relative z-20 flex h-full w-[clamp(5px,1.5vw,15px)] shrink-0 items-center justify-center font-black text-cyan-100"
                  style={{
                    fontSize: `calc(${fontSize} * .7)`,
                    textShadow: '0 0 12px rgba(0,220,255,.9)',
                  }}
                >
                  {char}
                </span>
              )
            }

            digitIndex += 1
            const isLast = digitIndex === digitCount - 1
            const toneKey = resultVisible && changedDigits[digitIndex]
              ? direction
              : 'idle'

            return (
              <DigitReel
                key={`digit-${index}`}
                digit={Number(char)}
                order={digitIndex}
                mode={mode}
                tease={tease && isLast}
                tone={DIGIT_TONES[toneKey] ?? DIGIT_TONES.idle}
                fontSize={fontSize}
                onComplete={isLast ? handleLastReelComplete : undefined}
              />
            )
          })}
        </div>
      </ReelFrame>
    </div>
  )
}

/** One independently spinning, metallic cylindrical digit drum. */
function DigitReel({ digit, order, mode, tease, tone, fontSize, onComplete }) {
  const stripRef = useRef(null)
  const positionRef = useRef(digit)
  const completeRef = useRef(onComplete)
  const completedRef = useRef(false)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return undefined

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const draw = (position, speed = 0) => {
      const y = -(mod10(position) + 10) * CELL_HEIGHT + (DISPLAY_HEIGHT - CELL_HEIGHT) / 2
      strip.style.transform = `translate3d(0, ${y}px, 0)`
      const blur = speed > 5 ? Math.min(1.8, speed / 12) : 0
      strip.style.filter = blur ? `blur(${blur.toFixed(1)}px)` : 'none'
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

    const speed = SPIN_SPEED + order * SPIN_SPEED_STEP
    let frameId = 0

    if (mode === 'spin') {
      completedRef.current = false
      const start = positionRef.current
      const startedAt = performance.now()
      const ramp = RAMP_MS / 1000

      const spinFrame = (now) => {
        const elapsed = Math.max(0, (now - startedAt) / 1000)
        const ramping = elapsed < ramp
        const offset = ramping
          ? speed * elapsed * elapsed / (2 * ramp)
          : speed * (elapsed - ramp / 2)
        const currentSpeed = ramping ? speed * elapsed / ramp : speed
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
    const brakeAt = order * LAND_STAGGER_MS / 1000
    const brakeTime = LAND_BRAKE_MS / 1000
    const teaseSteps = tease ? 1 : 0
    const brakeStart = start + speed * brakeAt
    const minTarget = brakeStart + LAND_MIN_DISTANCE + teaseSteps
    const target = minTarget + mod10(digit - minTarget)
    const brakeTarget = target - teaseSteps
    const distance = brakeTarget - brakeStart
    const exponent = Math.max(1, speed * brakeTime / distance)
    const holdAt = brakeAt + brakeTime
    const creepAt = holdAt + (tease ? TEASE_HOLD_S : 0)
    const settleAt = creepAt + (tease ? TEASE_CREEP_S : 0)
    const settle = SETTLE_MS / 1000
    const endAt = settleAt + settle

    const landFrame = (now) => {
      const elapsed = Math.max(0, (now - startedAt) / 1000)
      let position
      let currentSpeed = 0

      if (elapsed < brakeAt) {
        position = start + speed * elapsed
        currentSpeed = speed
      } else if (elapsed < holdAt) {
        const remaining = 1 - (elapsed - brakeAt) / brakeTime
        position = brakeStart + distance * (1 - remaining ** exponent)
        currentSpeed = speed * remaining ** (exponent - 1)
      } else if (elapsed < creepAt) {
        position = brakeTarget
      } else if (elapsed < settleAt) {
        const progress = (elapsed - creepAt) / TEASE_CREEP_S
        const eased = progress < .5
          ? 4 * progress ** 3
          : 1 - ((-2 * progress + 2) ** 3) / 2
        position = brakeTarget + teaseSteps * eased
      } else if (elapsed < endAt) {
        const progress = (elapsed - settleAt) / settle
        position = target + OVERSHOOT * Math.sin(Math.PI * progress) * (1 - progress)
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
      className="relative isolate block h-full min-w-0 flex-1 overflow-hidden border-x border-cyan-200/20"
      style={{
        background: 'linear-gradient(90deg,#00050a 0%,#071b2a 12%,#12374b 24%,#071b2a 45%,#020b14 76%,#000409 100%)',
        boxShadow: 'inset 5px 0 8px rgba(0,0,0,.95), inset -5px 0 8px rgba(0,0,0,.95), 1px 0 0 rgba(75,220,255,.4)',
      }}
    >
      {/* Polished vertical drum ribs */}
      <span className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[3px] bg-gradient-to-r from-cyan-100/55 via-cyan-400/25 to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[3px] bg-gradient-to-l from-cyan-100/45 via-cyan-400/20 to-transparent" />

      {/* Curved drum reflection and central light window */}
      <span className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[29%] bg-gradient-to-b from-black/90 via-cyan-900/30 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[29%] bg-gradient-to-t from-black/90 via-cyan-900/30 to-transparent" />
      <span className="pointer-events-none absolute inset-x-[9%] top-[8%] z-30 h-[2px] rounded-full bg-cyan-100/45 shadow-[0_0_8px_rgba(0,220,255,.7)]" />
      <span className="pointer-events-none absolute inset-x-[9%] bottom-[8%] z-30 h-[2px] rounded-full bg-cyan-300/45 shadow-[0_0_8px_rgba(0,220,255,.7)]" />
      <span className="pointer-events-none absolute inset-y-[20%] left-[14%] z-30 w-[8%] bg-gradient-to-r from-white/10 to-transparent blur-[2px]" />

      <span ref={stripRef} className="relative z-20 block will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        {DIGIT_STRIP.map((number, index) => (
          <span
            key={index}
            className="relative grid place-items-center overflow-hidden font-black leading-none tabular-nums antialiased"
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
