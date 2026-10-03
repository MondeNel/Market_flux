/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Liquid-glass 3D market-number spinner for Market Flux.
 *
 * Visual design:
 * - Transparent liquid-glass spinner with no solid backdrop.
 * - Dark glossy 3D chassis around the spinner.
 * - Neon-blue outer rails with illuminated sections.
 * - Outer rails fade smoothly into the background at their endpoints.
 * - Dark recessed blue/black sections create physical depth.
 * - Neon-blue inner reel borders and mechanical edge lighting.
 * - Mechanical 3D digit reels with depth, bevels and reflections.
 * - Neon green for digits that changed during an upward market move.
 * - Neon red for digits that changed during a downward market move.
 * - Unchanged digits remain neutral.
 *
 * Colour behaviour:
 * - All digits remain neutral while spinning.
 * - After the reels settle, only digits whose values changed are coloured.
 * - Market direction is calculated from the complete numeric value.
 *
 * Example:
 *
 *   86,773.04 -> 86,774.07
 *
 *   Only the changed digits become neon green.
 *
 * The market direction is never inferred from individual digit movement.
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

/**
 * Soft vertical fade used to create cylindrical depth around each reel.
 */
const FADE_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.12) 12%, #000 32%, #000 68%, rgba(0,0,0,0.12) 88%, transparent 100%)'

/**
 * Horizontal mask for the outer chassis.
 *
 * The border is strongest through the centre and disappears
 * smoothly toward both ends instead of stopping abruptly.
 */
const OUTER_HORIZONTAL_FADE =
  'linear-gradient(to right, transparent 0%, rgba(0,191,255,0.2) 7%, black 18%, black 82%, rgba(0,191,255,0.2) 93%, transparent 100%)'

/**
 * Vertical mask for the outer chassis.
 *
 * Used on the left/right rails so they also fade naturally
 * into the surrounding glass.
 */
const OUTER_VERTICAL_FADE =
  'linear-gradient(to bottom, transparent 0%, rgba(0,191,255,0.2) 9%, black 20%, black 80%, rgba(0,191,255,0.2) 91%, transparent 100%)'

/**
 * Three copies of 0 to 9 allow the strip to wrap without a visible seam.
 */
const STRIP = Array.from(
  { length: 30 },
  (_, i) => i % 10,
)

/**
 * Spinner digit colour themes.
 */
const TONES = {
  idle: {
    className: `
      text-sky-50
      [text-shadow:
        0_0_4px_rgba(186,230,253,0.95),
        0_0_10px_rgba(56,189,248,0.55)
      ]
    `,
  },

  up: {
    className: `
      text-[#39FF88]
      [text-shadow:
        0_0_3px_rgba(255,255,255,1),
        0_0_7px_rgba(57,255,136,1),
        0_0_16px_rgba(0,255,102,0.95),
        0_0_28px_rgba(0,255,102,0.55)
      ]
    `,
  },

  down: {
    className: `
      text-[#FF3158]
      [text-shadow:
        0_0_3px_rgba(255,255,255,1),
        0_0_7px_rgba(255,49,88,1),
        0_0_16px_rgba(255,23,68,0.95),
        0_0_28px_rgba(255,23,68,0.55)
      ]
    `,
  },
}

const mod10 = (n) =>
  ((n % 10) + 10) % 10

/**
 * Compare two complete market values.
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
 * Digits are compared from the right so decimal and integer
 * positions remain correctly aligned.
 */
