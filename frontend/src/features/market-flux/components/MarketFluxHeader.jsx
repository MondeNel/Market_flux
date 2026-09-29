/**
 * @file src/features/market-flux/components/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first HUD header for Market Flux, matched to the Wave-Ride reference.
 *
 * - Left: large wave glyph + wordmark, with a thin cyan accent line beneath.
 * - Right: one player panel with a pointed left edge and rounded right edge.
 *   Avatar, Balance, Rank, Followers, separated by dividers that share the
 *   panel's border colours.
 *
 * The panel outline is an SVG path so the pointed shape, gradient border and
 * glow stay crisp. The body is see-through (faint white sheen only), so the
 * background artwork shows in its own colours.
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
    <header className="relative w-full px-3 pt-3">
      <div className="flex items-center justify-between gap-2">
        <Brand />
        <PlayerPanel balance={balance} rank={rank} followers={followers} />
      </div>

      {/* Accent line under the brand */}
      <div
        aria-hidden="true"
        className="-ml-3 mt-2 h-px w-[46%] bg-gradient-to-r from-cyan-400/80 via-cyan-500/40 to-transparent shadow-[0_0_6px_rgba(0,190,255,0.6)]"
      />
    </header>
  )
}

/**
 * Brand: wave glyph plus wordmark. Floats directly on the scene.
 * The glyph is a stylised placeholder; swap in the final logo SVG when ready.
 *
 * @returns {JSX.Element}
 */
function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 52 44"
        className="h-[clamp(26px,8vw,34px)] w-[clamp(30px,9.5vw,40px)] shrink-0 drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]"
      >
        <defs>
          <linearGradient id="market-flux-glyph-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b6f6ff" />
            <stop offset="1" stopColor="#12b5f0" />
          </linearGradient>
          <linearGradient id="market-flux-glyph-deep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38c8ff" />
            <stop offset="1" stopColor="#1055d8" />
          </linearGradient>
        </defs>
        {/* Crest */}
        <path
          d="M3 30 C6 16 18 5 34 6 C40 6.5 44 9 46 12 C40 10.5 34 12 31 17 C29 21 30 25 33 28 C26 25 20 26 15 31 C11 34 6 34 3 30 Z"
          fill="url(#market-flux-glyph-light)"
        />
        {/* Base swoosh */}
        <path
          d="M8 37 C16 31 26 31 33 34 C37 36 41 36 46 33 C43 40 34 42 26 41 C18 40 12 40 8 37 Z"
          fill="url(#market-flux-glyph-deep)"
        />
        {/* Curl */}
        <path
          d="M36 24 C39 20 44 21 46 25 C47 29 44 32 40 32 C42 29 41 26 36 24 Z"
          fill="url(#market-flux-glyph-light)"
        />
      </svg>

      <h1 className="truncate text-[clamp(13px,4vw,16px)] font-black uppercase italic leading-none tracking-[0.03em] drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]">
        <span className="text-white">Market</span>
        <span className="text-cyan-300">-Flux</span>
      </h1>
    </div>
  )
}

/**
 * Player panel with pointed-left, rounded-right outline.
 *
 * @param {object} props
 * @param {number|string} props.balance
 * @param {number|string} props.rank
 * @param {number|string} props.followers
 * @returns {JSX.Element}
 */
function PlayerPanel({ balance, rank, followers }) {
  return (
    <div className="relative shrink-0">
      {/* Outline, sheen and glow */}
      <svg
        aria-hidden="true"
        viewBox="0 0 190 38"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_0_5px_rgba(0,200,255,0.6)]"
      >
        <defs>
          <linearGradient
            id="market-flux-panel-edge"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="190"
            y2="38"
          >
            <stop offset="0" stopColor="#5adcff" stopOpacity="0.75" />
            <stop offset="0.35" stopColor="#1ea8ff" stopOpacity="0.55" />
            <stop offset="0.75" stopColor="#7aeaff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="market-flux-panel-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#00a0ff" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="market-flux-panel-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M13 1 L178 1 Q189 1 189 12 L189 26 Q189 37 178 37 L13 37 L1 19 Z"
          fill="url(#market-flux-panel-fill)"
          stroke="url(#market-flux-panel-edge)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Specular highlight along the top edge */}
        <path
          d="M22 2.8 L168 2.8"
          fill="none"
          stroke="url(#market-flux-panel-sheen)"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="relative z-10 flex h-[38px] items-center gap-2 pl-4 pr-3">
        <Avatar />

        <div className="flex items-center gap-2">
          <Metric label="Balance" value={`R ${Number(balance).toFixed(2)}`} />
          <MetricDivider />
          <Metric icon={Crown} label="Rank" value={`#${rank}`} />
          <MetricDivider />
          <Metric icon={UsersRound} label="Followers" value={followers} />
        </div>
      </div>
    </div>
  )
}

/**
 * Player avatar badge at the start of the panel.
 *
 * @returns {JSX.Element}
 */
function Avatar() {
  return (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cyan-300/50 bg-slate-950/50 shadow-[inset_0_0_8px_rgba(0,190,255,0.35)]">
      <UserRound
        aria-hidden="true"
        className="h-4 w-4 fill-current text-cyan-100"
        strokeWidth={1.5}
      />
    </div>
  )
}

/**
 * Metric: optional leading icon, label above value. All values are white.
 *
 * @param {object} props
 * @param {React.ElementType} [props.icon] Lucide icon shown before the text.
 * @param {string} props.label Metric label.
 * @param {string|number} props.value Metric value.
 * @returns {JSX.Element}
 */
function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1">
      {Icon && (
        <Icon
          aria-hidden="true"
          className="h-3 w-3 shrink-0 text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
          strokeWidth={2}
        />
      )}
      <div className="flex flex-col leading-none">
        <span className="text-[6.5px] font-semibold text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
          {label}
        </span>
        <span className="mt-[3px] text-[10px] font-extrabold tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]">
          {value}
        </span>
      </div>
    </div>
  )
}

/**
 * Vertical separator between metrics. Uses the same colours and thickness as
 * the panel border.
 *
 * @returns {JSX.Element}
 */
function MetricDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-5 w-[1.5px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(90,220,255,0.9)_50%,rgba(255,255,255,0.92))] shadow-[0_0_6px_rgba(90,220,255,0.55)]"
    />
  )
}

export default MarketFluxHeader