/**
 * @file src/features/market-flux/components/StakeControl.jsx
 *
 * @description
 * Bottom stake instrument for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Floating mechanical HUD rather than a conventional card.
 * - No heavy backdrop or standard rounded container.
 * - Compact 3D minus / stake / plus control.
 * - Broken neon-blue structural rails.
 * - Metallic/glass depth and internal reflections.
 * - Risk/reward tagline remains secondary.
 * - When the player is out of funds, the tagline becomes a restart action.
 */

import { Minus, Plus, RotateCcw } from 'lucide-react'

/**
 * @param {object} props
 * @param {number} props.stake
 * @param {boolean} props.canDecrease
 * @param {boolean} props.canIncrease
 * @param {() => void} props.onDecrease
 * @param {() => void} props.onIncrease
 * @param {boolean} props.isBroke
 * @param {() => void} props.onReset
 * @returns {JSX.Element}
 */
function StakeControl({
  stake,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  isBroke,
  onReset,
}) {
  return (
    <section
      aria-label="Stake"
      className="relative mx-3 mt-2"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Atmospheric glow                                                 */}
      {/* ---------------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-8
          top-1/2
          h-16
          -translate-y-1/2
          rounded-full
          bg-cyan-400/[0.035]
          blur-2xl
        "
      />

      {/* ---------------------------------------------------------------- */}
      {/* Top structural rail                                              */}
      {/* ---------------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-2
          top-0
          flex
          items-center
        "
      >
        <span className="h-px w-10 bg-cyan-400/55" />
        <span className="ml-2 h-px flex-1 bg-cyan-400/15" />
        <span className="mx-2 h-[2px] w-1 rounded-full bg-cyan-300/70" />
        <span className="h-px flex-1 bg-cyan-400/15" />
        <span className="ml-2 h-px w-10 bg-cyan-400/55" />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Main instrument                                                   */}
      {/* ---------------------------------------------------------------- */}

      <div className="relative flex items-center justify-center py-3">
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-5
            top-1/2
            h-[52px]
            -translate-y-1/2
            rounded-[18px]
            bg-black/35
            shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-8px_18px_rgba(0,0,0,0.35)]
          "
        />

        <div className="relative flex w-full max-w-[330px] items-center justify-between">
          <StakeButton
            label="Decrease stake"
            disabled={!canDecrease}
            onClick={onDecrease}
            icon={Minus}
          />

          <StakeReadout stake={stake} />

          <StakeButton
            label="Increase stake"
            disabled={!canIncrease}
            onClick={onIncrease}
            icon={Plus}
          />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom structural rail                                            */}
      {/* ---------------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-2
          bottom-0
          flex
          items-center
        "
      >
        <span className="h-px w-14 bg-cyan-400/45" />
        <span className="ml-2 h-px flex-1 bg-cyan-400/10" />
        <span className="mx-2 h-px w-8 bg-cyan-400/25" />
        <span className="mr-2 h-px flex-1 bg-cyan-400/10" />
        <span className="h-px w-14 bg-cyan-400/45" />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Risk / restart status                                             */}
      {/* ---------------------------------------------------------------- */}

      <div className="flex items-center justify-center gap-2 pt-1">
        <Rail />

        {isBroke ? (
          <button
            type="button"
            onClick={onReset}
            className="
              group
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-1.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-cyan-200
              outline-offset-2
              transition-[background-color,transform]
              hover:bg-cyan-400/[0.06]
              active:scale-95
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-cyan-300
            "
          >
            <RotateCcw
              aria-hidden="true"
              className="
                h-3
                w-3
                transition-transform
                group-hover:rotate-[-35deg]
              "
              strokeWidth={2.5}
            />

            Restart Demo
          </button>
        ) : (
          <p
            className="
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-slate-500
            "
          >
            Higher Risk
            <span className="mx-2 text-cyan-400/80">•</span>
            Bigger Rewards
          </p>
        )}

        <Rail flip />
      </div>
    </section>
  )
}

/**
 * Central stake amount readout.
 */
function StakeReadout({ stake }) {
  return (
    <div
      className="
        relative
        min-w-[116px]
        text-center
      "
    >
      {/* mechanical side ticks */}
      <span
        aria-hidden="true"
        className="
          absolute
          left-0
          top-1/2
          h-5
          w-px
          -translate-y-1/2
          bg-gradient-to-b
          from-transparent
          via-cyan-400/45
          to-transparent
        "
      />

      <span
        aria-hidden="true"
        className="
          absolute
          right-0
          top-1/2
          h-5
          w-px
          -translate-y-1/2
          bg-gradient-to-b
          from-transparent
          via-cyan-400/45
          to-transparent
        "
      />

      <p
        className="
          text-[7px]
          font-bold
          uppercase
          tracking-[0.3em]
          text-slate-500
        "
      >
        Stake
      </p>

      <div className="mt-1 flex items-baseline justify-center gap-1">
        <span
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-cyan-400/70
          "
        >
          R
        </span>

        <span
          className="
            text-[24px]
            font-black
            leading-none
            tabular-nums
            tracking-[-0.04em]
            text-white
            [text-shadow:0_1px_0_rgba(255,255,255,0.12),0_0_14px_rgba(0,174,255,0.12)]
          "
        >
          {stake}
        </span>
      </div>

      {/* tiny instrumentation marker */}
      <div
        aria-hidden="true"
        className="mx-auto mt-1 flex w-12 items-center justify-center gap-1"
      >
        <span className="h-[2px] w-1 rounded-full bg-cyan-400/70" />
        <span className="h-px flex-1 bg-cyan-400/20" />
        <span className="h-[2px] w-1 rounded-full bg-cyan-400/70" />
      </div>
    </div>
  )
}

/**
 * Mechanical plus/minus control.
 */
function StakeButton({ label, disabled, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        group
        relative
        grid
        h-11
        w-11
        place-items-center
        rounded-[14px]
        border
        border-cyan-400/30
        bg-black/55
        text-cyan-200
        shadow-[0_8px_16px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-5px_10px_rgba(0,0,0,0.4)]
        outline-offset-2
        transition-[transform,opacity,border-color,box-shadow]
        hover:border-cyan-300/55
        hover:shadow-[0_8px_18px_rgba(0,0,0,0.5),0_0_14px_rgba(0,174,255,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-cyan-300
        active:translate-y-[1px]
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-30
        disabled:hover:border-cyan-400/30
      "
    >
      {/* top glass reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-2
          top-1
          h-px
          rounded-full
          bg-white/15
        "
      />

      {/* broken mechanical accent */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[-1px]
          left-3
          h-px
          w-3
          bg-cyan-400/70
        "
      />

      <Icon
        aria-hidden="true"
        className="
          relative
          h-[18px]
          w-[18px]
          transition-transform
          group-hover:scale-110
        "
        strokeWidth={2.75}
      />
    </button>
  )
}

/**
 * Small cyan HUD separator.
 */
function Rail({ flip = false }) {
  return (
    <span
      aria-hidden="true"
      className={`
        flex
        w-8
        items-center
        gap-1
        ${flip ? 'flex-row-reverse' : ''}
      `}
    >
      <span className="h-px flex-1 bg-cyan-400/30" />
      <span className="h-[2px] w-1 rounded-full bg-cyan-300/60" />
    </span>
  )
}

export default StakeControl