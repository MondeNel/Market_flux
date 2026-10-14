/**
 * @file src/features/market-flux/components/ReelFrame.jsx
 *
 * @description
 * Compact mechanical reel housing for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * The reel remains the visual focus of the game, but its physical housing
 * is deliberately constrained for a single-screen mobile game layout.
 *
 * - Compact horizontal cylindrical silhouette
 * - Narrow machined-metal side caps
 * - Recessed black digit chamber
 * - Thin cyan energy rails
 * - Chrome highlights and mechanical depth
 * - No oversized external barrel pieces
 * - Responsive to the spinner's existing chamber height
 *
 * API
 * ---------------------------------------------------------------------------
 * height   Number    Height of the digit reading chamber.
 * tease    Boolean   Temporary amber lighting state.
 * children ReactNode Existing animated digit reels.
 */

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Visual configuration                                                       */
/* -------------------------------------------------------------------------- */

const TONES = {
  cyan: {
    primary: '#00dfff',
    bright: '#b9f8ff',
    dark: '#064f68',
    glow: 'rgba(0,210,255,0.72)',
    ambient: 'rgba(0,170,255,0.18)',
  },

  amber: {
    primary: '#ffbd48',
    bright: '#fff0b2',
    dark: '#81520c',
    glow: 'rgba(255,177,40,0.72)',
    ambient: 'rgba(255,153,0,0.18)',
  },
}

/* -------------------------------------------------------------------------- */
/* Compact end cap                                                            */
/* -------------------------------------------------------------------------- */

