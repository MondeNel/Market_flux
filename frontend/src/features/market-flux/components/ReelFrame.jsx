/**
 * @file src/features/market-flux/components/ReelFrame.jsx
 *
 * @description
 * Mechanical drum frame for the Market Flux reel.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Tones                                                                      */
/* -------------------------------------------------------------------------- */

const TONES = {
  cyan: {
    atmosphere: 'bg-cyan-400/[0.09]',
    glow: '0 0 20px rgba(0,191,255,0.3)',
    railStrong:
      'bg-cyan-300 shadow-[0_0_6px_rgba(0,191,255,0.9),0_0_15px_rgba(0,191,255,0.6)]',
    railSoft: 'bg-cyan-400/50',
    bracket:
      'via-cyan-300 shadow-[0_0_10px_rgba(0,191,255,0.8)]',
    chevron:
      'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,191,255,0.85)]',
  },

  amber: {
    atmosphere: 'bg-amber-400/[0.1]',
    glow: '0 0 20px rgba(245,158,11,0.35)',
    railStrong:
      'bg-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.9),0_0_15px_rgba(245,158,11,0.6)]',
    railSoft: 'bg-amber-400/50',
    bracket:
      'via-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.85)]',
    chevron:
      'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.85)]',
  },
}

const RAILS = [
  { edge: 'top-0 left-[6%] w-[30%]', strong: true },
  { edge: 'top-0 right-[8%] w-[18%]', strong: false },
  { edge: 'bottom-0 left-[18%] w-[35%]', strong: true },
  { edge: 'bottom-0 right-[6%] w-[15%]', strong: false },
]

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
      {/* Atmospheric glow */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-28
          w-[85%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-3xl
          transition-colors
          duration-300
          ${tone.atmosphere}
        `}
      />

      <div className="relative flex w-full items-center gap-2">
        <Chevron side="left" tone={tone} />

        {/* Mechanical housing */}
        <div
          className="
            relative
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            overflow-hidden
            rounded-[18px]
            border
            border-cyan-400/30
            px-[6px]
            py-[6px]
            transition-shadow
            duration-300
          "
          style={{
            perspective: '1000px',
            background: `
              linear-gradient(
                180deg,
                rgba(6,18,28,0.9),
                rgba(2,8,14,0.98)
              )
            `,
            boxShadow: `
              inset 0 1px 2px rgba(255,255,255,0.2),
              inset 0 -8px 16px rgba(0,0,0,0.9),
              0 10px 25px rgba(0,0,0,0.6),
              ${tone.glow}
            `,
          }}
        >
          {/* Heavy mechanical side caps/rings */}
          <div
            aria-hidden="true"
            className="
              absolute
              -left-2
              top-1/2
              z-50
              h-[92%]
              w-4
              -translate-y-1/2
              rounded-l-lg
              border
              border-cyan-300/40
              bg-[linear-gradient(90deg,#020810_0%,#154360_50%,#04121f_100%)]
              shadow-[0_0_10px_rgba(0,191,255,0.4)]
            "
          />
          <div
            aria-hidden="true"
            className="
              absolute
              -right-2
              top-1/2
              z-50
              h-[92%]
              w-4
              -translate-y-1/2
              rounded-r-lg
              border
              border-cyan-300/40
              bg-[linear-gradient(90deg,#04121f_0%,#154360_50%,#020810_100%)]
              shadow-[0_0_10px_rgba(0,191,255,0.4)]
            "
          />

          {RAILS.map(({ edge, strong }) => (
            <span
              key={edge}
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                h-[2px]
                z-30
                ${edge}
                ${strong ? tone.railStrong : tone.railSoft}
              `}
            />
          ))}

          {['left-2', 'right-2'].map((side) => (
            <span
              key={side}
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                bottom-[12%]
                top-[12%]
                z-30
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

          {/* Reading chamber */}
          <div
            className="
              relative
              z-20
              flex
              min-w-0
              flex-1
              items-center
              justify-center
              overflow-hidden
              rounded-[12px]
            "
            style={{
              height,
              background: `
                linear-gradient(
                  180deg,
                  rgba(10,24,36,0.85),
                  rgba(1,5,9,0.96)
                )
              `,
              boxShadow: `
                inset 0 4px 10px rgba(0,0,0,0.85),
                inset 0 -4px 10px rgba(0,0,0,0.95),
                inset 0 0 0 1px rgba(0,191,255,0.25)
              `,
            }}
          >
            {/* Central reading plane */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-[2%]
                top-1/2
                z-30
                -translate-y-1/2
                rounded-[8px]
                border-y
                border-cyan-300/15
              "
              style={{
                height: plateHeight,
                background: `
                  linear-gradient(
                    180deg,
                    rgba(0,191,255,0.04),
                    rgba(255,255,255,0.04),
                    rgba(0,191,255,0.03)
                  )
                `,
                boxShadow: `
                  inset 0 1px 2px rgba(255,255,255,0.1),
                  inset 0 -1px 2px rgba(0,191,255,0.2)
                `,
              }}
            />

            {/* Top glass specular reflection */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[4%]
                right-[4%]
                top-0
                z-40
                h-[22px]
                rounded-t-[12px]
                bg-gradient-to-b
                from-white/15
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
                h-[24px]
                bg-gradient-to-t
                from-black/70
                to-transparent
              "
            />

            {children}
          </div>
        </div>

        <Chevron side="right" tone={tone} />
      </div>
    </div>
  )
}

function Chevron({ side, tone }) {
  const Icon = side === 'left' ? ChevronRight : ChevronLeft

  return (
    <span
      aria-hidden="true"
      className="
        grid
        w-5
        shrink-0
        place-items-center
      "
    >
      <Icon
        className={`
          h-5
          w-5
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