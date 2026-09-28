/**
 * @file src/features/market-flux/MarketNumberSpinner.jsx
 *
 * @description
 * Mobile-first market-number spinner for Market Flux.
 *
 * The component transforms the market value into a mechanical,
 * slot-machine-like number display.
 *
 * Interaction:
 * - Swipe upward  -> increase the displayed value
 * - Swipe downward -> decrease the displayed value
 *
 * The spinner does not decide whether a move is correct.
 * It only reports the player's intended direction and the resulting
 * value to the parent component.
 *
 * Responsibilities:
 * - Render the market number as individual digits
 * - Animate digit transitions
 * - Detect touch and pointer swipes
 * - Provide directional feedback
 * - Notify the parent of a spin
 *
 * Game rules remain outside this component.
 */

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

/**
 * Number of milliseconds before another swipe can be registered.
 *
 * This prevents accidental multi-triggering when a player performs
 * a long or noisy mobile gesture.
 */
const SWIPE_COOLDOWN = 220

/**
 * Amount the displayed market value moves per successful swipe.
 *
 * This is intentionally small so the player feels like they are
 * manipulating the market rather than jumping between unrelated prices.
 */
const SPIN_STEP = 1

/**
 * Minimum pointer movement required to qualify as a swipe.
 */
const SWIPE_THRESHOLD = 24

/**
 * Format a market value using South African number formatting.
 *
 * @param {number} value
 * @returns {string}
 */
function formatMarketValue(value) {
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value)
}

/**
 * Convert a formatted number into display tokens.
 *
 * Keeping punctuation as separate tokens allows the digits to animate
 * independently while preserving the decimal separator and grouping.
 *
 * @param {string} value
 * @returns {Array<{type: string, value: string, key: string}>}
 */
function createDisplayTokens(value) {
  return [...value].map((character, index) => ({
    type: /\d/.test(character) ? 'digit' : 'separator',
    value: character,
    key: `${character}-${index}`,
  }))
}

/**
 * Single animated market digit.
 *
 * @param {Object} props
 * @param {string} props.value - Current digit.
 * @param {string} props.previousValue - Previous digit.
 * @param {number} props.index - Digit position.
 * @param {string} props.direction - Current spin direction.
 * @returns {JSX.Element}
 */
function SpinnerDigit({
  value,
  previousValue,
  index,
  direction,
}) {
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (value !== previousValue) {
      setAnimationKey((current) => current + 1)
    }
  }, [value, previousValue])

  return (
    <span
      className="
        relative
        inline-flex
        h-[1.05em]
        min-w-[0.58em]
        items-center
        justify-center
        overflow-hidden
        align-baseline
      "
    >
      {/* ================================================================
          OLD DIGIT
          ================================================================ */}

      {value !== previousValue && (
        <span
          key={`old-${animationKey}`}
          aria-hidden="true"
          className={`
            absolute
            inset-0
            flex
            items-center
            justify-center
            font-mono
            ${
              direction === 'up'
                ? 'animate-[mf-digit-out-up_180ms_cubic-bezier(.22,.8,.3,1)_forwards]'
                : 'animate-[mf-digit-out-down_180ms_cubic-bezier(.22,.8,.3,1)_forwards]'
            }
          `}
        >
          {previousValue}
        </span>
      )}

      {/* ================================================================
          NEW DIGIT
          ================================================================ */}

      <span
        key={`new-${animationKey}`}
        className={`
          absolute
          inset-0
          flex
          items-center
          justify-center
          font-mono
          ${
            value !== previousValue
              ? direction === 'up'
                ? 'animate-[mf-digit-in-up_180ms_cubic-bezier(.22,.8,.3,1)_forwards]'
                : 'animate-[mf-digit-in-down_180ms_cubic-bezier(.22,.8,.3,1)_forwards]'
              : ''
          }
        `}
      >
        {value}
      </span>

      {/* ================================================================
          DIGIT REFLECTION
          ================================================================ */}

      {index % 2 === 0 && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[18%]
            right-[18%]
            top-[8%]
            h-px
            bg-white/[0.08]
          "
        />
      )}
    </span>
  )
}

