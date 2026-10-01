/**
 * @file src/features/market-flux/components/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first liquid-glass HUD header for Market Flux.
 *
 * Layout:
 * - Left: compact 3D Market Flux wordmark.
 * - Right: compact pointed liquid-glass player HUD.
 *
 * The Market Flux brand intentionally has no logo or surrounding border.
 * The wordmark itself provides the illuminated HUD identity through layered
 * cyan/white highlights and depth shadows.
 *
 * No gameplay state is managed here.
 */

import { Crown, UserRound, UsersRound } from 'lucide-react'

/**
 * Market Flux HUD header.
 *
 * @param {object} props
 * @param {number|string} [props.balance=124.5] Player balance.
 * @param {number|string} [props.rank=94] Player rank.
 * @param {number|string} [props.followers=20] Follower count.
 * @returns {JSX.Element}
 */
function MarketFluxHeader({
  balance = 124.5,
  rank = 94,
  followers = 20,
}) {
  return (
    <header className="relative z-20 w-full px-3 pt-2.5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Brand />

        <PlayerPanel
          balance={balance}
          rank={rank}
          followers={followers}
        />
      </div>

      {/* Fine cyan atmospheric continuation beneath the HUD. */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          -ml-3
          mt-1.5
          h-px
          w-[48%]
          bg-gradient-to-r
          from-cyan-200/75
          via-cyan-400/30
          to-transparent
          shadow-[0_0_6px_rgba(0,200,255,0.5)]
        "
      />
    </header>
  )
}

/**
 * Compact 3D Market Flux wordmark.
 *
 * No logo and no surrounding border.
 * The depth comes from layered text shadows and a subtle offset
 * cyan extrusion beneath the primary text.
 *
 * @returns {JSX.Element}
 */
function Brand() {
  return (
    <div className="relative min-w-0 shrink">
      {/* Dark 3D extrusion / depth layer. */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[1px]
          top-[2px]
          whitespace-nowrap
          text-[clamp(13px,4vw,17px)]
          font-black
          uppercase
          italic
          leading-none
          tracking-[0.015em]
          text-cyan-950
          opacity-90
        "
      >
        Market <span className="text-cyan-700">Flux</span>
      </span>

      {/* Cyan illuminated lower edge. */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-0
          top-[1px]
          whitespace-nowrap
          text-[clamp(13px,4vw,17px)]
          font-black
          uppercase
          italic
          leading-none
          tracking-[0.015em]
          text-cyan-500/70
          blur-[1.5px]
        "
      >
        Market <span>Flux</span>
      </span>

      {/* Main wordmark. */}
      <h1
        className="
          relative
          z-10
          whitespace-nowrap
          text-[clamp(13px,4vw,17px)]
          font-black
          uppercase
          italic
          leading-none
          tracking-[0.015em]
          drop-shadow-[0_1px_0_rgba(0,40,65,0.95)]
          drop-shadow-[0_2px_0_rgba(0,25,45,0.8)]
          drop-shadow-[0_0_6px_rgba(0,200,255,0.55)]
        "
      >
        <span
          className="
            bg-gradient-to-b
            from-white
            via-slate-100
            to-cyan-200
            bg-clip-text
            text-transparent
          "
        >
          Market
        </span>

        <span
          className="
            ml-1
            bg-gradient-to-b
            from-cyan-100
            via-cyan-300
            to-cyan-500
            bg-clip-text
            text-transparent
            drop-shadow-[0_0_7px_rgba(0,210,255,0.65)]
          "
        >
          Flux
        </span>
      </h1>

      {/* Tiny reflective highlight across the wordmark. */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[8%]
          right-[10%]
          top-0
          z-20
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/80
          to-transparent
          opacity-70
        "
      />
    </div>
  )
}

/**
 * Compact liquid-glass player HUD.
 *
 * The panel remains pointed on the left, but is smaller than the previous
 * version to give the header a lighter footprint.
 *
 * @param {object} props
 * @param {number|string} props.balance
 * @param {number|string} props.rank
 * @param {number|string} props.followers
 * @returns {JSX.Element}
 */
function PlayerPanel({ balance, rank, followers }) {
  return (
    <div
      className="
        relative
        min-w-0
        shrink-0
        max-w-[64%]
        overflow-visible
      "
    >
      {/* Main transparent liquid-glass perimeter. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 178 34"
        preserveAspectRatio="none"
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          overflow-visible
          drop-shadow-[0_0_5px_rgba(0,200,255,0.5)]
        "
      >
        <defs>
          <linearGradient
            id="market-flux-player-edge"
            x1="0"
            y1="0"
            x2="178"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0"
              stopColor="#d2faff"
              stopOpacity="0"
            />
            <stop
              offset="0.08"
              stopColor="#41d5ff"
              stopOpacity="0.18"
            />
            <stop
              offset="0.18"
              stopColor="#41d5ff"
              stopOpacity="0.72"
            />
            <stop
              offset="0.45"
              stopColor="#0aa8ef"
              stopOpacity="0.44"
            />
            <stop
              offset="0.76"
              stopColor="#22bfff"
              stopOpacity="0.62"
            />
            <stop
              offset="0.93"
              stopColor="#9af0ff"
              stopOpacity="0.88"
            />
            <stop
              offset="1"
              stopColor="#e3fcff"
              stopOpacity="0.95"
            />
          </linearGradient>

          <linearGradient
            id="market-flux-player-highlight"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0"
              stopColor="#ffffff"
              stopOpacity="0"
            />
            <stop
              offset="0.15"
              stopColor="#ffffff"
              stopOpacity="0.72"
            />
            <stop
              offset="0.5"
              stopColor="#baf5ff"
              stopOpacity="0.28"
            />
            <stop
              offset="0.86"
              stopColor="#ffffff"
              stopOpacity="0.5"
            />
            <stop
              offset="1"
              stopColor="#ffffff"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Pointed HUD outline. */}
        <path
          d="
            M12 1
            L166 1
            Q177 1 177 11
            L177 23
            Q177 33 166 33
            L12 33
            L2 17
            Z
          "
          fill="none"
          stroke="url(#market-flux-player-edge)"
          strokeWidth="1.1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Upper glass reflection. */}
        <path
          d="M19 2.6 L159 2.6"
          fill="none"
          stroke="url(#market-flux-player-highlight)"
          strokeWidth="0.65"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Lower cyan reflection. */}
        <path
          d="M20 30.8 L157 30.8"
          fill="none"
          stroke="rgba(33,190,245,0.2)"
          strokeWidth="0.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* HUD information. */}
      <div
        className="
          relative
          z-10
          flex
          h-[34px]
          items-center
          gap-1.5
          pl-3.5
          pr-2.5
        "
      >
        <Avatar />

        <div className="flex min-w-0 items-center gap-1.5">
          <Metric
            label="Balance"
            value={`R ${Number(balance).toFixed(2)}`}
          />

          <MetricDivider />

          <Metric
            icon={Crown}
            label="Rank"
            value={`#${rank}`}
          />

          <MetricDivider />

          <Metric
            icon={UsersRound}
            label="Followers"
            value={followers}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Minimal transparent HUD avatar.
 *
 * @returns {JSX.Element}
 */
function Avatar() {
  return (
    <div
      className="
        grid
        h-6
        w-6
        shrink-0
        place-items-center
        rounded-full
        border
        border-cyan-100/50
        bg-transparent
        shadow-[inset_0_0_6px_rgba(0,190,255,0.24),0_0_5px_rgba(0,190,255,0.18)]
      "
    >
      <UserRound
        aria-hidden="true"
        className="
          h-3.5
          w-3.5
          text-cyan-50
          drop-shadow-[0_0_4px_rgba(120,230,255,0.55)]
        "
        strokeWidth={1.5}
      />
    </div>
  )
}

/**
 * Metric displayed inside the player HUD.
 *
 * @param {object} props
 * @param {React.ElementType} [props.icon] Optional Lucide icon.
 * @param {string} props.label Metric label.
 * @param {string|number} props.value Metric value.
 * @returns {JSX.Element}
 */
function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 flex-col leading-none">
      <div className="flex items-center gap-0.5">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="
              h-2.5
              w-2.5
              shrink-0
              text-slate-100
              drop-shadow-[0_0_4px_rgba(255,255,255,0.35)]
            "
            strokeWidth={2}
          />
        )}

        <span
          className="
            text-[6px]
            font-semibold
            text-slate-200/70
            drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]
          "
        >
          {label}
        </span>
      </div>

      <span
        className="
          mt-[2px]
          whitespace-nowrap
          text-[9px]
          font-extrabold
          tabular-nums
          text-white
          drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]
        "
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Thin illuminated separator between HUD metrics.
 *
 * @returns {JSX.Element}
 */
function MetricDivider() {
  return (
    <div
      aria-hidden="true"
      className="
        h-4
        w-px
        shrink-0
        bg-gradient-to-b
        from-white/45
        via-cyan-300/50
        to-white/25
        shadow-[0_0_4px_rgba(90,220,255,0.3)]
      "
    />
  )
}

export default MarketFluxHeader