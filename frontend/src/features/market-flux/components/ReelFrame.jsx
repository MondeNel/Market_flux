/**
 * @file src/features/market-flux/components/ReelFrame.jsx
 *
 * @description
 * Mechanical drum frame for the Market Flux reel.
 *
 * The frame is the STATIC layer of the reel. The digits that animate inside
 * it are a separate layer (MarketNumberSpinner / DigitReel), so the digits
 * can spin without redrawing the frame.
 *
 * LAYER ORDER (back to front, inside the chamber)
 * ---------------------------------------------------------------------------
 *   atmosphere glow   behind everything
 *   housing           dark mechanical body, broken rails, end brackets
 *   chamber           clipped reading window
 *     digits          z-20   (children)
 *     reading plane   z-30
 *     glass + shadow  z-40
 *   side chevrons     outside the clipped housing, one each side
 *
 * TONES
 * ---------------------------------------------------------------------------
 * cyan   normal operation
 * amber  near-miss tease (the result is being withheld)
 *
 * Presentational only. No game state is read here.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Tones                                                                      */
/* -------------------------------------------------------------------------- */

const TONES = {
  cyan: {
    atmosphere: 'bg-cyan-400/[0.07]',
    glow: '0 0 10px rgba(30,160,255,0.25)',
    railStrong:
      'bg-cyan-200 shadow-[0_0_4px_rgba(95,232,255,0.95),0_0_12px_rgba(0,191,255,0.6)]',
    railSoft: 'bg-cyan-400/60',
    bracket:
      'via-cyan-300 shadow-[0_0_7px_rgba(60,190,255,0.72)]',
    chevron:
      'text-cyan-300 drop-shadow-[0_0_5px_rgba(60,200,255,0.8)]',
  },

  amber: {
    atmosphere: 'bg-amber-400/[0.09]',
    glow: '0 0 14px rgba(251,191,36,0.38)',
    railStrong:
      'bg-amber-200 shadow-[0_0_4px_rgba(253,230,138,0.95),0_0_12px_rgba(251,191,36,0.6)]',
    railSoft: 'bg-amber-400/60',
    bracket:
      'via-amber-300 shadow-[0_0_7px_rgba(251,191,36,0.85)]',
    chevron:
      'text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.85)]',
  },
}

/**
 * Broken structural rails along the top and bottom edges.
 * `strong` segments carry the bright neon; the rest stay soft.
 */
const RAILS = [
  { edge: 'top-0 left-[8%] w-[26%]', strong: true },
  { edge: 'top-0 right-[10%] w-[16%]', strong: false },
  { edge: 'bottom-0 left-[22%] w-[31%]', strong: true },
  { edge: 'bottom-0 right-[7%] w-[13%]', strong: false },
]

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.height Height of the reading chamber in px.
 * @param {boolean} [props.tease=false] Amber near-miss styling.
 * @param {React.ReactNode} props.children The digit reels.
 * @returns {JSX.Element}
 */
function ReelFrame({
  height,
  tease = false,
  children,
}) {
  const tone = tease ? TONES.amber : TONES.cyan

  const plateHeight = Math.round(height * 0.72)

  return (
    <div className="relative w-full">
      {/* ================================================================ */}
      {/* Atmospheric glow                                                  */}
      {/* ================================================================ */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-24
          w-[82%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-3xl
          transition-colors
          duration-300
          ${tone.atmosphere}
        `}
      />

      <div className="relative flex w-full items-center gap-1.5">
        <Chevron side="left" tone={tone} />

        {/* ============================================================== */}
        {/* Mechanical housing                                              */}
        {/* ============================================================== */}

        <div
          className="
            relative
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            overflow-hidden
            rounded-[14px]
            border
            border-cyan-400/15
            px-[5px]
            py-[5px]
            transition-shadow
            duration-300
          "
          style={{
            perspective: '1000px',

            background: `
              linear-gradient(
                180deg,
                rgba(3,10,15,0.76),
                rgba(0,4,8,0.92)
              )
            `,

            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.10),
              inset 0 -6px 12px rgba(0,0,0,0.80),
              0 8px 22px rgba(0,0,0,0.45),
              ${tone.glow}
            `,
          }}
        >
          {/* Broken top and bottom rails */}

          {RAILS.map(({ edge, strong }) => (
            <span
              key={edge}
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                h-px
                ${edge}
                ${strong ? tone.railStrong : tone.railSoft}
              `}
            />
          ))}

          {/* End brackets */}

          {['left-0', 'right-0'].map((side) => (
            <span
              key={side}
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                bottom-[14%]
                top-[14%]
                w-[3px]
                rounded-full
                bg-gradient-to-b
                from-transparent
                to-transparent
                ${side}
                ${tone.bracket}
              `}
            />
          ))}

          {/* ============================================================ */}
          {/* Reading chamber                                              */}
          {/* ============================================================ */}

          <div
            className="
              relative
              z-10
              flex
              min-w-0
              flex-1
              items-center
              justify-center
              overflow-hidden
              rounded-[10px]
            "
            style={{
              height,

              background: `
                linear-gradient(
                  180deg,
                  rgba(9,20,28,0.78),
                  rgba(1,6,10,0.90)
                )
              `,

              boxShadow: `
                inset 0 3px 7px rgba(0,0,0,0.72),
                inset 0 -3px 8px rgba(0,0,0,0.88),
                inset 0 0 0 1px rgba(0,95,130,0.30)
              `,
            }}
          >
            {/* Central reading plane (above the digits) */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-[3%]
                top-1/2
                z-30
                -translate-y-1/2
                rounded-[6px]
                border-y
                border-cyan-300/[0.08]
              "
              style={{
                height: plateHeight,

                background: `
                  linear-gradient(
                    180deg,
                    rgba(0,191,255,0.025),
                    rgba(255,255,255,0.025),
                    rgba(0,191,255,0.018)
                  )
                `,

                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.06),
                  inset 0 -1px 0 rgba(0,191,255,0.10)
                `,
              }}
            />

            {/* Top glass reflection */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[5%]
                right-[5%]
                top-0
                z-40
                h-[20px]
                rounded-t-[10px]
                bg-gradient-to-b
                from-white/[0.10]
                to-transparent
              "
            />

            {/* Bottom mechanical shadow */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                right-0
                z-40
                h-[22px]
                bg-gradient-to-t
                from-black/50
                to-transparent
              "
            />

            {/* Digits */}

            {children}
          </div>
        </div>

        <Chevron side="right" tone={tone} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Side chevron                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Inward-pointing indicator outside the clipped housing.
 *
 * @param {object} props
 * @param {'left'|'right'} props.side
 * @param {object} props.tone
 * @returns {JSX.Element}
 */
function Chevron({ side, tone }) {
  const Icon =
    side === 'left'
      ? ChevronRight
      : ChevronLeft

  return (
    <span
      aria-hidden="true"
      className="
        grid
        w-4
        shrink-0
        place-items-center
      "
    >
      <Icon
        className={`
          h-[18px]
          w-[18px]
          transition-colors
          duration-300
          ${tone.chevron}
        `}
        strokeWidth={3}
      />
    </span>
  )
}

export default ReelFrame