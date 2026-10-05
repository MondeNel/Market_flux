/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Mechanical market-number display for Market Flux.
 *
 * The reel shows the selected market price. It is the hero element of the
 * game screen.
 *
 * BEHAVIOUR
 * ---------------------------------------------------------------------------
 * Idle / live:
 *   The reel shows the live price. Digits update instantly on each market
 *   tick (no spin), so the display is steady and readable.
 *
 * Revealing:
 *   When the round ends, every digit spins once and brakes onto the final
 *   price, left to right. A near-miss tease holds the last digit one step
 *   short before it creeps home.
 *
 * LAYERS
 * ---------------------------------------------------------------------------
 *   ReelFrame     static housing, rails, glass and chevrons
 *   DigitReel     the animating digit strips (this file)
 *
 * RESULT COLOUR BEHAVIOUR
 * ---------------------------------------------------------------------------
 * While the reveal spin runs:
 *   all digits remain neutral.
 *
 * Otherwise:
 *   only digits that changed since the previous price are coloured:
 *
 *   current > previous -> up / green
 *   current < previous -> down / red
 *
 * A large jump (for example switching market) is treated as a new
 * baseline and is not coloured.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import ReelFrame from './ReelFrame'

/* -------------------------------------------------------------------------- */
/* Mechanical timing                                                          */
/* -------------------------------------------------------------------------- */

const CELL_HEIGHT = 60
const DISPLAY_HEIGHT = 84

const SPIN_SPEED = 19
const RAMP_MS = 180
const FIRST_SPIN_MS = 850
const STAGGER_MS = 110
const BRAKE_MS = 260
const SETTLE_MS = 150

const OVERSHOOT = 0.22

/**
 * Price changes larger than this are treated as a new baseline rather
 * than a market movement (for example after switching market).
 */
const JUMP_THRESHOLD = 0.05

/* -------------------------------------------------------------------------- */
/* Reel data                                                                  */
/* -------------------------------------------------------------------------- */

const DIGIT_STRIP = Array.from(
  { length: 30 },
  (_, index) => index % 10,
)

/* -------------------------------------------------------------------------- */
/* Colour themes                                                              */
/* -------------------------------------------------------------------------- */