/**
 * Market-number spinner.
 *
 * @param {Object} props
 * @param {number} [props.value=86538.74] - Starting market value.
 * @param {(value: number, direction: 'up'|'down') => void} [props.onSpin]
 *   Called after a successful swipe.
 * @param {boolean} [props.disabled=false] - Disable player interaction.
 * @returns {JSX.Element}
 */
function MarketNumberSpinner({
  value = 86538.74,
  onSpin,
  disabled = false,
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [previousDisplayValue, setPreviousDisplayValue] = useState(value)
  const [direction, setDirection] = useState('neutral')
  const [isSpinning, setIsSpinning] = useState(false)

  const pointerStart = useRef(null)
  const lastSpinTime = useRef(0)

  /**
   * Keep the spinner synchronized with external game state.
   */
  useEffect(() => {
    if (Number.isFinite(value) && value !== displayValue) {
      setPreviousDisplayValue(displayValue)
      setDisplayValue(value)
    }
  }, [value])

  /**
   * Perform one market-number spin.
   *
   * @param {'up'|'down'} nextDirection
   */
  const spin = (nextDirection) => {
    if (disabled || isSpinning) {
      return
    }

    const now = Date.now()

    if (now - lastSpinTime.current < SWIPE_COOLDOWN) {
      return
    }

    lastSpinTime.current = now

    const nextValue =
      nextDirection === 'up'
        ? displayValue + SPIN_STEP
        : displayValue - SPIN_STEP

    setPreviousDisplayValue(displayValue)
    setDisplayValue(nextValue)
    setDirection(nextDirection)
    setIsSpinning(true)

    onSpin?.(nextValue, nextDirection)

    window.setTimeout(() => {
      setIsSpinning(false)
    }, 190)
  }

  /**
   * Begin pointer gesture.
   *
   * Pointer events allow the same interaction to work with:
   * - Mobile touch
   * - Trackpads
   * - Mouse input
   *
   * @param {React.PointerEvent} event
   */
  const handlePointerDown = (event) => {
    if (disabled || isSpinning) {
      return
    }

    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
    }
  }

  /**
   * Complete pointer gesture.
   *
   * @param {React.PointerEvent} event
   */
  const handlePointerUp = (event) => {
    if (
      disabled ||
      isSpinning ||
      !pointerStart.current
    ) {
      return
    }

    const deltaY = event.clientY - pointerStart.current.y
    const deltaX = event.clientX - pointerStart.current.x

    pointerStart.current = null

    /*
     * Ignore gestures that are primarily horizontal.
     */
    if (Math.abs(deltaY) < Math.abs(deltaX)) {
      return
    }

    if (Math.abs(deltaY) < SWIPE_THRESHOLD) {
      return
    }

    /*
     * Screen coordinates increase downward.
     *
     * Negative deltaY = swipe upward.
     * Positive deltaY = swipe downward.
     */
    spin(deltaY < 0 ? 'up' : 'down')
  }

  /**
   * Cancel an unfinished gesture.
   */
  const handlePointerCancel = () => {
    pointerStart.current = null
  }

  const formattedValue = formatMarketValue(displayValue)
  const previousFormattedValue = formatMarketValue(
    previousDisplayValue,
  )

  const currentTokens = createDisplayTokens(formattedValue)
  const previousTokens = createDisplayTokens(previousFormattedValue)

  return (
    <>
      {/* ================================================================
          GLOBAL SPINNER ANIMATIONS
          ================================================================ */}

      <style>
        {`
          @keyframes mf-digit-in-up {
            from {
              transform: translateY(105%);
              opacity: 0;
              filter: blur(3px);
            }
            to {
              transform: translateY(0);
              opacity: 1;
              filter: blur(0);
            }
          }

          @keyframes mf-digit-out-up {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(-105%);
              opacity: 0;
              filter: blur(3px);
            }
          }

          @keyframes mf-digit-in-down {
            from {
              transform: translateY(-105%);
              opacity: 0;
              filter: blur(3px);
            }
            to {
              transform: translateY(0);
              opacity: 1;
              filter: blur(0);
            }
          }

          @keyframes mf-digit-out-down {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(105%);
              opacity: 0;
              filter: blur(3px);
            }
          }
        `}
      </style>

      {/* ================================================================
          SPINNER
          ================================================================ */}

      <section
        className="
          relative
          flex
          w-full
          select-none
          flex-col
          items-center
          px-3
          pt-7
        "
      >
        {/* ==============================================================
            DIRECTION LABEL
            ============================================================== */}

        <div
          className={`
            mb-3
            flex
            items-center
            gap-1.5
            transition-all
            duration-200
            ${
              direction === 'up'
                ? 'text-emerald-300'
                : direction === 'down'
                  ? 'text-red-300'
                  : 'text-white/20'
            }
          `}
        >
          {direction === 'up' && (
            <ArrowUp
              size={12}
              strokeWidth={2.5}
            />
          )}

          {direction === 'down' && (
            <ArrowDown
              size={12}
              strokeWidth={2.5}
            />
          )}

          <span
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-[0.25em]
            "
          >
            {direction === 'up'
              ? 'Moving Up'
              : direction === 'down'
                ? 'Moving Down'
                : 'Move Market'}
          </span>
        </div>

        {/* ==============================================================
            NUMBER INTERACTION AREA
            ============================================================== */}

        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Swipe market number up or down"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`
            relative
            flex
            min-h-[128px]
            w-full
            touch-pan-x
            items-center
            justify-center
            overflow-hidden
            rounded-[20px]
            outline-none
            transition-transform
            duration-150
            ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-grab active:scale-[0.985]'
            }
          `}
        >
          {/* ============================================================
              AMBIENT LIGHT
              ============================================================ */}

          <div
            aria-hidden="true"
            className={`
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-28
              w-72
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              blur-3xl
              transition-colors
              duration-300
              ${
                direction === 'up'
                  ? 'bg-emerald-300/[0.045]'
                  : direction === 'down'
                    ? 'bg-red-300/[0.045]'
                    : 'bg-cyan-300/[0.025]'
              }
            `}
          />

          {/* ============================================================
              NUMBER
              ============================================================ */}

          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-center
              font-mono
              text-[clamp(39px,12vw,60px)]
              font-black
              leading-none
              tracking-[-0.065em]
              text-white
              [text-shadow:0_1px_0_rgba(255,255,255,0.28),0_0_20px_rgba(103,232,249,0.10)]
            "
          >
            {currentTokens.map((token, index) => {
              if (token.type === 'separator') {
                return (
                  <span
                    key={token.key}
                    className="
                      relative
                      inline-flex
                      items-center
                      justify-center
                      min-w-[0.24em]
                      text-white/65
                    "
                  >
                    {token.value}
                  </span>
                )
              }

              const previousToken =
                previousTokens[index]

              return (
                <SpinnerDigit
                  key={token.key}
                  value={token.value}
                  previousValue={
                    previousToken?.value ?? token.value
                  }
                  index={index}
                  direction={direction}
                />
              )
            })}
          </div>

          {/* ============================================================
              TOP REFLECTION
              ============================================================ */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[13px]
              h-px
              w-28
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-white/15
              to-transparent
            "
          />
        </div>

        {/* ================================================================
            SWIPE INSTRUCTIONS
            ================================================================ */}

        <div
          className="
            mt-3
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-1
              text-emerald-300/35
            "
          >
            <ArrowUp
              size={10}
              strokeWidth={2}
            />

            <span
              className="
                text-[6px]
                font-bold
                uppercase
                tracking-[0.16em]
              "
            >
              Up
            </span>
          </div>

          <span
            aria-hidden="true"
            className="
              h-2.5
              w-px
              bg-white/10
            "
          />

          <span
            className="
              text-[6px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-white/20
            "
          >
            Swipe number
          </span>

          <span
            aria-hidden="true"
            className="
              h-2.5
              w-px
              bg-white/10
            "
          />

          <div
            className="
              flex
              items-center
              gap-1
              text-red-300/35
            "
          >
            <ArrowDown
              size={10}
              strokeWidth={2}
            />

            <span
              className="
                text-[6px]
                font-bold
                uppercase
                tracking-[0.16em]
              "
            >
              Down
            </span>
          </div>
        </div>
      </section>
    </>
  )
}

export default MarketNumberSpinner