/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Slot-machine price display for Market Flux.
 *
 * Each digit behaves like a mechanical market-data reel.
 *
 * Colour behaviour:
 * - All digits remain neutral while the reels are spinning.
 * - Once the reels finish, only digits that changed from the previous
 *   completed market value receive the directional colour.
 * - Changed digits are green when the complete market value moved up.
 * - Changed digits are red when the complete market value moved down.
 * - Unchanged digits always remain neutral.
 *
 * Example:
 *   86,773,04 -> 86,774,07
 *
 *   86,77  -> neutral
 *   4      -> green
 *   0      -> neutral
 *   7      -> green
 *
 * The market direction is still determined from the complete numeric
 * value, never from individual digit comparisons.
 */

import { useEffect, useRef, useState } from 'react'

const CELL_HEIGHT = 30
const WINDOW_HEIGHT = 52
const DRUM_OFFSET = (WINDOW_HEIGHT - CELL_HEIGHT) / 2

// Timeline, in milliseconds from the moment the price changes.
const SPIN_SPEED = 20
const RAMP_MS = 200
const FIRST_SPIN_MS = 1000
const STAGGER_MS = 240
const BRAKE_MS = 260
const SETTLE_MS = 160
const OVERSHOOT = 0.3

// Near-miss tease on the last reel.
const TEASE_EXTRA_SPIN_MS = 250
const TEASE_HOLD_MS = 150
const TEASE_CREEP_MS = 250
const TEASE_CREEP_CELLS = 1

const FADE_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.16) 14%, #000 36%, #000 64%, rgba(0,0,0,0.16) 86%, transparent 100%)'

// Three copies of 0 to 9 so the strip can wrap without a visible seam.
const STRIP = Array.from({ length: 30 }, (_, i) => i % 10)

const TONES = {
  idle: {
    className:
      'text-sky-100 [text-shadow:0_0_8px_rgba(120,220,255,0.85)]',
  },

  up: {
    className:
      'text-emerald-300 [text-shadow:0_0_10px_rgba(52,211,153,0.95)]',
  },

  down: {
    className:
      'text-rose-300 [text-shadow:0_0_10px_rgba(251,113,133,0.95)]',
  },
}

const mod10 = (n) => ((n % 10) + 10) % 10

/**
 * Compare two complete market values.
 *
 * This intentionally compares the entire number rather than individual
 * digits. This determines the single directional result used to colour
 * changed digits.
 *
 * @param {string} currentFormatted Current formatted market value.
 * @param {string|null} previousFormatted Previous formatted market value.
 * @returns {'idle'|'up'|'down'}
 */