function getChangedDigits(
  currentFormatted,
  previousFormatted,
) {
  const currentDigits =
    currentFormatted
      .split('')
      .filter((char) => /\d/.test(char))

  const previousDigits =
    previousFormatted
      ? previousFormatted
          .split('')
          .filter((char) => /\d/.test(char))
      : []

  const changed =
    Array(currentDigits.length).fill(false)

  for (
    let currentIndex =
      currentDigits.length - 1;
    currentIndex >= 0;
    currentIndex -= 1
  ) {
    const previousIndex =
      previousDigits.length -
      1 -
      (currentDigits.length -
        1 -
        currentIndex)

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
 * Liquid-glass 3D market-number spinner.
 */
function MarketNumberSpinner({
  value,
  decimals,
  tone = 'idle',
  tease = false,
}) {
  const formatted =
    value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })

  const [previousFormatted, setPreviousFormatted] =
    useState(null)

  const [tracked, setTracked] =
    useState(formatted)

  const [epoch, setEpoch] =
    useState(0)

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

  const changedDigits =
    getChangedDigits(
      formatted,
      previousFormatted,
    )

  const chars = formatted.split('')

  const digitCount =
    chars.filter(
      (char) => /\d/.test(char),
    ).length

  let digitIndex = -1

  return (
    <div
      role="img"
      aria-label={`Price ${formatted}`}
      className="
        relative
        flex
        w-full
        items-center
        justify-center
        py-[4px]
      "
    >
      {/* =========================================================
          3D LIQUID-GLASS OUTER CHASSIS

          The outer rails intentionally fade toward their endpoints.
          This prevents the frame from looking like a hard rectangle
          and makes it feel like an illuminated HUD trace floating
          around the market display.
      ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-[1px]
          z-[30]
          overflow-hidden
          rounded-[14px]
        "
      >
        {/* Deep recessed chassis */}
        <span
          className="
            absolute
            inset-0
            rounded-[14px]
            shadow-[
              inset_0_0_0_1px_rgba(0,35,60,0.95),
              inset_0_0_7px_rgba(0,8,18,0.95),
              inset_0_2px_3px_rgba(0,191,255,0.12),
              inset_0_-3px_5px_rgba(0,0,0,0.85),
              0_0_12px_rgba(0,0,0,0.45)
            ]
          "
        />

        {/* =======================================================
            TOP OUTER RAIL
        ======================================================= */}

        <span
          className="
            absolute
            left-[5%]
            right-[5%]
            top-0
            h-[2px]
            rounded-full
            bg-gradient-to-r
            from-transparent
            via-[#064b6b]
            to-transparent
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        {/* Top illuminated trace */}
        <span
          className="
            absolute
            left-[11%]
            top-0
            h-[1px]
            w-[29%]
            rounded-full
            bg-[#5FE8FF]
            shadow-[
              0_0_3px_rgba(95,232,255,1),
              0_0_8px_rgba(0,191,255,0.9),
              0_0_16px_rgba(0,191,255,0.45)
            ]
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        {/* Top secondary reflection */}
        <span
          className="
            absolute
            right-[14%]
            top-[1px]
            h-px
            w-[19%]
            rounded-full
            bg-cyan-300/60
            shadow-[0_0_7px_rgba(34,211,238,0.55)]
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        {/* =======================================================
            BOTTOM OUTER RAIL
        ======================================================= */}

        <span
          className="
            absolute
            bottom-0
            left-[5%]
            right-[5%]
            h-[2px]
            rounded-full
            bg-gradient-to-r
            from-transparent
            via-[#063d58]
            to-transparent
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        {/* Bottom illuminated trace */}
        <span
          className="
            absolute
            bottom-0
            left-[23%]
            h-px
            w-[34%]
            rounded-full
            bg-[#00BFFF]/80
            shadow-[
              0_0_3px_rgba(0,191,255,0.95),
              0_0_9px_rgba(0,191,255,0.55)
            ]
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        {/* Bottom secondary reflection */}
        <span
          className="
            absolute
            bottom-[1px]
            right-[9%]
            h-px
            w-[15%]
            bg-sky-300/35
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        {/* =======================================================
            LEFT OUTER RAIL
        ======================================================= */}

        <span
          className="
            absolute
            bottom-[10%]
            left-0
            top-[10%]
            w-[2px]
            rounded-full
            bg-gradient-to-b
            from-transparent
            via-[#087da8]
            to-transparent
            shadow-[1px_0_4px_rgba(0,0,0,0.9)]
          "
          style={{
            maskImage: OUTER_VERTICAL_FADE,
            WebkitMaskImage:
              OUTER_VERTICAL_FADE,
          }}
        />

        {/* Bright left neon segment */}
        <span
          className="
            absolute
            left-0
            top-[24%]
            h-[27%]
            w-[1px]
            bg-[#45DCFF]
            shadow-[
              0_0_3px_rgba(69,220,255,1),
              0_0_8px_rgba(0,191,255,0.75),
              0_0_14px_rgba(0,191,255,0.35)
            ]
          "
          style={{
            maskImage: OUTER_VERTICAL_FADE,
            WebkitMaskImage:
              OUTER_VERTICAL_FADE,
          }}
        />

        {/* =======================================================
            RIGHT OUTER RAIL
        ======================================================= */}

        <span
          className="
            absolute
            bottom-[10%]
            right-0
            top-[10%]
            w-[2px]
            rounded-full
            bg-gradient-to-b
            from-transparent
            via-[#07506e]
            to-transparent
            shadow-[-1px_0_5px_rgba(0,0,0,0.95)]
          "
          style={{
            maskImage: OUTER_VERTICAL_FADE,
            WebkitMaskImage:
              OUTER_VERTICAL_FADE,
          }}
        />

        {/* Bright right neon segment */}
        <span
          className="
            absolute
            right-0
            top-[15%]
            h-[24%]
            w-[1px]
            bg-[#5FE8FF]/85
            shadow-[
              0_0_3px_rgba(95,232,255,0.95),
              0_0_8px_rgba(0,191,255,0.65)
            ]
          "
          style={{
            maskImage: OUTER_VERTICAL_FADE,
            WebkitMaskImage:
              OUTER_VERTICAL_FADE,
          }}
        />

        {/* =======================================================
            3D CORNER LIGHTS

            These remain concentrated around the corners, while
            the rails themselves disappear into the background.
        ======================================================= */}

        <span
          className="
            absolute
            left-0
            top-0
            h-[7px]
            w-[18px]
            rounded-tl-[10px]
            border-l
            border-t
            border-[#00BFFF]/80
            shadow-[
              -1px_-1px_4px_rgba(0,191,255,0.35),
              inset_2px_2px_4px_rgba(95,232,255,0.12)
            ]
          "
        />

        <span
          className="
            absolute
            left-[2px]
            top-[1px]
            h-[2px]
            w-[9px]
            rounded-full
            bg-[#5FE8FF]
            shadow-[0_0_7px_rgba(95,232,255,0.85)]
          "
        />

        <span
          className="
            absolute
            right-0
            top-0
            h-[7px]
            w-[18px]
            rounded-tr-[10px]
            border-r
            border-t
            border-[#00BFFF]/70
            shadow-[
              1px_-1px_4px_rgba(0,191,255,0.3),
              inset_-2px_2px_4px_rgba(95,232,255,0.08)
            ]
          "
        />

        <span
          className="
            absolute
            bottom-0
            left-0
            h-[7px]
            w-[18px]
            rounded-bl-[10px]
            border-b
            border-l
            border-[#0079A8]/80
            shadow-[
              -1px_1px_5px_rgba(0,0,0,0.85),
              inset_2px_-2px_4px_rgba(0,191,255,0.08)
            ]
          "
        />

        <span
          className="
            absolute
            bottom-0
            right-0
            h-[7px]
            w-[18px]
            rounded-br-[10px]
            border-b
            border-r
            border-[#00BFFF]/70
            shadow-[
              1px_1px_5px_rgba(0,0,0,0.9),
              inset_-2px_-2px_4px_rgba(0,191,255,0.08)
            ]
          "
        />

        {/* =======================================================
            GLASS REFLECTIONS
        ======================================================= */}

        <span
          className="
            absolute
            left-[15%]
            right-[22%]
            top-[2px]
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/30
            to-transparent
            blur-[0.3px]
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />

        <span
          className="
            absolute
            -left-[8%]
            top-[18%]
            h-px
            w-[35%]
            rotate-[24deg]
            bg-white/10
            blur-[0.6px]
          "
        />

        <span
          className="
            absolute
            bottom-[3px]
            left-[28%]
            h-px
            w-[24%]
            bg-gradient-to-r
            from-transparent
            via-cyan-300/20
            to-transparent
          "
          style={{
            maskImage: OUTER_HORIZONTAL_FADE,
            WebkitMaskImage:
              OUTER_HORIZONTAL_FADE,
          }}
        />
      </div>

      {/* ===========================================================
          REEL AREA
      =========================================================== */}

      <div
        className="
          relative
          flex
          w-[calc(100%-6px)]
          items-center
          justify-center
          overflow-hidden
          rounded-[11px]
        "
        style={{
          perspective: '900px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dark recessed inner channel */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-[2px]
            z-[1]
            rounded-[9px]
            shadow-[
              inset_0_0_0_1px_rgba(0,56,82,0.65),
              inset_0_3px_7px_rgba(0,0,0,0.65),
              inset_0_-3px_7px_rgba(0,0,0,0.75),
              inset_4px_0_6px_rgba(0,0,0,0.35),
              inset_-4px_0_6px_rgba(0,0,0,0.35)
            ]
          "
        />

        {/* Inner top neon-blue bevel */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[4%]
            right-[4%]
            top-[2px]
            z-[22]
            h-px
            rounded-full
            bg-gradient-to-r
            from-transparent
            via-[#00BFFF]/90
            to-transparent
            shadow-[0_0_6px_rgba(0,191,255,0.7)]
          "
        />

        {/* Inner top bright fragment */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[13%]
            top-[2px]
            z-[23]
            h-px
            w-[17%]
            bg-[#8CEFFF]
            shadow-[0_0_5px_rgba(140,239,255,0.9)]
          "
        />

        {/* Inner bottom blue bevel */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[2px]
            left-[7%]
            right-[7%]
            z-[22]
            h-px
            rounded-full
            bg-gradient-to-r
            from-transparent
            via-[#007EA8]/75
            to-transparent
            shadow-[0_-1px_5px_rgba(0,191,255,0.3)]
          "
        />

        {/* Inner left neon rail */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[14%]
            left-[2px]
            top-[17%]
            z-[22]
            w-px
            bg-gradient-to-b
            from-transparent
            via-[#00BFFF]/75
            to-transparent
            shadow-[0_0_5px_rgba(0,191,255,0.45)]
          "
        />

        {/* Inner right dark/blue rail */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[22%]
            right-[2px]
            top-[23%]
            z-[22]
            w-px
            bg-gradient-to-b
            from-transparent
            via-[#07506B]/80
            to-transparent
          "
        />

        {/* Inner top glass reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[7%]
            right-[7%]
            top-0
            z-[20]
            h-[11px]
            rounded-t-[10px]
            bg-gradient-to-b
            from-white/[0.11]
            via-cyan-100/[0.025]
            to-transparent
          "
        />

        {/* Inner bottom depth */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-[6%]
            right-[6%]
            z-[20]
            h-[13px]
            rounded-b-[10px]
            bg-gradient-to-t
            from-black/30
            via-black/[0.07]
            to-transparent
          "
        />

        {/* Centre glass sheen */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-[10%]
            top-1/2
            z-[19]
            h-px
            -translate-y-1/2
            bg-gradient-to-r
            from-transparent
            via-white/[0.08]
            to-transparent
          "
        />

        {chars.map((char, index) => {
          const fromRight =
            chars.length - 1 - index

          if (!/\d/.test(char)) {
            return (
              <span
                key={`s${fromRight}`}
                aria-hidden="true"
                className="
                  relative
                  z-10
                  w-[9px]
                  shrink-0
                  self-end
                  pb-[13px]
                  text-center
                  text-[clamp(20px,6.2vw,26px)]
                  font-black
                  leading-none
                  text-sky-100
                  [text-shadow:
                    0_0_5px_rgba(186,230,253,0.8),
                    0_0_10px_rgba(56,189,248,0.4)
                  ]
                "
              >
                {char}
              </span>
            )
          }

          digitIndex += 1

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
                digitIndex ===
                digitCount - 1
              }
              tease={tease}
              epoch={epoch}
              toneClass={digitToneClass}
              onComplete={
                digitIndex ===
                digitCount - 1
                  ? () =>
                      setResultVisible(true)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * One mechanical 3D digit drum.
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
  const onCompleteRef =
    useRef(onComplete)

  useEffect(() => {
    teaseRef.current = tease
  }, [tease])

  useEffect(() => {
    onCompleteRef.current =
      onComplete
  }, [onComplete])

  useEffect(() => {
    const strip = stripRef.current

    if (!strip) {
      return undefined
    }

    let lastBlur = ''

    const draw = (
      position,
      speed,
    ) => {
      const cell = mod10(position)

      strip.style.transform =
        `translateY(${DRUM_OFFSET - (cell + 10) * CELL_HEIGHT}px)`

      const blur =
        speed > 5
          ? Math.min(
              2.4,
              speed / 10,
            ).toFixed(1)
          : ''

      if (blur !== lastBlur) {
        strip.style.filter =
          blur
            ? `blur(${blur}px)`
            : 'none'

        lastBlur = blur
      }
    }

    const reduceMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    if (
      epoch === 0 ||
      reduceMotion
    ) {
      positionRef.current = digit

      draw(digit, 0)

      if (
        epoch > 0 &&
        isLast
      ) {
        onCompleteRef.current?.()
      }

      return undefined
    }

    const startPosition =
      positionRef.current

    const startTime =
      performance.now()

    const teasing =
      isLast &&
      teaseRef.current

    const ramp =
      RAMP_MS / 1000

    const spinSeconds =
      (
        FIRST_SPIN_MS +
        order * STAGGER_MS +
        (
          teasing
            ? TEASE_EXTRA_SPIN_MS
            : 0
        )
      ) / 1000

    const brake =
      BRAKE_MS / 1000

    const settle =
      SETTLE_MS / 1000

    const hold =
      teasing
        ? TEASE_HOLD_MS / 1000
        : 0

    const creepSeconds =
      teasing
        ? TEASE_CREEP_MS / 1000
        : 0

    const creepCells =
      teasing
        ? TEASE_CREEP_CELLS
        : 0

    const effectiveSeconds =
      spinSeconds -
      ramp / 2 +
      brake / 3

    const ahead =
      mod10(
        digit -
          startPosition,
      )

    const minTurns =
      teasing ? 1 : 0

    const wholeTurns =
      Math.max(
        minTurns,
        Math.round(
          (
            SPIN_SPEED *
              effectiveSeconds -
            ahead
          ) / 10,
        ),
      )

    const travel =
      ahead +
      10 * wholeTurns

    const brakeEnd =
      travel -
      creepCells

    const speed =
      brakeEnd /
      effectiveSeconds

    const spinEndPosition =
      speed *
      (
        spinSeconds -
        ramp / 2
      )

    const brakeDistance =
      (speed * brake) / 3

    const brakeAt =
      spinSeconds

    const holdAt =
      brakeAt +
      brake

    const creepAt =
      holdAt +
      hold

    const settleAt =
      creepAt +
      creepSeconds

    const endAt =
      settleAt +
      settle

    let frameId = 0

    const frame = (now) => {
      const t =
        Math.max(
          0,
          (now - startTime) /
            1000,
        )

      let offset
      let currentSpeed = 0

      if (t < ramp) {
        offset =
          (
            speed *
            t *
            t
          ) /
          (2 * ramp)

        currentSpeed =
          (speed * t) /
          ramp
      } else if (
        t < brakeAt
      ) {
        offset =
          speed *
          (
            t -
            ramp / 2
          )

        currentSpeed =
          speed
      } else if (
        t < holdAt
      ) {
        const u =
          (
            t -
            brakeAt
          ) / brake

        offset =
          spinEndPosition +
          brakeDistance *
            (
              1 -
              (1 - u) ** 3
            )

        currentSpeed =
          speed *
          (1 - u) ** 2
      } else if (
        t < creepAt
      ) {
        offset = brakeEnd
      } else if (
        t < settleAt
      ) {
        const u =
          (
            t -
            creepAt
          ) /
          creepSeconds

        const eased =
          u < 0.5
            ? 4 * u ** 3
            : 1 -
              (
                -2 * u +
                2
              ) ** 3 /
                2

        offset =
          brakeEnd +
          creepCells *
            eased
      } else if (
        t < endAt
      ) {
        const u =
          (
            t -
            settleAt
          ) /
          settle

        offset =
          travel +
          OVERSHOOT *
            Math.sin(
              Math.PI * u,
            ) *
            (1 - u)
      } else {
        positionRef.current =
          digit

        draw(
          digit,
          0,
        )

        if (isLast) {
          onCompleteRef.current?.()
        }

        return
      }

      const position =
        startPosition +
        offset

      positionRef.current =
        mod10(position)

      draw(
        position,
        currentSpeed,
      )

      frameId =
        requestAnimationFrame(
          frame,
        )
    }

    frameId =
      requestAnimationFrame(
        frame,
      )

    return () =>
      cancelAnimationFrame(
        frameId,
      )
  }, [
    digit,
    order,
    isLast,
    epoch,
  ])

  return (
    <span
      aria-hidden="true"
      style={{
        height: WINDOW_HEIGHT,
        perspective:
          '700px',
      }}
      className="
        relative
        block
        min-w-0
        flex-1
        overflow-hidden
        [container-type:inline-size]
        [transform-style:preserve-3d]
      "
    >
      {/* Individual reel chamber */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-[3px_1px]
          z-[5]
          overflow-hidden
          rounded-[5px]
        "
      >
        {/* Deep inner chamber */}
        <span
          className="
            absolute
            inset-0
            rounded-[5px]
            shadow-[
              inset_0_0_5px_rgba(0,0,0,0.85),
              inset_2px_0_4px_rgba(0,0,0,0.45),
              inset_-2px_0_4px_rgba(0,0,0,0.5)
            ]
          "
        />

        {/* Left mechanical neon edge */}
        <span
          className="
            absolute
            left-0
            top-[15%]
            h-[70%]
            w-px
            bg-gradient-to-b
            from-transparent
            via-[#00BFFF]/75
            to-transparent
            shadow-[0_0_5px_rgba(0,191,255,0.42)]
          "
        />

        {/* Bright left segment */}
        <span
          className="
            absolute
            left-0
            top-[24%]
            h-[23%]
            w-px
            bg-[#5FE8FF]
            shadow-[0_0_5px_rgba(95,232,255,0.9)]
          "
        />

        {/* Right recessed edge */}
        <span
          className="
            absolute
            right-0
            top-[21%]
            h-[57%]
            w-px
            bg-gradient-to-b
            from-transparent
            via-[#06425C]/90
            to-transparent
          "
        />

        {/* Right blue reflection */}
        <span
          className="
            absolute
            right-0
            top-[30%]
            h-[23%]
            w-px
            bg-[#00BFFF]/35
            shadow-[0_0_4px_rgba(0,191,255,0.25)]
          "
        />

        {/* Top bevel */}
        <span
          className="
            absolute
            left-[10%]
            right-[10%]
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#5FE8FF]/50
            to-transparent
            shadow-[0_0_4px_rgba(0,191,255,0.35)]
          "
        />

        {/* Bottom dark bevel */}
        <span
          className="
            absolute
            bottom-0
            left-[10%]
            right-[10%]
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#006B8F]/45
            to-transparent
          "
        />

        {/* Top glass reflection */}
        <span
          className="
            absolute
            left-[19%]
            right-[20%]
            top-[1px]
            h-px
            bg-white/15
            blur-[0.4px]
          "
        />
      </span>

      {/* Cylindrical fade */}
      <span
        className="
          absolute
          inset-0
          z-[10]
          pointer-events-none
        "
        style={{
          maskImage: FADE_MASK,
          WebkitMaskImage:
            FADE_MASK,
          boxShadow:
            'inset 5px 0 8px rgba(0,0,0,0.10), inset -5px 0 8px rgba(0,0,0,0.10)',
        }}
      />

      {/* Reel strip */}
      <span
        ref={stripRef}
        className="
          relative
          z-[2]
          block
          will-change-transform
        "
        style={{
          transformStyle:
            'preserve-3d',
        }}
      >
        {STRIP.map(
          (d, i) => (
            <span
              key={i}
              style={{
                height:
                  CELL_HEIGHT,
                transform:
                  'translateZ(0)',
              }}
              className={`
                relative
                grid
                place-items-center
                overflow-hidden
                pb-[2px]
                text-[clamp(20px,105cqw,30px)]
                font-black
                leading-none
                tabular-nums
                antialiased
                transition-colors
                duration-150
                ease-out
                ${toneClass}
              `}
            >
              {/* Digit upper glass highlight */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-[22%]
                  top-[3px]
                  h-[1px]
                  bg-white/10
                  blur-[0.5px]
                "
              />

              {d}
            </span>
          ),
        )}
      </span>

      {/* =========================================================
          CYLINDER LIGHTING
      ========================================================= */}

      {/* Side curvature */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[15]
          bg-gradient-to-r
          from-black/[0.17]
          via-transparent
          to-black/[0.18]
        "
      />

      {/* Top depth */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-[16]
          h-[15px]
          bg-gradient-to-b
          from-black/25
          via-black/[0.07]
          to-transparent
        "
      />

      {/* Bottom depth */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-[16]
          h-[15px]
          bg-gradient-to-t
          from-black/25
          via-black/[0.07]
          to-transparent
        "
      />

      {/* Thin centre glass reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-[16%]
          top-1/2
          z-[17]
          h-px
          -translate-y-1/2
          bg-gradient-to-r
          from-transparent
          via-cyan-100/[0.07]
          to-transparent
        "
      />
    </span>
  )
}

export default MarketNumberSpinner