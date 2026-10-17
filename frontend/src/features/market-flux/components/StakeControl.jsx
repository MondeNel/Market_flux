/**
 * @file src/features/market-flux/components/StakeControl.jsx
 *
 * @description
 * Reference-inspired compact mechanical stake selector.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Angular machined-metal console
 * - Cyan illuminated top bridge
 * - Recessed digital stake display
 * - Heavy physical minus/plus switches
 * - Black glass and polished gunmetal
 * - Compact 92px × 72px mobile footprint
 *
 * BEHAVIOUR
 * ---------------------------------------------------------------------------
 * - Preserves existing simulation callbacks
 * - Respects stake adjustment availability
 * - Accessible restart when funds are exhausted
 * - No game-state mutations
 */

import {
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react'

import { formatMoney } from '../utils/formatMoney'

const FRAME_SHAPE =
  'polygon(13% 0,87% 0,100% 14%,100% 100%,0 100%,0 14%)'

function StakeButton({
  label,
  icon: Icon,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        group relative
        flex h-[19px] min-w-0 flex-1
        items-center justify-center
        overflow-hidden
        rounded-[3px]
        border border-[#167b9d]
        bg-[linear-gradient(180deg,#0b364c_0%,#03131f_32%,#00060c_70%,#041d2a_100%)]
        text-[#a9eeff]
        shadow-[inset_0_1px_1px_rgba(190,245,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.95),0_2px_3px_rgba(0,0,0,0.8)]
        transition-[filter,transform]
        duration-150
        hover:brightness-125
        active:translate-y-[1px]
        disabled:cursor-not-allowed
        disabled:opacity-30
        focus-visible:outline-2
        focus-visible:outline-offset-1
        focus-visible:outline-cyan-200
        motion-reduce:transition-none
      "
    >
      {/* Chrome upper edge */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-x-[12%] top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#b6f5ff]/80
          to-transparent
        "
      />

      {/* Recessed lower edge */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute bottom-0
          left-[8%] right-[8%]
          h-px
          bg-black/90
        "
      />

      <Icon
        aria-hidden="true"
        className="
          relative z-10
          h-[12px] w-[12px]
          drop-shadow-[0_0_3px_rgba(0,220,255,0.5)]
          transition-transform
          group-hover:scale-110
        "
        strokeWidth={2.6}
      />
    </button>
  )
}

function StakeControl({
  stake,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  isBroke = false,
  onRestart,
}) {
  return (
    <div
      role="group"
      aria-label={
        isBroke
          ? 'Out of funds'
          : 'Stake control'
      }
      className="
        relative isolate
        h-[72px] w-[92px]
        shrink-0
        sm:h-[80px] sm:w-[110px]
      "
    >
      {/* External mechanical silhouette */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-[linear-gradient(145deg,#a7efff_0%,#116a88_12%,#010811_35%,#04293b_76%,#54c9e9_100%)]
          shadow-[0_5px_12px_rgba(0,0,0,0.9),0_0_10px_rgba(0,180,255,0.25)]
        "
        style={{
          clipPath: FRAME_SHAPE,
        }}
      />

      {/* Inner black gunmetal casing */}
      <div
        className="
          absolute inset-[2px]
          overflow-hidden
          bg-[linear-gradient(180deg,#123e53_0%,#010a12_16%,#00050b_65%,#092b3d_100%)]
          shadow-[inset_0_2px_3px_rgba(200,250,255,0.3),inset_0_-3px_5px_rgba(0,0,0,0.95)]
        "
        style={{
          clipPath: FRAME_SHAPE,
        }}
      >
        {/* Upper illuminated mechanical bridge */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-[13%] right-[13%]
            top-0 h-[3px]
            bg-[linear-gradient(90deg,#06506a_0%,#b8f8ff_28%,#00dfff_50%,#b8f8ff_72%,#06506a_100%)]
            shadow-[0_0_6px_rgba(0,220,255,0.9),0_0_12px_rgba(0,200,255,0.45)]
          "
        />

        {/* Angled side highlights */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-[3px] top-[17%]
            h-[58%] w-px
            bg-gradient-to-b
            from-cyan-200/65
            via-cyan-500/25
            to-transparent
          "
        />

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute right-[3px] top-[17%]
            h-[58%] w-px
            bg-gradient-to-b
            from-cyan-200/65
            via-cyan-500/25
            to-transparent
          "
        />

        {/* Lower mechanical light */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute bottom-0
            left-[19%] right-[19%]
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-400/65
            to-transparent
          "
        />
      </div>

      {/* Console content */}
      <div
        className="
          relative z-10
          flex h-full w-full
          flex-col items-center
          justify-center
          gap-[3px]
          px-[7px] pb-[5px] pt-[7px]
          sm:px-[9px]
        "
      >
        {isBroke ? (
          <>
            <span
              className="
                text-[8px] font-black
                uppercase leading-none
                tracking-[0.09em]
                text-amber-300
              "
            >
              No funds
            </span>

            <button
              type="button"
              disabled={!onRestart}
              onClick={onRestart}
              className="
                flex h-[34px] w-full
                items-center justify-center gap-1
                rounded-[4px]
                border border-amber-400/50
                bg-[linear-gradient(180deg,#3c2a0d,#070a0f)]
                text-[10px] font-black uppercase
                text-amber-100
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]
                hover:brightness-125
                disabled:opacity-40
                focus-visible:outline-2
                focus-visible:outline-amber-300
              "
            >
              <RotateCcw
                aria-hidden="true"
                className="h-3 w-3"
                strokeWidth={2.5}
              />
              Restart
            </button>
          </>
        ) : (
          <>
            {/* Small top label */}
            <span
              className="
                text-[8px] font-black
                uppercase leading-none
                tracking-[0.15em]
                text-[#a6dff0]
                [text-shadow:0_0_5px_rgba(0,200,255,0.35)]
              "
            >
              Stake
            </span>

            {/* Main recessed amount display */}
            <div
              className="
                relative flex
                h-[25px] w-full
                shrink-0
                items-center justify-center
                overflow-hidden
                rounded-[3px]
                border border-cyan-500/40
                bg-[linear-gradient(180deg,#000205_0%,#03131d_45%,#00050a_100%)]
                shadow-[inset_0_3px_5px_rgba(0,0,0,0.95),inset_0_-1px_2px_rgba(0,190,255,0.25),0_1px_0_rgba(90,220,255,0.2)]
              "
            >
              {/* Upper glass reflection */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute inset-x-[5%] top-0
                  h-[36%]
                  bg-gradient-to-b
                  from-cyan-100/12
                  to-transparent
                "
              />

              {/* Stake value */}
              <span
                aria-live="polite"
                className="
                  relative z-10
                  max-w-full truncate px-1
                  text-center
                  text-[15px] font-black
                  leading-none
                  tabular-nums tracking-[-0.04em]
                  text-[#e9fbff]
                  [text-shadow:0_0_7px_rgba(0,210,255,0.75)]
                  sm:text-[17px]
                "
              >
                {formatMoney(stake)}
              </span>

              {/* Lower LCD reflection */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute bottom-0
                  left-[12%] right-[12%]
                  h-px bg-cyan-300/15
                "
              />
            </div>

            {/* Physical adjustment switches */}
            <div
              className="
                flex w-full items-center
                gap-[4px]
              "
            >
              <StakeButton
                label="Decrease stake"
                icon={Minus}
                disabled={!canDecrease}
                onClick={onDecrease}
              />

              {/* Illuminated central screw */}
              <span
                aria-hidden="true"
                className="
                  h-[3px] w-[3px]
                  shrink-0 rounded-full
                  bg-[#8af3ff]
                  shadow-[0_0_5px_rgba(0,220,255,0.9)]
                "
              />

              <StakeButton
                label="Increase stake"
                icon={Plus}
                disabled={!canIncrease}
                onClick={onIncrease}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StakeControl