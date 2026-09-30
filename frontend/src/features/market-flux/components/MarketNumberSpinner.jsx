/**
 * @file src/features/market-flux/components/MarketNumberSpinner.jsx
 *
 * @description
 * Odometer-style price display. Every digit is a vertical drum (0 to 9) that
 * rolls to the new value, with the neighbouring digits faintly visible above
 * and below and fading out at the edges.
 *
 * Presentational only: the price and decimals come from the simulation.
 */

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const CELL_HEIGHT = 26 // px: height of one digit on the drum
const WINDOW_HEIGHT = 40 // px: visible window, taller than a cell to show neighbours

const FADE_MASK =
  'linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)'

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
      className="flex items-center justify-center gap-[3px]"
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
            className="w-[5px] self-end pb-[9px] text-center text-[16px] font-black leading-none text-cyan-200/90"
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
      className="
        relative
        block
        w-[18px]
        overflow-hidden
        rounded-[5px]
        border
        border-cyan-300/25
        bg-[linear-gradient(180deg,rgba(1,8,20,0.92)_0%,rgba(8,44,80,0.72)_50%,rgba(1,8,20,0.92)_100%)]
        shadow-[inset_0_0_8px_rgba(0,160,255,0.28)]
      "
    >
      <span
        className="absolute inset-0"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <span
          className="block transition-transform duration-[380ms] ease-out will-change-transform motion-reduce:transition-none"
          style={{ transform: `translateY(${offset}px)` }}
        >
          {DIGITS.map((d) => (
            <span
              key={d}
              style={{ height: CELL_HEIGHT }}
              className={`grid place-items-center text-[22px] font-black tabular-nums ${toneClass}`}
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