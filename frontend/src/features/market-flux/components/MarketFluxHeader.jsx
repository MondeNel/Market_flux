/**
 * @file src/features/market-flux/components/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first mechanical HUD header for Market Flux.
 *
 * Layout:
 * - Left: compact 3D Market Flux wordmark.
 * - Right: pointed liquid-glass player HUD.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - No conventional surrounding header container.
 * - Brand acts as the primary visual identity.
 * - Player HUD uses transparent liquid-glass depth.
 * - Cyan perimeter is deliberately broken into illuminated structural rails.
 * - White specular highlights provide the physical/glass feel.
 * - Compact enough to preserve gameplay space on mobile.
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

      {/* Atmospheric brand continuation. */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          -ml-3
          mt-2
          flex
          items-center
        "
      >
        <span className="h-px w-8 bg-cyan-100/60" />
        <span className="h-px w-14 bg-cyan-400/35" />
        <span className="ml-1 h-px w-[18%] bg-cyan-400/10" />
        <span className="ml-1 h-[2px] w-1 rounded-full bg-cyan-300/60" />
      </div>
    </header>
  )
}

/**
 * Compact 3D Market Flux wordmark.
 *
 * The wordmark itself provides the illuminated brand identity.
 *
 * @returns {JSX.Element}
 */
function Brand() {
  return (
    <div className="relative min-w-0 shrink">
      {/* Deep mechanical extrusion. */}
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
        Market <span className="text-cyan-800">Flux</span>
      </span>

      {/* Cyan atmospheric glow. */}
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
          text-cyan-500/65
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
          drop-shadow-[0_0_7px_rgba(0,200,255,0.5)]
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

      {/* Fine white specular sweep. */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[7%]
          right-[10%]
          top-0
          z-20
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/80
          to-transparent
          opacity-65
        "
      />
    </div>
  )
}

/**
 * Pointed liquid-glass player HUD.
 *
 * @param {object} props
 * @param {number|string} props.balance
 * @param {number|string} props.rank
 * @param {number|string} props.followers
 * @returns {JSX.Element}
 */
function PlayerPanel({
  balance,
  rank,
  followers,
}) {
  return (
    <div
      className="
        relative
        min-w-0
        shrink-0
        max-w-[66%]
      "
    >
      {/* ================================================================ */}
      {/* Atmospheric shadow                                               */}
      {/* ================================================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-3
          top-1
          h-7
          rounded-full
          bg-cyan-400/[0.035]
          blur-xl
        "
      />

      {/* ================================================================ */}
      {/* Mechanical glass silhouette                                       */}
      {/* ================================================================ */}

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
          drop-shadow-[0_7px_10px_rgba(0,0,0,0.45)]
        "
      >
        <defs>
          <linearGradient
            id="market-flux-player-edge-v2"
            x1="0"
            y1="0"
            x2="178"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0"
              stopColor="#d8fbff"
              stopOpacity="0"
            />
            <stop
              offset="0.07"
              stopColor="#42d8ff"
              stopOpacity="0.18"
            />
            <stop
              offset="0.16"
              stopColor="#42d8ff"
              stopOpacity="0.7"
            />
            <stop
              offset="0.43"
              stopColor="#08a8ed"
              stopOpacity="0.32"
            />
            <stop
              offset="0.73"
              stopColor="#20bdff"
              stopOpacity="0.55"
            />
            <stop
              offset="0.91"
              stopColor="#9cf1ff"
              stopOpacity="0.78"
            />
            <stop
              offset="1"
              stopColor="#e6fdff"
              stopOpacity="0.9"
            />
          </linearGradient>

          <linearGradient
            id="market-flux-player-highlight-v2"
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
              offset="0.16"
              stopColor="#ffffff"
              stopOpacity="0.7"
            />
            <stop
              offset="0.5"
              stopColor="#baf5ff"
              stopOpacity="0.24"
            />
            <stop
              offset="0.84"
              stopColor="#ffffff"
              stopOpacity="0.48"
            />
            <stop
              offset="1"
              stopColor="#ffffff"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Deep glass shadow silhouette. */}
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
          fill="rgba(0,0,0,0.32)"
        />

        {/* Broken upper edge. */}
        <path
          d="M12 1 L56 1"
          fill="none"
          stroke="url(#market-flux-player-edge-v2)"
          strokeWidth="1.15"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M66 1 L143 1"
          fill="none"
          stroke="url(#market-flux-player-edge-v2)"
          strokeWidth="0.8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M153 1 L166 1 Q177 1 177 11"
          fill="none"
          stroke="url(#market-flux-player-edge-v2)"
          strokeWidth="1.1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Right structural edge. */}
        <path
          d="M177 11 L177 23 Q177 33 166 33 L151 33"
          fill="none"
          stroke="url(#market-flux-player-edge-v2)"
          strokeWidth="0.95"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Broken lower edge. */}
        <path
          d="M141 33 L78 33"
          fill="none"
          stroke="rgba(33,190,245,0.38)"
          strokeWidth="0.75"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M68 33 L20 33"
          fill="none"
          stroke="rgba(33,190,245,0.26)"
          strokeWidth="0.75"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Pointed left accent. */}
        <path
          d="M12 1 L2 17 L12 33"
          fill="none"
          stroke="url(#market-flux-player-edge-v2)"
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Upper glass reflection. */}
        <path
          d="M20 2.8 L57 2.8"
          fill="none"
          stroke="url(#market-flux-player-highlight-v2)"
          strokeWidth="0.7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M67 2.8 L138 2.8"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.55"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Lower glass reflection. */}
        <path
          d="M21 30.8 L68 30.8"
          fill="none"
          stroke="rgba(33,190,245,0.2)"
          strokeWidth="0.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ================================================================ */}
      {/* HUD contents                                                      */}
      {/* ================================================================ */}

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

      {/* Tiny pointed HUD marker. */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[4px]
          left-[8px]
          z-20
          h-[2px]
          w-1
          rounded-full
          bg-cyan-200
          shadow-[0_0_5px_rgba(0,210,255,0.9)]
        "
      />
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
        relative
        grid
        h-6
        w-6
        shrink-0
        place-items-center
        rounded-full
        border
        border-cyan-100/45
        bg-white/[0.015]
        shadow-[inset_0_0_6px_rgba(0,190,255,0.22),0_0_5px_rgba(0,190,255,0.16)]
      "
    >
      {/* Glass reflection. */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-1.5
          top-1
          h-px
          rounded-full
          bg-white/35
        "
      />

      <UserRound
        aria-hidden="true"
        className="
          relative
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
 * @param {string} props.label
 * @param {string|number} props.value
 * @returns {JSX.Element}
 */
function Metric({
  icon: Icon,
  label,
  value,
}) {
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
            text-slate-200/65
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
 * Thin illuminated separator between player metrics.
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
        from-white/35
        via-cyan-300/45
        to-white/20
        shadow-[0_0_4px_rgba(90,220,255,0.28)]
      "
    />
  )
}

export default MarketFluxHeader