/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Odometer-style price display. Every digit is a vertical drum (0 to 9) that
 * rolls to the new value, with the neighbouring digits faintly visible above
 * and below and fading out at the edges. The drums have no boxes of their own:
 * the parent supplies one continuous cylinder, like the reference.
 *
 * The roll (160ms) is shorter than the tick (200ms), so each digit settles
 * before the next update instead of staying permanently mid-roll.
 *
 * Presentational only: the price and decimals come from the simulation.
 */

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const CELL_HEIGHT = 28 // px: height of one digit on the drum
const WINDOW_HEIGHT = 52 // px: visible window; the digits above/below peek in as faint ghosts

// Ghost digits stay at most ~30% visible; the centre digit is fully lit.
const FADE_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 16%, #000 34%, #000 66%, rgba(0,0,0,0.3) 84%, transparent 100%)'

const TONES = {
  idle: 'text-sky-100 [text-shadow:0_0_8px_rgba(120,220,255,0.85)]',
  up: 'text-emerald-200 [text-shadow:0_0_8px_rgba(52,211,153,0.9)]',
  down: 'text-rose-200 [text-shadow:0_0_8px_rgba(251,113,133,0.9)]',
}

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
  const chars = formatted.split('')

  return (
    <div
      role="img"
      aria-label={`Price ${formatted}`}
      className="flex items-center justify-center"
    >
      {chars.map((char, index) => {
        // Key from the right so each digit keeps its drum when the number
        // grows or shrinks, instead of every drum remounting.
        const fromRight = chars.length - 1 - index

        return /\d/.test(char) ? (
          <Drum key={`d${fromRight}`} digit={Number(char)} toneClass={TONES[tone]} />
        ) : (
          <span
            key={`s${fromRight}`}
            aria-hidden="true"
            className="w-[8px] self-end pb-[13px] text-center text-[24px] font-black leading-none text-sky-100 [text-shadow:0_0_8px_rgba(120,220,255,0.85)]"
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}

function Drum({ digit, toneClass }) {
  const offset = (WINDOW_HEIGHT - CELL_HEIGHT) / 2 - digit * CELL_HEIGHT

  return (
    <span
      aria-hidden="true"
      style={{ height: WINDOW_HEIGHT }}
      className="relative block w-[19px] overflow-hidden border-l border-cyan-200/10 first:border-l-0"
    >
      <span
        className="absolute inset-0"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <span
          className="block transition-transform duration-[160ms] ease-out will-change-transform motion-reduce:transition-none"
          style={{ transform: `translateY(${offset}px)` }}
        >
          {DIGITS.map((d) => (
            <span
              key={d}
              style={{ height: CELL_HEIGHT }}
              className={`grid place-items-center text-[26px] font-black tabular-nums ${toneClass}`}
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