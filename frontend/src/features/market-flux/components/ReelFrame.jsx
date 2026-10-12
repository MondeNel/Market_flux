
/**
 * @file src/features/market-flux/components/ReelFrame.jsx
 *
 * @description
 * Cinematic mechanical drum housing for the Market Flux
 * number spinner.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * Reference-inspired physical slot-machine construction:
 *
 * - Wide horizontal cylindrical silhouette
 * - Heavy machined-metal end caps
 * - Layered chrome / gunmetal structural rings
 * - Deep recessed reading chamber
 * - Curved glass reflections and mechanical shadows
 * - Continuous cyan energy rails
 * - Illuminated side brackets
 * - Dark glass without flat dashboard backgrounds
 *
 * The actual digit reels remain controlled by
 * MarketNumberSpinner.jsx.
 *
 * API
 * ---------------------------------------------------------------------------
 * height   Number  - height of the digit reading chamber
 * tease    Boolean - temporary amber lighting state
 * children ReactNode - existing animated digit reels
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Visual configuration                                                       */
/* -------------------------------------------------------------------------- */

const TONES = {
  cyan: {
    primary: '#00dfff',
    bright: '#a9f5ff',
    glow: 'rgba(0, 210, 255, 0.75)',
    ambient: 'rgba(0, 170, 255, 0.22)',
    rail:
      'linear-gradient(90deg, transparent 0%, #087da9 8%, #8df4ff 26%, #00dfff 50%, #7defff 76%, #087da9 92%, transparent 100%)',
    chevron: 'text-cyan-300',
  },

  amber: {
    primary: '#ffbd48',
    bright: '#fff1b4',
    glow: 'rgba(255, 177, 40, 0.75)',
    ambient: 'rgba(255, 153, 0, 0.22)',
    rail:
      'linear-gradient(90deg, transparent 0%, #9e5408 8%, #ffe5a0 26%, #ffb52e 50%, #ffe4a0 76%, #9e5408 92%, transparent 100%)',
    chevron: 'text-amber-300',
  },
}

/* -------------------------------------------------------------------------- */
/* Structural parts                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Vertical machined ring surrounding the cylindrical drum.
 */
function DrumRing({ side = 'left', tone }) {
  const isLeft = side === 'left'

  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none absolute
        top-[7%] bottom-[7%]
        z-30 w-[clamp(9px,2.8vw,26px)]
        ${isLeft ? 'left-[5.5%]' : 'right-[5.5%]'}
      `}
    >
      {/* Outer chrome profile */}
      <div
        className="
          absolute inset-0
          rounded-[45%]
          border border-cyan-100/45
          bg-[linear-gradient(90deg,#01050a_0%,#0c3448_16%,#8aeaff_35%,#123e55_48%,#010811_68%,#267fa0_86%,#01050a_100%)]
          shadow-[inset_2px_0_3px_rgba(255,255,255,0.3),inset_-3px_0_7px_rgba(0,0,0,0.95),0_0_12px_rgba(0,191,255,0.4)]
        "
      />

      {/* Narrow illuminated vertical channel */}
      <div
        className="
          absolute bottom-[8%] top-[8%]
          left-[36%] w-[16%]
          rounded-full
        "
        style={{
          background: tone.primary,
          boxShadow: `0 0 7px ${tone.glow}, 0 0 17px ${tone.ambient}`,
        }}
      />

      {/* Chrome reflection */}
      <div
        className="
          absolute bottom-[14%] top-[14%]
          right-[12%] w-[9%]
          rounded-full bg-white/35 blur-[1px]
        "
      />
    </div>
  )
}

/**
 * Massive cylindrical end cap.
 */
function EndCap({ side = 'left', tone }) {
  const isLeft = side === 'left'

  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none absolute
        top-1/2 z-40
        h-[78%]
        w-[clamp(17px,5.4vw,52px)]
        -translate-y-1/2
        ${isLeft ? '-left-[1.5%]' : '-right-[1.5%]'}
      `}
    >
      {/* External metallic barrel */}
      <div
        className="
          absolute inset-0
          rounded-[38%]
          border border-cyan-200/45
          bg-[linear-gradient(90deg,#00050b_0%,#0c344c_13%,#4db7d8_25%,#03111e_42%,#071a2a_62%,#5ed6f2_82%,#00070f_100%)]
          shadow-[0_7px_15px_rgba(0,0,0,0.95),inset_2px_0_3px_rgba(255,255,255,0.35),inset_-4px_0_9px_rgba(0,0,0,0.9)]
        "
      />

      {/* Outer curved reflection */}
      <div
        className="
          absolute inset-y-[12%] left-[20%]
          w-[15%] rounded-full
          bg-gradient-to-b
          from-transparent via-cyan-100/80 to-transparent
          blur-[1px]
        "
      />

      {/* Illuminated vertical slot */}
      <div
        className="
          absolute bottom-[17%] top-[17%]
          right-[23%] w-[10%]
          rounded-full
        "
        style={{
          background: tone.primary,
          boxShadow: `0 0 8px ${tone.glow}, 0 0 20px ${tone.ambient}`,
        }}
      />

      {/* Internal metal seam */}
      <div
        className="
          absolute bottom-[7%] top-[7%]
          right-[7%] w-px
          bg-cyan-100/45
        "
      />
    </div>
  )
}

