/**
 * @file src/features/market-flux/MarketFluxHeader.jsx
 *
 * @description
 * Mobile-first neon HUD header for Market Flux.
 *
 * Layout (matches the reference):
 * - Left: glowing rounded-square wave logo + italic "MARKET FLUX" wordmark
 * - Right: one glowing pill panel holding three stat cells separated by
 *   thin vertical dividers: Balance, Rank, Followers
 *
 * Market information belongs to the game area, not the header.
 */

import { Crown, User, Users } from 'lucide-react'

/**
 * A single stat cell inside the HUD panel.
 */
function StatCell({ icon, label, value, className = '' }) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] px-2 ${className}`}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[8px] font-semibold leading-none text-slate-300/80">
          {label}
        </span>
      </div>

      <span className="whitespace-nowrap text-[13px] font-extrabold leading-none tracking-wide text-white">
        {value}
      </span>
    </div>
  )
}

/**
 * Market Flux player HUD header.
 *
 * @param {Object} props
 * @param {number} [props.balance=124.5] - Player wallet balance.
 * @param {number} [props.rank=94] - Player leaderboard rank.
 * @param {number} [props.followers=20] - Number of followers.
 * @returns {JSX.Element}
 */
function MarketFluxHeader({ balance = 124.5, rank = 94, followers = 20 }) {
  const formattedBalance = balance.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <header className="relative z-20 w-full px-3 pt-[max(10px,env(safe-area-inset-top))]">
      <div className="flex h-[60px] items-center justify-between gap-2.5">
        {/* ================================================================
            APP IDENTITY
            ================================================================ */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Logo tile */}
          <div
            className="
              relative flex h-[42px] w-[42px] shrink-0 items-center justify-center
              overflow-hidden rounded-[13px]
              border border-cyan-300/50
              bg-gradient-to-b from-[#0c2a52] to-[#06152c]
              shadow-[0_0_14px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-6px_10px_rgba(0,0,0,0.4)]
            "
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1.5 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-3 -top-3 h-9 w-9 rounded-full bg-cyan-300/25 blur-xl"
            />

            {/* Flux wave mark */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
              className="relative h-[26px] w-[26px] drop-shadow-[0_0_6px_rgba(103,232,249,0.85)]"
            >
              <defs>
                <linearGradient id="mf-wave" x1="4" y1="6" x2="28" y2="28">
                  <stop offset="0" stopColor="#a5f3fc" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <path
                d="M3 19c3.5-8 8-12 13-12 4.2 0 6.6 2.7 6.2 5.6-.3 2-2.3 3-3.7 2-1.2-.9-.9-2.5.2-3.1"
                stroke="url(#mf-wave)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M3 26c4-3.6 7.6-3.6 11 0s7 3.6 11 0"
                stroke="url(#mf-wave)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M7 21.5c3-2 5.5-2 8 0s5 2 8 0"
                stroke="#67e8f9"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity=".5"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <h1
            className="
              truncate text-[17px] font-black italic leading-none tracking-[0.04em]
              text-white
              [text-shadow:0_0_10px_rgba(56,189,248,0.75),0_0_2px_rgba(255,255,255,0.6)]
            "
          >
            MARKET<span className="text-cyan-300">-</span>FLUX
          </h1>
        </div>

        {/* ================================================================
            PLAYER STATS PANEL
            ================================================================ */}
        <div
          className="
            relative flex h-[46px] min-w-0 max-w-[62%] shrink items-stretch
            overflow-hidden rounded-[14px]
            border border-cyan-400/60
            bg-gradient-to-b from-[#0a2140]/90 to-[#050f22]/95
            py-1.5
            shadow-[0_0_16px_rgba(34,211,238,0.35),inset_0_0_14px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]
            backdrop-blur-xl
          "
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
          />

          {/* Balance */}
          <div className="flex min-w-0 items-center gap-1.5 pl-2 pr-2">
            <div
              className="
                flex h-[24px] w-[24px] shrink-0 items-center justify-center
                rounded-full border border-cyan-300/50 bg-cyan-300/10
                shadow-[0_0_8px_rgba(34,211,238,0.35)]
              "
            >
              <User size={13} strokeWidth={2.2} className="text-white" />
            </div>

            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-[8px] font-semibold leading-none text-slate-300/80">
                Balance
              </span>
              <span className="whitespace-nowrap text-[13px] font-extrabold leading-none tracking-wide text-white">
                R {formattedBalance}
              </span>
            </div>
          </div>

          <span aria-hidden="true" className="w-px self-stretch bg-cyan-300/25" />

          {/* Rank */}
          <StatCell
            label="Rank"
            value={`#${rank}`}
            icon={
              <Crown
                size={10}
                strokeWidth={2.2}
                className="text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.7)]"
              />
            }
          />

          <span aria-hidden="true" className="w-px self-stretch bg-cyan-300/25" />

          {/* Followers */}
          <StatCell
            label="Followers"
            value={followers}
            icon={
              <Users
                size={10}
                strokeWidth={2.2}
                className="text-cyan-300 drop-shadow-[0_0_4px_rgba(103,232,249,0.7)]"
              />
            }
          />
        </div>
      </div>
    </header>
  )
}

export default MarketFluxHeader