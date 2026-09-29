/**
 * @file src/features/market-flux/components/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first liquid-glass HUD header for Market Flux.
 *
 * The header is designed to visually match the reference HUD:
 * - transparent glass surfaces
 * - extremely thin illuminated outlines
 * - sharp angular transitions
 * - subtle cyan atmospheric glow
 * - no solid backdrop cards
 *
 * Layout:
 * - Left: Market Flux brand HUD.
 * - Right: pointed liquid-glass player HUD.
 * - Player HUD: avatar, balance, rank and followers.
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
    <header className="relative z-20 w-full px-3 pt-3">
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
          mt-2
          h-px
          w-[52%]
          bg-gradient-to-r
          from-cyan-200/85
          via-cyan-400/35
          to-transparent
          shadow-[0_0_7px_rgba(0,200,255,0.55)]
        "
      />
    </header>
  )
}

/**
 * Market Flux brand HUD.
 *
 * The reference uses the brand as part of the illuminated HUD itself,
 * rather than placing the logo on a solid card.
 *
 * @returns {JSX.Element}
 */
function Brand() {
  return (
    <div className="relative flex min-w-0 shrink items-center">
      {/* Transparent liquid-glass brand outline. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 151 38"
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
            id="market-flux-brand-edge"
            x1="0"
            y1="0"
            x2="151"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0"
              stopColor="#8eeeff"
              stopOpacity="0.95"
            />
            <stop
              offset="0.16"
              stopColor="#16bfff"
              stopOpacity="0.7"
            />
            <stop
              offset="0.62"
              stopColor="#0797e6"
              stopOpacity="0.42"
            />
            <stop
              offset="0.88"
              stopColor="#5de2ff"
              stopOpacity="0.72"
            />
            <stop
              offset="1"
              stopColor="#baf6ff"
              stopOpacity="0.9"
            />
          </linearGradient>

          <linearGradient
            id="market-flux-brand-highlight"
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
              offset="0.2"
              stopColor="#ffffff"
              stopOpacity="0.75"
            />
            <stop
              offset="0.55"
              stopColor="#b8f5ff"
              stopOpacity="0.22"
            />
            <stop
              offset="1"
              stopColor="#ffffff"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Main transparent HUD perimeter. */}
        <path
          d="
            M13 1
            L139 1
            Q150 1 150 12
            L150 26
            Q150 37 139 37
            L13 37
            L2 19
            Z
          "
          fill="none"
          stroke="url(#market-flux-brand-edge)"
          strokeWidth="1.15"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Sharp angular meeting point. */}
        <path
          d="M13 2.5 L3.5 19 L13 35.5"
          fill="none"
          stroke="rgba(190,248,255,0.72)"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Fine top reflection. */}
        <path
          d="M18 2.5 L132 2.5"
          fill="none"
          stroke="url(#market-flux-brand-highlight)"
          strokeWidth="0.7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        className="
          relative
          z-10
          flex
          h-[38px]
          min-w-0
          items-center
          gap-1.5
          pl-3
          pr-4
        "
      >
        <BrandGlyph />

        <h1
          className="
            min-w-0
            truncate
            text-[clamp(12px,3.8vw,15px)]
            font-black
            uppercase
            italic
            leading-none
            tracking-[0.025em]
            drop-shadow-[0_0_8px_rgba(0,200,255,0.45)]
          "
        >
          <span className="text-white">Market</span>
          <span className="text-cyan-300">-Flux</span>
        </h1>
      </div>
    </div>
  )
}

/**
 * Market Flux wave glyph.
 *
 * @returns {JSX.Element}
 */
function BrandGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 52 44"
      className="
        h-[clamp(25px,7.5vw,32px)]
        w-[clamp(29px,9vw,37px)]
        shrink-0
        drop-shadow-[0_0_8px_rgba(0,200,255,0.75)]
      "
    >
      <defs>
        <linearGradient
          id="market-flux-glyph-light"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#c4f8ff" />
          <stop offset="1" stopColor="#10b5ef" />
        </linearGradient>

        <linearGradient
          id="market-flux-glyph-deep"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#36c9ff" />
          <stop offset="1" stopColor="#1054d8" />
        </linearGradient>
      </defs>

      {/* Crest. */}
      <path
        d="
          M3 30
          C6 16 18 5 34 6
          C40 6.5 44 9 46 12
          C40 10.5 34 12 31 17
          C29 21 30 25 33 28
          C26 25 20 26 15 31
          C11 34 6 34 3 30
          Z
        "
        fill="url(#market-flux-glyph-light)"
      />

      {/* Base swoosh. */}
      <path
        d="
          M8 37
          C16 31 26 31 33 34
          C37 36 41 36 46 33
          C43 40 34 42 26 41
          C18 40 12 40 8 37
          Z
        "
        fill="url(#market-flux-glyph-deep)"
      />

      {/* Curl. */}
      <path
        d="
          M36 24
          C39 20 44 21 46 25
          C47 29 44 32 40 32
          C42 29 41 26 36 24
          Z
        "
        fill="url(#market-flux-glyph-light)"
      />
    </svg>
  )
}

