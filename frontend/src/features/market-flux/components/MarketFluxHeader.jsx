/**
 * @file src/features/market-flux/components/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first HUD header for Market Flux.
 *
 * Layout: free-floating brand on the left, one clear liquid-glass player
 * panel on the right (avatar, balance, rank, followers) with a shiny gradient
 * edge. No backdrop colour: the scene shows through the panel.
 *
 * Depends on the shared classes in src/styles/effects.css:
 * market-flux-liquid, market-flux-clear and market-flux-edge.
 *
 * No gameplay state is managed here.
 */

import {
  CircleUserRound,
  Trophy,
  UsersRound,
  WalletCards,
} from 'lucide-react'

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
      <div className="relative flex items-center justify-between gap-3">
        <Brand />

        <div
          className="
            market-flux-liquid
            market-flux-clear
            market-flux-edge
            flex
            min-w-0
            shrink-0
            items-center
            gap-1
            rounded-[14px]
            py-1.5
            pl-2
            pr-1
          "
        >
          <Avatar />

          <div className="relative z-[3] flex items-center">
            <HeaderMetric
              icon={WalletCards}
              label="Balance"
              value={`R ${Number(balance).toFixed(2)}`}
              valueClassName="text-white"
            />
            <MetricDivider />
            <HeaderMetric
              icon={Trophy}
              label="Rank"
              value={`#${rank}`}
              valueClassName="text-amber-300"
            />
            <MetricDivider />
            <HeaderMetric
              icon={UsersRound}
              label="Followers"
              value={followers}
              valueClassName="text-cyan-300"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * Brand: flux wave glyph plus wordmark. No container, it floats on the scene.
 *
 * @returns {JSX.Element}
 */
function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 40 32"
        className="h-6 w-8 shrink-0 drop-shadow-[0_0_8px_rgba(0,200,255,0.85)]"
      >
        <defs>
          <linearGradient id="market-flux-wave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9af3ff" />
            <stop offset="1" stopColor="#1e90ff" />
          </linearGradient>
        </defs>
        <path
          d="M2 19 C7 6, 14 6, 19 16 S30 26, 38 9"
          fill="none"
          stroke="url(#market-flux-wave)"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <path
          d="M2 27 C8 17, 14 17, 19 24 S30 31, 38 19"
          fill="none"
          stroke="url(#market-flux-wave)"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      <h1 className="truncate text-[11.5px] font-black uppercase italic tracking-[0.06em] drop-shadow-[0_0_6px_rgba(0,200,255,0.45)]">
        <span className="text-white">Market</span>
        <span className="text-cyan-300">-Flux</span>
      </h1>
    </div>
  )
}

/**
 * Player avatar badge shown at the start of the stats panel.
 *
 * @returns {JSX.Element}
 */
function Avatar() {
  return (
    <div className="relative z-[3] mr-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cyan-300/40 bg-slate-950/60 shadow-[inset_0_0_8px_rgba(0,190,255,0.35)]">
      <CircleUserRound
        aria-hidden="true"
        className="h-4 w-4 text-cyan-200"
        strokeWidth={1.75}
      />
    </div>
  )
}

/**
 * Reusable metric block.
 *
 * @param {object} props
 * @param {React.ElementType} props.icon Lucide icon component.
 * @param {string} props.label Metric label.
 * @param {string|number} props.value Metric value.
 * @param {string} [props.valueClassName] Value color classes.
 * @returns {JSX.Element}
 */
function HeaderMetric({
  icon: Icon,
  label,
  value,
  valueClassName = 'text-white',
}) {
  return (
    <div className="flex min-w-[44px] flex-col items-center justify-center px-1">
      <div className="mb-0.5 flex items-center gap-0.5">
        <Icon
          aria-hidden="true"
          className="h-2 w-2 text-slate-200"
          strokeWidth={2}
        />
        <span className="text-[5.5px] font-bold uppercase tracking-[0.12em] text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
          {label}
        </span>
      </div>

      <span
        className={`text-[9.5px] font-black leading-none tracking-tight tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Vertical separator between header metrics.
 *
 * @returns {JSX.Element}
 */
function MetricDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-6 w-px bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent"
    />
  )
}

export default MarketFluxHeader