const DIGIT_TONES = {
  idle: {
    color: '#EAF8FF',
    shadow: `
      0 0 3px rgba(255,255,255,0.9),
      0 0 8px rgba(125,211,252,0.42)
    `,
  },

  up: {
    color: '#39FF88',
    shadow: `
      0 0 3px rgba(255,255,255,1),
      0 0 7px rgba(57,255,136,1),
      0 0 17px rgba(0,255,102,0.9),
      0 0 28px rgba(0,255,102,0.45)
    `,
  },

  down: {
    color: '#FF3158',
    shadow: `
      0 0 3px rgba(255,255,255,1),
      0 0 7px rgba(255,49,88,1),
      0 0 17px rgba(255,23,68,0.9),
      0 0 28px rgba(255,23,68,0.45)
    `,
  },
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mod10(value) {
  return ((value % 10) + 10) % 10
}

function isDigit(char) {
  return /\d/.test(char)
}

/**
 * Digit size scales down as the price gets longer so seven digits
 * (for example 86,538.74) still fit on a 360px screen.
 *
 * @param {number} digitCount
 * @returns {string}
 */
function getFontSize(digitCount) {
  if (digitCount >= 7) {
    return 'clamp(30px, 9.5vw, 42px)'
  }

  if (digitCount === 6) {
    return 'clamp(34px, 10.5vw, 48px)'
  }

  return 'clamp(38px, 12vw, 54px)'
}

/**
 * Converts a formatted market value into a numeric value.
 *
 * @param {string} value
 * @returns {number}
 */
function parseMarketValue(value) {
  return Number(value.replace(/,/g, ''))
}

/**
 * Whether the change between two prices is a baseline reset rather than
 * normal market movement.
 *
 * @param {string} current
 * @param {string} previous
 * @returns {boolean}
 */
function isMarketJump(
  current,
  previous,
) {
  const currentValue =
    parseMarketValue(current)

  const previousValue =
    parseMarketValue(previous)

  if (
    !Number.isFinite(currentValue) ||
    !Number.isFinite(previousValue) ||
    previousValue === 0
  ) {
    return true
  }

  return (
    Math.abs(
      currentValue / previousValue - 1,
    ) > JUMP_THRESHOLD
  )
}

/**
 * Determines complete-market direction.
 *
 * @param {string} current
 * @param {string|null} previous
 * @returns {'up'|'down'|'idle'}
 */
function getMarketDirection(
  current,
  previous,
) {
  if (!previous) {
    return 'idle'
  }

  const currentValue =
    parseMarketValue(current)

  const previousValue =
    parseMarketValue(previous)

  if (
    !Number.isFinite(currentValue) ||
    !Number.isFinite(previousValue)
  ) {
    return 'idle'
  }

  if (currentValue > previousValue) {
    return 'up'
  }

  if (currentValue < previousValue) {
    return 'down'
  }

  return 'idle'
}

/**
 * Finds changed numeric positions.
 *
 * Digits are compared from the right so that formatting characters such as
 * commas and decimal points do not affect alignment.
 *
 * @param {string} current
 * @param {string} previous
 * @returns {boolean[]}
 */
function getChangedDigits(
  current,
  previous,
) {
  const currentDigits =
    current
      .split('')
      .filter(isDigit)

  const previousDigits =
    previous
      .split('')
      .filter(isDigit)

  return currentDigits.map(
    (digit, index) => {
      const distanceFromRight =
        currentDigits.length -
        1 -
        index

      const previousIndex =
        previousDigits.length -
        1 -
        distanceFromRight

      return (
        digit !==
        (previousIndex >= 0
          ? previousDigits[previousIndex]
          : null)
      )
    },
  )
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.value
 * @param {number} props.decimals
 * @param {'up'|'down'|'idle'} [props.direction]
 * @param {'idle'|'live'|'revealing'|'result'} [props.phase]
 * @param {boolean} [props.tease]
 * @returns {JSX.Element}
 */
function MarketNumberSpinner({
  value,
  decimals = 2,
  direction,
  phase = 'idle',
  tease = false,
}) {
  const formatted = useMemo(
    () =>
      value.toLocaleString(
        'en-US',
        {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        },
      ),
    [value, decimals],
  )

  /**
   * Track the previous price.
   *
   * State is adjusted during render (rather than in an effect) so the
   * digits never paint one frame with a stale comparison.
   */
  const [track, setTrack] =
    useState({
      current: formatted,
      previous: null,
    })

  if (track.current !== formatted) {
    setTrack({
      current: formatted,
      previous:
        isMarketJump(
          formatted,
          track.current,
        )
          ? null
          : track.current,
    })
  }

  const previousFormatted =
    track.previous

  /**
   * Track reveal spins.
   *
   * `revealId` increments each time the phase enters 'revealing'. Reels
   * spin when they see a new id. `settledId` catches up when the last
   * reel finishes braking.
   *
   * Incrementing during render means the reels receive the new id in the
   * same commit as the final price, so the result is never flashed before
   * the spin starts.
   */
  const [trackedPhase, setTrackedPhase] =
    useState(phase)

  const [revealId, setRevealId] =
    useState(0)

  const [settledId, setSettledId] =
    useState(0)

  if (phase !== trackedPhase) {
    setTrackedPhase(phase)

    if (phase === 'revealing') {
      setRevealId((id) => id + 1)
    }
  }

  const isSpinning =
    phase === 'revealing' &&
    settledId !== revealId

  /**
   * Movement is derived from the actual market values. The engine's
   * direction is only a fallback.
   */
  const resultDirection =
    getMarketDirection(
      formatted,
      previousFormatted,
    )

  const effectiveDirection =
    resultDirection !== 'idle'
      ? resultDirection
      : direction ?? 'idle'

  const changedDigits =
    previousFormatted
      ? getChangedDigits(
          formatted,
          previousFormatted,
        )
      : []

  const chars =
    formatted.split('')

  const numericDigitCount =
    chars.filter(isDigit).length

  const fontSize =
    getFontSize(numericDigitCount)

  let digitIndex = -1

  return (
    <div
      role="img"
      aria-label={`Market value ${formatted}`}
      className="
        relative
        w-full
        py-1
      "
    >
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
                  w-[10px]
                  shrink-0
                  items-center
                  justify-center
                  font-black
                  leading-none
                  text-sky-100/80
                "
                style={{
                  fontSize,
                  transform:
                    'translateY(0.3em)',
                }}
              >
                {char}
              </span>
            )
          }

          digitIndex += 1

          const isLast =
            digitIndex ===
            numericDigitCount - 1

          const tone =
            !isSpinning &&
            changedDigits[digitIndex]
              ? effectiveDirection
              : 'idle'

          return (
            <DigitReel
              key={`digit-${index}`}
              digit={Number(char)}
              order={digitIndex}
              total={numericDigitCount}
              revealId={revealId}
              tease={tease && isLast}
              tone={
                DIGIT_TONES[tone] ??
                DIGIT_TONES.idle
              }
              fontSize={fontSize}
              onComplete={
                isLast
                  ? () =>
                      setSettledId(
                        revealId,
                      )
                  : undefined
              }
            />
          )
        })}
      </ReelFrame>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Digit reel                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One digit strip.
 *
 * The strip snaps to its digit whenever the digit changes, and plays the
 * spin only when `revealId` has increased since the last run.
 *
 * @param {object} props
 * @param {number} props.digit
 * @param {number} props.order Position among the numeric digits, left to right.
 * @param {number} props.total Number of numeric digits.
 * @param {number} props.revealId Increments to request a reveal spin.
 * @param {boolean} props.tease
 * @param {{color:string,shadow:string}} props.tone
 * @param {string} props.fontSize
 * @param {() => void} [props.onComplete]
 * @returns {JSX.Element}
 */