/**
 * Liquid-glass player HUD.
 *
 * The player panel deliberately has no backdrop fill.
 * The environment remains visible through the HUD while the
 * illuminated perimeter creates the glass effect.
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
        max-w-[67%]
        overflow-visible
      "
    >
      {/* Main transparent liquid-glass perimeter. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 190 38"
        preserveAspectRatio="none"
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          overflow-visible
          drop-shadow-[0_0_5px_rgba(0,200,255,0.55)]
        "
      >
        <defs>
          <linearGradient
            id="market-flux-player-edge"
            x1="0"
            y1="0"
            x2="190"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0"
              stopColor="#d2faff"
              stopOpacity="0.98"
            />
            <stop
              offset="0.1"
              stopColor="#41d5ff"
              stopOpacity="0.82"
            />
            <stop
              offset="0.42"
              stopColor="#0aa8ef"
              stopOpacity="0.46"
            />
            <stop
              offset="0.72"
              stopColor="#22bfff"
              stopOpacity="0.62"
            />
            <stop
              offset="0.9"
              stopColor="#9af0ff"
              stopOpacity="0.9"
            />
            <stop
              offset="1"
              stopColor="#e3fcff"
              stopOpacity="0.96"
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
              offset="0.13"
              stopColor="#ffffff"
              stopOpacity="0.78"
            />
            <stop
              offset="0.5"
              stopColor="#baf5ff"
              stopOpacity="0.3"
            />
            <stop
              offset="0.86"
              stopColor="#ffffff"
              stopOpacity="0.55"
            />
            <stop
              offset="1"
              stopColor="#ffffff"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Main HUD outline. No fill. */}
        <path
          d="
            M13 1
            L178 1
            Q189 1 189 12
            L189 26
            Q189 37 178 37
            L13 37
            L2 19
            Z
          "
          fill="none"
          stroke="url(#market-flux-player-edge)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* The defining sharp junction from the reference. */}
        <path
          d="
            M13 2
            L3.5 19
            L13 36
          "
          fill="none"
          stroke="rgba(210,250,255,0.82)"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Bright edge immediately around the point. */}
        <path
          d="M3.5 19 L12.5 2"
          fill="none"
          stroke="rgba(119,232,255,0.68)"
          strokeWidth="0.65"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Upper liquid reflection. */}
        <path
          d="M20 2.8 L171 2.8"
          fill="none"
          stroke="url(#market-flux-player-highlight)"
          strokeWidth="0.7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Lower reflected edge. */}
        <path
          d="M21 35.2 L167 35.2"
          fill="none"
          stroke="rgba(33,190,245,0.22)"
          strokeWidth="0.55"
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
          h-[38px]
          items-center
          gap-2
          pl-4
          pr-3
        "
      >
        <Avatar />

        <div className="flex min-w-0 items-center gap-2">
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
        h-7
        w-7
        shrink-0
        place-items-center
        rounded-full
        border
        border-cyan-100/55
        bg-transparent
        shadow-[inset_0_0_7px_rgba(0,190,255,0.24),0_0_6px_rgba(0,190,255,0.18)]
      "
    >
      <UserRound
        aria-hidden="true"
        className="
          h-4
          w-4
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
 * Icons are intentionally aligned with the metric label rather than
 * vertically centered against the entire label/value block.
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
      <div className="flex items-center gap-1">
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
            text-[6.5px]
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
          mt-[3px]
          whitespace-nowrap
          text-[10px]
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
        h-5
        w-px
        shrink-0
        bg-gradient-to-b
        from-white/55
        via-cyan-300/55
        to-white/35
        shadow-[0_0_4px_rgba(90,220,255,0.35)]
      "
    />
  )
}

export default MarketFluxHeader