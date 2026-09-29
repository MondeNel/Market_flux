/**
 * @file src/features/market-flux/components/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first HUD header for Market Flux.
 *
 * The header establishes the primary visual language of the game:
 * - Market Flux identity
 * - Player balance
 * - Player rank
 * - Follower count
 * - Dark liquid-glass HUD
 * - Cyan atmospheric edge lighting
 *
 * No gameplay state is managed here.
 */

import {
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
      {/* Atmospheric glow behind the HUD */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-2 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgba(0,184,255,0.16),transparent_68%)] blur-xl"
      />

      {/* Main HUD */}
      <div className="market-flux-glow market-flux-glass relative overflow-hidden rounded-[18px] border border-cyan-400/30">
        {/* Top glass highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
        />

        {/* Internal atmospheric light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 h-28 w-28 rounded-full bg-blue-600/10 blur-3xl"
        />

        {/* Header content */}
        <div className="relative flex min-h-[74px] items-center px-3 py-2.5">
          {/* Brand */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <BrandMark />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-[15px] font-black uppercase tracking-[0.14em] text-white">
                  Market
                </h1>
                <span className="text-[15px] font-black uppercase tracking-[0.14em] text-cyan-300">
                  Flux
                </span>
              </div>

              <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Predict the next move
              </p>
            </div>
          </div>

          {/* Player metrics */}
          <div className="flex shrink-0 items-center">
            <HeaderMetric
              icon={WalletCards}
              label="Balance"
              value={`R${Number(balance).toFixed(2)}`}
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

        {/* Bottom HUD edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        />
      </div>
    </header>
  )
}

/**
 * Brand icon used by the Market Flux wordmark.
 *
 * @returns {JSX.Element}
 */
function BrandMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-cyan-300/35 bg-slate-950/80 shadow-[0_0_18px_rgba(0,174,255,0.16)]">
      {/* Outer angular frame */}
      <div
        aria-hidden="true"
        className="absolute inset-[3px] rounded-[8px] border border-cyan-400/15"
      />

      {/* Flux symbol */}
      <div className="relative flex items-center gap-[2px]">
        <span className="block h-4 w-[3px] rotate-[24deg] rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
        <span className="block h-5 w-[3px] -rotate-[24deg] rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
        <span className="block h-3 w-[3px] rotate-[24deg] rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
      </div>

      {/* Corner accent */}
      <span
        aria-hidden="true"
        className="absolute right-[3px] top-[3px] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,1)]"
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
    <div className="flex min-w-[52px] flex-col items-center justify-center px-1.5">
      <div className="mb-1 flex items-center gap-1">
        <Icon
          aria-hidden="true"
          className="h-2.5 w-2.5 text-slate-500"
          strokeWidth={2}
        />
        <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
      </div>

      <span
        className={`text-[11px] font-black leading-none tracking-tight ${valueClassName}`}
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
      className="h-7 w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent"
    />
  )
}

export default MarketFluxHeader