function EndCap({
  side,
  tone,
}) {
  const isLeft = side === 'left'
  const Icon = isLeft
    ? ChevronRight
    : ChevronLeft

  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none
        absolute top-1/2 z-40
        h-[72%]
        w-[clamp(15px,4.5vw,28px)]
        -translate-y-1/2
        ${isLeft ? 'left-0' : 'right-0'}
      `}
    >
      {/* Metallic cap body */}
      <div
        className="
          absolute inset-0
          rounded-[45%]
          border border-cyan-100/40
          bg-[linear-gradient(90deg,#01060b_0%,#0b3449_20%,#5bc8e7_38%,#071622_52%,#12617e_76%,#01070d_100%)]
          shadow-[0_4px_9px_rgba(0,0,0,0.9),inset_1px_0_2px_rgba(255,255,255,0.35),inset_-2px_0_5px_rgba(0,0,0,0.9)]
        "
      />

      {/* Energy slot */}
      <span
        className={`
          absolute bottom-[15%] top-[15%]
          w-[2px] rounded-full
          ${isLeft ? 'right-[28%]' : 'left-[28%]'}
        `}
        style={{
          background: tone.primary,
          boxShadow: `0 0 5px ${tone.glow}`,
        }}
      />

      {/* Direction marker */}
      <Icon
        className="
          absolute left-1/2 top-1/2
          h-[11px] w-[11px]
          -translate-x-1/2 -translate-y-1/2
        "
        strokeWidth={3}
        style={{
          color: tone.bright,
          filter: `drop-shadow(0 0 4px ${tone.glow})`,
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {number} props.height
 * @param {boolean} [props.tease=false]
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function ReelFrame({
  height,
  tease = false,
  children,
}) {
  const tone = tease
    ? TONES.amber
    : TONES.cyan

  const chamberHeight = Math.max(
    1,
    Number(height) || 52,
  )

  /*
   * Keep the machine only moderately taller than the actual
   * digit window.
   *
   * Previous version:
   * chamber × 1.65 + external vertical padding.
   *
   * New version:
   * chamber × 1.32 with a small minimum structural allowance.
   */
  const housingHeight = Math.max(
    68,
    Math.round(chamberHeight * 1.32),
  )

  return (
    <div
      className="
        relative isolate
        mx-auto w-full
        max-w-[560px]
        overflow-visible
      "
      style={{
        '--reel-primary': tone.primary,
        '--reel-glow': tone.glow,
      }}
    >
      {/* Restrained atmospheric glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute left-1/2 top-1/2
          -z-10
          h-[90%] w-[82%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[22px]
        "
        style={{
          background: `radial-gradient(
            ellipse,
            ${tone.ambient},
            transparent 72%
          )`,
        }}
      />

      {/* Complete reel machine */}
      <div
        className="
          relative mx-auto
          w-[calc(100%-8px)]
          overflow-visible
        "
        style={{
          height: housingHeight,
        }}
      >
        {/* Main compact metallic barrel */}
        <div
          className="
            absolute
            inset-x-[3%] inset-y-[3%]
            overflow-hidden
            rounded-[clamp(14px,4vw,26px)]
            border border-cyan-200/45
            bg-[linear-gradient(180deg,#29718e_0%,#092b3c_8%,#010912_20%,#000408_50%,#020b13_79%,#15516d_92%,#03121d_100%)]
            shadow-[0_8px_15px_rgba(0,0,0,0.9),0_0_10px_rgba(0,190,255,0.25),inset_0_2px_2px_rgba(210,250,255,0.45),inset_0_-3px_5px_rgba(0,0,0,0.9)]
          "
        >
          {/* Upper metallic bevel */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute left-[7%] right-[7%] top-0
              h-[18%]
              rounded-t-[50%]
              bg-gradient-to-b
              from-cyan-100/30
              via-cyan-900/15
              to-transparent
            "
          />

          {/* Top energy rail */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute left-[8%] right-[8%]
              top-[8%] z-30
              h-[2px] rounded-full
            "
            style={{
              background: `linear-gradient(
                90deg,
                transparent,
                ${tone.dark},
                ${tone.bright},
                ${tone.primary},
                ${tone.bright},
                ${tone.dark},
                transparent
              )`,
              boxShadow: `0 0 6px ${tone.glow}`,
            }}
          />

          {/* Bottom energy rail */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute bottom-[8%]
              left-[8%] right-[8%]
              z-30 h-[2px]
              rounded-full
            "
            style={{
              background: `linear-gradient(
                90deg,
                transparent,
                ${tone.dark},
                ${tone.primary},
                ${tone.bright},
                ${tone.primary},
                ${tone.dark},
                transparent
              )`,
              boxShadow: `0 0 6px ${tone.glow}`,
            }}
          />

          {/* Inner mechanical recess */}
          <div
            className="
              absolute
              bottom-[14%] left-[5%]
              right-[5%] top-[14%]
              overflow-hidden
              rounded-[clamp(8px,2.5vw,15px)]
              border border-cyan-300/25
              bg-[linear-gradient(180deg,#12384d_0%,#010810_18%,#000307_50%,#03111b_82%,#12435a_100%)]
              shadow-[inset_0_5px_9px_rgba(0,0,0,0.95),inset_0_-4px_7px_rgba(0,0,0,0.9)]
            "
          >
            {/* Recess reflection */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute inset-x-[4%] top-0
                h-[22%]
                rounded-[50%]
                bg-gradient-to-b
                from-cyan-100/14
                to-transparent
              "
            />

            {/* Digit chamber */}
            <div
              className="
                absolute left-[3%] right-[3%]
                top-1/2
                flex min-w-0
                -translate-y-1/2
                items-center justify-center
                overflow-hidden
                rounded-[6px]
                border-x border-cyan-300/10
                bg-black
              "
              style={{
                height: chamberHeight,
                boxShadow: `
                  inset 0 6px 10px rgba(0,0,0,0.98),
                  inset 0 -6px 10px rgba(0,0,0,0.98),
                  inset 0 0 0 1px rgba(0,200,255,0.10)
                `,
              }}
            >
              {/* Upper curved glass shade */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute inset-x-0 top-0
                  z-30 h-[22%]
                  bg-gradient-to-b
                  from-black/75
                  to-transparent
                "
              />

              {/* Lower curved glass shade */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute inset-x-0 bottom-0
                  z-30 h-[22%]
                  bg-gradient-to-t
                  from-black/75
                  to-transparent
                "
              />

              {/* Thin glass reflection */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute left-[5%] right-[5%]
                  top-[8%] z-30
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-cyan-100/35
                  to-transparent
                "
              />

              {/* Existing digit spinner */}
              <div
                className="
                  relative z-20
                  flex h-full w-full
                  min-w-0
                  items-center justify-center
                  overflow-hidden
                "
              >
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Compact side hardware */}
        <EndCap
          side="left"
          tone={tone}
        />

        <EndCap
          side="right"
          tone={tone}
        />

        {/* Central chrome reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-[32%] right-[32%]
            top-[3%] z-50
            h-px rounded-full
            bg-cyan-50/75
            shadow-[0_0_5px_rgba(0,220,255,0.8)]
          "
        />
      </div>
    </div>
  )
}

export default ReelFrame