function getResultTone(
  currentFormatted,
  previousFormatted,
) {
  if (!previousFormatted) {
    return 'idle'
  }

  const currentValue = Number(
    currentFormatted.replace(/,/g, ''),
  )

  const previousValue = Number(
    previousFormatted.replace(/,/g, ''),
  )

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
 * Determine which digit positions changed between two formatted values.
 *
 * Digits are compared from the RIGHT so that changes remain correctly
 * aligned even when the number gains or loses digits.
 *
 * Formatting characters such as commas and decimal points are ignored.
 *
 * Example:
 *
 *   previous: 86,773.04
 *   current:  86,774.07
 *
 * Changed positions:
 *   4 -> 4? unchanged
 *   3 -> 4 changed
 *   0 -> 0 unchanged
 *   4 -> 7 changed
 *
 * @param {string} currentFormatted Current formatted market value.
 * @param {string|null} previousFormatted Previous formatted market value.
 * @returns {boolean[]} Array aligned with current digit positions.
 */
function getChangedDigits(
  currentFormatted,
  previousFormatted,
) {
  const currentDigits = currentFormatted
    .split('')
    .filter((char) => /\d/.test(char))

  const previousDigits = previousFormatted
    ? previousFormatted
        .split('')
        .filter((char) => /\d/.test(char))
    : []

  const changed = Array(currentDigits.length).fill(false)

  /**
   * Compare from the right.
   *
   * This keeps decimal/fractional digits and integer digits aligned
   * when the formatted number changes length.
   */
  for (
    let currentIndex = currentDigits.length - 1;
    currentIndex >= 0;
    currentIndex -= 1
  ) {
    const previousIndex =
      previousDigits.length -
      1 -
      (currentDigits.length - 1 - currentIndex)

    const currentDigit =
      currentDigits[currentIndex]

    const previousDigit =
      previousIndex >= 0
        ? previousDigits[previousIndex]
        : null

    changed[currentIndex] =
      currentDigit !== previousDigit
  }

  return changed
}

/**
 * Slot-machine market number spinner.
 *
 * @param {object} props
 * @param {number} props.value Price to display.
 * @param {number} props.decimals Digits after the decimal point.
 * @param {'idle'|'up'|'down'} [props.tone='idle'] Fallback tone.
 * @param {boolean} [props.tease=false] Tease the last reel on this reveal.
 * @returns {JSX.Element}
 */
function MarketNumberSpinner({
  value,
  decimals,
  tone = 'idle',
  tease = false,
}) {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  /**
   * The previous completed price.
   *
   * This is intentionally kept separate from the current formatted value
   * so the result direction and changed digits are calculated against
   * the previous completed market value.
   */
  const [previousFormatted, setPreviousFormatted] =
    useState(null)

  /**
   * Value currently being revealed by the reels.
   */
  const [tracked, setTracked] = useState(formatted)

  /**
   * Increments whenever a new market value needs to spin.
   */
  const [epoch, setEpoch] = useState(0)

  /**
   * Controls when the directional result colour becomes visible.
   *
   * false = neutral while spinning
   * true  = colour only the changed digits
   */
  const [resultVisible, setResultVisible] =
    useState(false)

  if (formatted !== tracked) {
    setPreviousFormatted(tracked)
    setTracked(formatted)
    setEpoch(epoch + 1)
    setResultVisible(false)
  }

  const resultTone =
    getResultTone(
      formatted,
      previousFormatted,
    ) || tone

  /**
   * Calculate which digit positions actually changed.
   *
   * The result is aligned with the digit-only array, not the original
   * formatted string containing commas and decimal points.
   */
  const changedDigits =
    getChangedDigits(
      formatted,
      previousFormatted,
    )

  const chars = formatted.split('')

  const digitCount = chars.filter(
    (char) => /\d/.test(char),
  ).length

  let digitIndex = -1

  return (
    <div
      role="img"
      aria-label={`Price ${formatted}`}
      className="flex w-full items-center justify-center"
    >
      {chars.map((char, index) => {
        // Key from the right so each digit keeps its drum when
        // the number grows or shrinks.
        const fromRight =
          chars.length - 1 - index

        if (!/\d/.test(char)) {
          return (
            <span
              key={`s${fromRight}`}
              aria-hidden="true"
              className="
                w-[9px]
                shrink-0
                self-end
                pb-[13px]
                text-center
                text-[clamp(20px,6.2vw,26px)]
                font-black
                leading-none
                text-sky-100
                [text-shadow:0_0_8px_rgba(120,220,255,0.85)]
              "
            >
              {char}
            </span>
          )
        }

        digitIndex += 1

        /**
         * A digit receives the result colour only when:
         *
         * 1. The reels have finished.
         * 2. The complete market moved up or down.
         * 3. This specific digit changed.
         *
         * Otherwise it remains neutral.
         */
        const digitChanged =
          changedDigits[digitIndex]

        const digitTone =
          resultVisible && digitChanged
            ? resultTone
            : 'idle'

        const digitToneClass =
          TONES[digitTone]?.className ||
          TONES.idle.className

        return (
          <Drum
            key={`d${fromRight}`}
            digit={Number(char)}
            order={digitIndex}
            isLast={
              digitIndex === digitCount - 1
            }
            tease={tease}
            epoch={epoch}
            toneClass={digitToneClass}
            onComplete={
              digitIndex === digitCount - 1
                ? () => setResultVisible(true)
                : undefined
            }
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
 * @param {number} props.order Position among the digits.
 * @param {boolean} props.isLast Whether this is the right-most digit.
 * @param {boolean} props.tease Whether this reveal is a near miss.
 * @param {number} props.epoch Increments on every price change.
 * @param {string} props.toneClass Colour classes for this digit.
 * @param {Function} [props.onComplete] Called when this reel finishes.
 * @returns {JSX.Element}
 */
function Drum({
  digit,
  order,
  isLast,
  tease,
  epoch,
  toneClass,
  onComplete,
}) {
  const stripRef = useRef(null)
  const positionRef = useRef(digit)

  const teaseRef = useRef(tease)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    teaseRef.current = tease
  }, [tease])

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const strip = stripRef.current

    if (!strip) {
      return undefined
    }

    let lastBlur = ''

    const draw = (position, speed) => {
      const cell = mod10(position)

      strip.style.transform =
        `translateY(${DRUM_OFFSET - (cell + 10) * CELL_HEIGHT}px)`

      const blur =
        speed > 5
          ? Math.min(2.4, speed / 10).toFixed(1)
          : ''

      if (blur !== lastBlur) {
        strip.style.filter = blur
          ? `blur(${blur}px)`
          : 'none'

        lastBlur = blur
      }
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    /**
     * First paint or reduced motion:
     * show the final digit immediately.
     *
     * On a real reveal with reduced motion, the last reel still
     * announces completion so the result colour can appear.
     */
    if (epoch === 0 || reduceMotion) {
      positionRef.current = digit
      draw(digit, 0)

      if (epoch > 0 && isLast) {
        onCompleteRef.current?.()
      }

      return undefined
    }

    const startPosition = positionRef.current
    const startTime = performance.now()

    const teasing =
      isLast && teaseRef.current

    const ramp = RAMP_MS / 1000

    const spinSeconds =
      (
        FIRST_SPIN_MS +
        order * STAGGER_MS +
        (teasing ? TEASE_EXTRA_SPIN_MS : 0)
      ) / 1000

    const brake = BRAKE_MS / 1000
    const settle = SETTLE_MS / 1000

    const hold = teasing
      ? TEASE_HOLD_MS / 1000
      : 0

    const creepSeconds = teasing
      ? TEASE_CREEP_MS / 1000
      : 0

    const creepCells = teasing
      ? TEASE_CREEP_CELLS
      : 0

    const effectiveSeconds =
      spinSeconds -
      ramp / 2 +
      brake / 3

    const ahead = mod10(
      digit - startPosition,
    )

    const minTurns = teasing ? 1 : 0

    const wholeTurns = Math.max(
      minTurns,
      Math.round(
        (
          SPIN_SPEED * effectiveSeconds -
          ahead
        ) / 10,
      ),
    )

    const travel =
      ahead + 10 * wholeTurns

    const brakeEnd =
      travel - creepCells

    const speed =
      brakeEnd / effectiveSeconds

    const spinEndPosition =
      speed * (spinSeconds - ramp / 2)

    const brakeDistance =
      (speed * brake) / 3

    const brakeAt = spinSeconds
    const holdAt = brakeAt + brake
    const creepAt = holdAt + hold
    const settleAt = creepAt + creepSeconds
    const endAt = settleAt + settle

    let frameId = 0

    const frame = (now) => {
      const t = Math.max(
        0,
        (now - startTime) / 1000,
      )

      let offset
      let currentSpeed = 0

      if (t < ramp) {
        offset =
          (speed * t * t) /
          (2 * ramp)

        currentSpeed =
          (speed * t) / ramp
      } else if (t < brakeAt) {
        offset =
          speed * (t - ramp / 2)

        currentSpeed = speed
      } else if (t < holdAt) {
        const u =
          (t - brakeAt) / brake

        offset =
          spinEndPosition +
          brakeDistance *
            (1 - (1 - u) ** 3)

        currentSpeed =
          speed * (1 - u) ** 2
      } else if (t < creepAt) {
        offset = brakeEnd
      } else if (t < settleAt) {
        const u =
          (t - creepAt) /
          creepSeconds

        const eased =
          u < 0.5
            ? 4 * u ** 3
            : 1 -
              (-2 * u + 2) ** 3 / 2

        offset =
          brakeEnd +
          creepCells * eased
      } else if (t < endAt) {
        const u =
          (t - settleAt) / settle

        offset =
          travel +
          OVERSHOOT *
            Math.sin(Math.PI * u) *
            (1 - u)
      } else {
        positionRef.current = digit
        draw(digit, 0)

        /**
         * Only the final/right-most reel announces completion.
         *
         * This causes the changed digits to reveal their directional
         * colours together after the complete number has settled.
         */
        if (isLast) {
          onCompleteRef.current?.()
        }

        return
      }

      const position =
        startPosition + offset

      positionRef.current =
        mod10(position)

      draw(position, currentSpeed)

      frameId =
        requestAnimationFrame(frame)
    }

    frameId =
      requestAnimationFrame(frame)

    return () =>
      cancelAnimationFrame(frameId)
  }, [
    digit,
    order,
    isLast,
    epoch,
  ])

  return (
    <span
      aria-hidden="true"
      style={{ height: WINDOW_HEIGHT }}
      className="
        relative
        block
        min-w-0
        flex-1
        overflow-hidden
        border-l
        border-cyan-200/10
        [container-type:inline-size]
        first:border-l-0
      "
    >
      <span
        className="absolute inset-0"
        style={{
          maskImage: FADE_MASK,
          WebkitMaskImage: FADE_MASK,
        }}
      >
        <span
          ref={stripRef}
          className="block will-change-transform"
        >
          {STRIP.map((d, i) => (
            <span
              key={i}
              style={{
                height: CELL_HEIGHT,
              }}
              className={`
                grid
                place-items-center
                pb-[2px]
                text-[clamp(20px,105cqw,30px)]
                font-black
                leading-none
                tabular-nums
                transition-colors
                duration-150
                ease-out
                ${toneClass}
              `}
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