function DigitReel({
  digit,
  order,
  total,
  revealId,
  tease,
  tone,
  fontSize,
  onComplete,
}) {
  const stripRef =
    useRef(null)

  const positionRef =
    useRef(digit)

  const completeRef =
    useRef(onComplete)

  const handledRevealRef =
    useRef(revealId)

  useEffect(() => {
    completeRef.current =
      onComplete
  }, [onComplete])

  useEffect(() => {
    const strip =
      stripRef.current

    if (!strip) {
      return undefined
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    const draw = (
      position,
      speed = 0,
    ) => {
      const cell =
        mod10(position)

      strip.style.transform =
        `translate3d(
          0,
          ${-(cell + 10) * CELL_HEIGHT +
            (DISPLAY_HEIGHT - CELL_HEIGHT) / 2}px,
          0
        )`

      const blur =
        speed > 5
          ? Math.min(
              2.2,
              speed / 10,
            )
          : 0

      strip.style.filter =
        blur > 0
          ? `blur(${blur.toFixed(1)}px)`
          : 'none'
    }

    const spinRequested =
      revealId !==
      handledRevealRef.current

    handledRevealRef.current =
      revealId

    /**
     * Snap: ordinary price updates, first paint, and reduced motion.
     */
    if (
      !spinRequested ||
      reducedMotion
    ) {
      positionRef.current =
        digit

      draw(digit)

      if (
        spinRequested &&
        order === total - 1
      ) {
        completeRef.current?.()
      }

      return undefined
    }

    /**
     * Reveal spin.
     */
    const start =
      positionRef.current

    const startedAt =
      performance.now()

    const ramp =
      RAMP_MS / 1000

    const spin =
      (
        FIRST_SPIN_MS +
        order * STAGGER_MS
      ) / 1000

    const brake =
      BRAKE_MS / 1000

    const settle =
      SETTLE_MS / 1000

    const teaseHold =
      tease ? 0.15 : 0

    const teaseCreep =
      tease ? 0.22 : 0

    const ahead =
      mod10(digit - start)

    const minimumTurns =
      tease ? 1 : 0

    const effective =
      spin -
      ramp / 2 +
      brake / 3

    const turns =
      Math.max(
        minimumTurns,
        Math.round(
          (
            SPIN_SPEED *
              effective -
            ahead
          ) / 10,
        ),
      )

    const travel =
      ahead +
      turns * 10

    const brakeEnd =
      travel -
      (tease ? 1 : 0)

    const speed =
      brakeEnd / effective

    const spinEnd =
      speed *
      (spin - ramp / 2)

    const brakeDistance =
      (speed * brake) / 3

    const brakeAt =
      spin

    const holdAt =
      brakeAt + brake

    const creepAt =
      holdAt + teaseHold

    const settleAt =
      creepAt + teaseCreep

    const endAt =
      settleAt + settle

    let frameId = 0

    const frame = (now) => {
      const elapsed =
        Math.max(
          0,
          (now - startedAt) / 1000,
        )

      let offset = 0
      let currentSpeed = 0

      if (elapsed < ramp) {
        offset =
          (
            speed *
            elapsed *
            elapsed
          ) /
          (2 * ramp)

        currentSpeed =
          (speed * elapsed) /
          ramp
      } else if (
        elapsed < brakeAt
      ) {
        offset =
          speed *
          (elapsed - ramp / 2)

        currentSpeed = speed
      } else if (
        elapsed < holdAt
      ) {
        const progress =
          (
            elapsed - brakeAt
          ) / brake

        offset =
          spinEnd +
          brakeDistance *
            (
              1 -
              (1 - progress) ** 3
            )

        currentSpeed =
          speed *
          (1 - progress) ** 2
      } else if (
        elapsed < creepAt
      ) {
        offset = brakeEnd
      } else if (
        elapsed < settleAt
      ) {
        const progress =
          (
            elapsed - creepAt
          ) /
          Math.max(
            teaseCreep,
            0.001,
          )

        const eased =
          progress < 0.5
            ? 4 * progress ** 3
            : 1 -
              ((-2 * progress + 2) ** 3) /
                2

        offset =
          brakeEnd +
          (tease ? 1 : 0) *
            eased
      } else if (
        elapsed < endAt
      ) {
        const progress =
          (
            elapsed - settleAt
          ) / settle

        offset =
          travel +
          OVERSHOOT *
            Math.sin(
              Math.PI *
                progress,
            ) *
            (1 - progress)
      } else {
        positionRef.current =
          digit

        draw(digit)

        completeRef.current?.()

        return
      }

      const position =
        start + offset

      positionRef.current =
        mod10(position)

      draw(
        position,
        currentSpeed,
      )

      frameId =
        requestAnimationFrame(frame)
    }

    frameId =
      requestAnimationFrame(frame)

    return () =>
      cancelAnimationFrame(
        frameId,
      )
  }, [
    digit,
    order,
    total,
    revealId,
    tease,
  ])

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
      style={{
        height: DISPLAY_HEIGHT,
      }}
    >
      {/* -------------------------------------------------------------- */}
      {/* Individual reel chamber                                        */}
      {/* -------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-[3px]
          inset-x-[1px]
          z-10
          rounded-[4px]
        "
        style={{
          boxShadow: `
            inset 2px 0 4px rgba(0,0,0,0.50),
            inset -2px 0 4px rgba(0,0,0,0.55),
            inset 0 0 6px rgba(0,0,0,0.85)
          `,
        }}
      />

      {/* -------------------------------------------------------------- */}
      {/* Subtle reel separator                                           */}
      {/* -------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[13%]
          right-0
          top-[13%]
          z-30
          w-px
          bg-gradient-to-b
          from-transparent
          via-cyan-400/20
          to-transparent
        "
      />

      {/* -------------------------------------------------------------- */}
      {/* Reel strip                                                      */}
      {/* -------------------------------------------------------------- */}

      <span
        ref={stripRef}
        className="
          relative
          z-20
          block
          will-change-transform
        "
        style={{
          transformStyle:
            'preserve-3d',
        }}
      >
        {DIGIT_STRIP.map(
          (number, index) => (
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
                textShadow:
                  tone.shadow,
                transform:
                  'translateZ(0)',
              }}
            >
              {/* Digit glass highlight */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-[18%]
                  right-[18%]
                  top-[5px]
                  h-px
                  bg-white/10
                  blur-[0.5px]
                "
              />

              {number}
            </span>
          ),
        )}
      </span>

      {/* -------------------------------------------------------------- */}
      {/* Cylindrical lighting                                           */}
      {/* -------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-40
          bg-gradient-to-r
          from-black/[0.22]
          via-transparent
          to-black/[0.20]
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
          h-[22px]
          bg-gradient-to-b
          from-black/35
          via-black/[0.08]
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
          h-[22px]
          bg-gradient-to-t
          from-black/40
          via-black/[0.08]
          to-transparent
        "
      />

      {/* -------------------------------------------------------------- */}
      {/* Centre reflection                                               */}
      {/* -------------------------------------------------------------- */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[16%]
          right-[16%]
          top-1/2
          z-50
          h-px
          -translate-y-1/2
          bg-white/[0.06]
        "
      />

      {/* -------------------------------------------------------------- */}
      {/* Mechanical blue edge                                           */}
      {/* -------------------------------------------------------------- */}

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
          via-cyan-400/65
          to-transparent
        "
        style={{
          boxShadow:
            '0 0 5px rgba(0,191,255,0.35)',
        }}
      />
    </span>
  )
}

export default MarketNumberSpinner