/**
 * Small inward-facing indicator integrated into each side.
 */
function SideIndicator({ side = 'left', tone }) {
  const isLeft = side === 'left'
  const Icon = isLeft ? ChevronRight : ChevronLeft

  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none absolute
        top-1/2 z-50
        -translate-y-1/2
        ${isLeft ? 'left-[7.5%]' : 'right-[7.5%]'}
      `}
    >
      <Icon
        className={`
          h-[clamp(12px,2.8vw,22px)]
          w-[clamp(12px,2.8vw,22px)]
          ${tone.chevron}
        `}
        strokeWidth={2.5}
        style={{
          filter: `drop-shadow(0 0 5px ${tone.glow})`,
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
 * @param {number} props.height Height of the reading chamber in px.
 * @param {boolean} [props.tease=false] Amber near-miss styling.
 * @param {React.ReactNode} props.children Animated digit reels.
 * @returns {JSX.Element}
 */
function ReelFrame({
  height,
  tease = false,
  children,
}) {
  const tone = tease ? TONES.amber : TONES.cyan

  const chamberHeight = Math.max(1, Number(height) || 52)

  // Mechanical casing is taller than the digit reading window.
  const housingHeight = Math.round(chamberHeight * 1.65)

  return (
    <div
      className="
        relative isolate w-full
        overflow-visible
        py-[clamp(8px,2vw,18px)]
      "
      style={{
        '--reel-primary': tone.primary,
        '--reel-glow': tone.glow,
      }}
    >
      {/* Atmospheric lighting behind the machine */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          left-1/2 top-1/2 -z-10
          h-[125%] w-[90%]
          -translate-x-1/2 -translate-y-1/2
          rounded-full blur-[35px]
        "
        style={{
          background: `radial-gradient(ellipse, ${tone.ambient}, transparent 70%)`,
        }}
      />

      {/* Main horizontal cylinder */}
      <div
        className="
          relative mx-auto w-full
          overflow-visible
        "
        style={{
          height: housingHeight,
          perspective: '1100px',
        }}
      >
        {/* Outer mechanical silhouette */}
        <div
          className="
            absolute inset-x-[2%] inset-y-[2%]
            rounded-[clamp(20px,6vw,55px)]
            border border-cyan-200/45
            bg-[linear-gradient(180deg,#2c7b9b_0%,#061d2d_8%,#010811_20%,#000408_50%,#010b13_78%,#165477_91%,#01111e_100%)]
            shadow-[0_16px_30px_rgba(0,0,0,0.95),0_0_18px_rgba(0,180,255,0.3),inset_0_3px_3px_rgba(210,250,255,0.6),inset_0_-5px_8px_rgba(0,0,0,0.95)]
          "
        />

        {/* Upper structural metal plate */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-[8%] right-[8%] top-[5%]
            h-[14%]
            rounded-t-[45%]
            border-t border-cyan-100/55
            bg-[linear-gradient(180deg,rgba(120,225,255,0.35),rgba(5,39,60,0.5)_45%,transparent)]
          "
        />

        {/* Lower structural metal plate */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-[5%] left-[8%] right-[8%]
            h-[15%]
            rounded-b-[45%]
            border-b border-cyan-300/50
            bg-[linear-gradient(0deg,rgba(10,108,148,0.6),rgba(0,10,20,0.2)_55%,transparent)]
          "
        />

        {/* Continuous top cyan energy rail */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-[10%] right-[10%] top-[13%]
            z-20 h-[3px] rounded-full
          "
          style={{
            background: tone.rail,
            boxShadow: `0 0 7px ${tone.glow}, 0 0 17px ${tone.ambient}`,
          }}
        />

        {/* Continuous bottom cyan energy rail */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-[12%] left-[10%] right-[10%]
            z-20 h-[3px] rounded-full
          "
          style={{
            background: tone.rail,
            boxShadow: `0 0 8px ${tone.glow}, 0 0 19px ${tone.ambient}`,
          }}
        />

        {/* Inner cylindrical barrel */}
        <div
          className="
            absolute bottom-[15%] left-[8%]
            right-[8%] top-[15%]
            z-10 overflow-hidden
            rounded-[clamp(12px,3vw,28px)]
            border border-cyan-400/35
            bg-[linear-gradient(180deg,#17455e_0%,#020d16_13%,#000408_32%,#000307_68%,#071b2a_87%,#185878_100%)]
            shadow-[inset_0_7px_13px_rgba(0,0,0,0.95),inset_0_-5px_9px_rgba(0,0,0,0.95),0_0_8px_rgba(0,190,255,0.3)]
          "
        >
          {/* Curved barrel highlight */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              inset-x-[3%] top-[2%] h-[20%]
              rounded-[50%]
              bg-gradient-to-b
              from-cyan-100/20 to-transparent
            "
          />

          {/* Recessed digit chamber */}
          <div
            className="
              absolute inset-x-[4%] top-1/2
              flex min-w-0
              -translate-y-1/2
              items-center justify-center
              overflow-hidden
              rounded-[8px]
              border-x border-cyan-300/15
            "
            style={{
              height: chamberHeight,
              background:
                'linear-gradient(180deg,rgba(0,5,10,0.97),rgba(1,15,24,0.94) 45%,rgba(0,4,9,0.98))',
              boxShadow: `
                inset 0 8px 13px rgba(0,0,0,0.98),
                inset 0 -8px 13px rgba(0,0,0,0.98),
                inset 0 0 0 1px rgba(0,200,255,0.14)
              `,
            }}
          >
            {/* Upper curved glass shading */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute
                inset-x-0 top-0 z-30 h-[28%]
                bg-gradient-to-b
                from-black/80 via-cyan-950/20 to-transparent
              "
            />

            {/* Lower curved glass shading */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute
                inset-x-0 bottom-0 z-30 h-[28%]
                bg-gradient-to-t
                from-black/80 via-cyan-950/20 to-transparent
              "
            />

            {/* Glass reflection */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute
                left-[3%] right-[3%] top-[7%]
                z-30 h-[1px]
                bg-gradient-to-r
                from-transparent via-cyan-100/45 to-transparent
              "
            />

            {/* Existing spinner content */}
            <div
              className="
                relative z-20 flex
                h-full w-full min-w-0
                items-center justify-center
                overflow-hidden
              "
            >
              {children}
            </div>
          </div>

          {/* Lower internal reflection */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              bottom-[4%] left-[6%] right-[6%]
              h-[2px] rounded-full
              bg-cyan-300/40
              shadow-[0_0_8px_rgba(0,210,255,0.65)]
            "
          />
        </div>

        {/* External machined rings */}
        <DrumRing side="left" tone={tone} />
        <DrumRing side="right" tone={tone} />

        {/* Massive cylindrical end caps */}
        <EndCap side="left" tone={tone} />
        <EndCap side="right" tone={tone} />

        {/* Small side direction indicators */}
        <SideIndicator side="left" tone={tone} />
        <SideIndicator side="right" tone={tone} />

        {/* Upper central specular reflection */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-[30%] right-[30%] top-[5%]
            z-30 h-[2px]
            rounded-full bg-cyan-100/80
            shadow-[0_0_8px_rgba(0,230,255,0.9)]
          "
        />

        {/* Bottom central glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-[4%] left-[23%] right-[23%]
            z-30 h-[2px]
            rounded-full
          "
          style={{
            background: tone.rail,
            boxShadow: `0 0 10px ${tone.glow}`,
          }}
        />
      </div>
    </div>
  )
}

export default ReelFrame
