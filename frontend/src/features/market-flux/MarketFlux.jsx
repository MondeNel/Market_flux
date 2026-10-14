/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Mobile-first Market Flux game stage. The simulation hook owns all game state.
 * AppShell owns the persistent bottom navigation.
 *
 * Layout contract:
 * - A single viewport-height game surface on mobile
 * - No duplicate market heading or nested round-progress housing
 * - Dedicated space for controls and multiplier progression
 * - The reel is the flexible visual centre, not the layout's size authority
 *
 * IMPORTANT: Set --market-flux-nav-height to the actual AppShell navigation
 * height if it differs from 64px. AppShell must not add additional vertical
 * padding to this component or independently scroll its content.
 */

import MarketFluxHeader from './components/MarketFluxHeader'
import MarketTicker from './components/MarketTicker'
import MarketNumberSpinner from './components/MarketNumberSpinner'
import LivePriceRow from './components/LivePriceRow'
import StatusLine from './components/StatusLine'
import RoundInfoPanel from './components/RoundInfoPanel'
import MultiplierLadder from './components/MultiplierLadder'
import SwipePanel from './components/SwipePanel'
import StakeControl from './components/StakeControl'

import {
  ROUND_CONFIG,
  useMarketSimulation,
} from './hooks/useMarketSimulation'
import { formatMoney } from './utils/formatMoney'

/** Read the engine's round multiplier without assuming ROUND_CONFIG is an array. */
function getRoundMultiplier(round) {
  if (Array.isArray(ROUND_CONFIG)) {
    const entry = ROUND_CONFIG.find((item) => item?.round === round)
    if (entry && Number.isFinite(Number(entry.multiplier))) {
      return Number(entry.multiplier)
    }
    const indexed = ROUND_CONFIG[round - 1]
    if (Number.isFinite(Number(indexed?.multiplier))) {
      return Number(indexed.multiplier)
    }
    if (Number.isFinite(Number(indexed))) return Number(indexed)
  }

  if (ROUND_CONFIG && typeof ROUND_CONFIG === 'object') {
    const entry = ROUND_CONFIG[round] ?? ROUND_CONFIG[String(round)]
    if (Number.isFinite(Number(entry?.multiplier))) {
      return Number(entry.multiplier)
    }
    if (Number.isFinite(Number(entry))) return Number(entry)
  }

  return 1
}

/** Informational payout display; actual winnings are calculated by the hook. */
function RoundReward({ round, stake }) {
  const multiplier = getRoundMultiplier(round)
  const amount = Number(stake ?? 0) * multiplier

  return (
    <section
      aria-label={`Round ${round} potential payout`}
      className="relative flex h-full min-h-0 w-full items-center justify-center"
    >
      <div
        className="relative flex h-full w-full max-w-[680px] flex-col items-center justify-center overflow-hidden border border-cyan-400/45 bg-[linear-gradient(180deg,rgba(8,38,55,0.9),rgba(0,8,18,0.92)_45%,rgba(5,31,46,0.9))] px-3 text-center shadow-[inset_0_1px_1px_rgba(220,250,255,0.28),0_5px_12px_rgba(0,0,0,0.5)]"
        style={{ clipPath: 'polygon(4% 0,96% 0,100% 18%,100% 82%,96% 100%,4% 100%,0 82%,0 18%)' }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent" />
        <p className="relative text-[9px] font-extrabold uppercase leading-tight tracking-[0.16em] text-cyan-100 min-[600px]:text-xs">
          Win this round
        </p>
        <strong className="relative block text-[clamp(24px,5.5dvh,43px)] font-black leading-none tracking-tight text-[#d7fbff] [text-shadow:0_0_12px_rgba(0,210,255,0.65)]">
          +{formatMoney(amount)}
        </strong>
        <span className="relative text-[clamp(14px,2.8dvh,21px)] font-black leading-none text-cyan-200">
          ×{multiplier}
        </span>
      </div>
    </section>
  )
}

function MarketFlux() {
  const game = useMarketSimulation()
  const roundActive = game.phase !== 'idle'
  const decimals = game.market?.decimals ?? 2

  return (
    <div
      className="relative isolate flex w-full min-w-0 flex-col overflow-hidden"
      style={{
        // AppShell should reserve the bottom-nav space only once.
        height: 'calc(100dvh - var(--market-flux-nav-height, 64px) - env(safe-area-inset-bottom, 0px))',
        maxHeight: '100%',
      }}
    >
      <header className="relative z-40 min-h-0 shrink-0">
        <MarketFluxHeader balance={game.balance} />
      </header>

      <main
        aria-label="Market Flux game"
        className="relative mx-auto grid min-h-0 w-full max-w-[860px] flex-1 grid-cols-1 gap-y-[clamp(3px,0.65dvh,7px)] overflow-hidden px-2 pb-1 pt-1 sm:px-4"
        style={{
          // The spinner is the only elastic row. Every other section has a budget.
          gridTemplateRows: [
            'clamp(42px, 6dvh, 52px)',  // market ticker
            'clamp(27px, 4dvh, 35px)',  // live price
            'minmax(88px, 1fr)',        // mechanical reel
            'clamp(18px, 2.8dvh, 25px)',// status
            'clamp(38px, 5.5dvh, 46px)',// round rail
            'clamp(65px, 10dvh, 90px)', // reward
            'clamp(58px, 9dvh, 78px)',  // multiplier track
            'clamp(72px, 10dvh, 86px)', // controls
          ].join(' '),
        }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] top-[15%] h-[38%] rounded-full bg-cyan-400/[0.06] blur-[45px]" />

        {/* One market selection rail; no repeated Bitcoin heading. */}
        <section aria-label="Market selection" className="relative z-30 min-h-0 min-w-0">
          <MarketTicker
            market={game.market}
            markets={game.markets}
            canSelect={game.canSelectMarket}
            onSelect={game.selectMarket}
          />
        </section>

        <section aria-label="Live market information" className="relative z-20 flex min-h-0 min-w-0 items-center justify-center overflow-hidden">
          <LivePriceRow
            price={game.price}
            decimals={decimals}
            direction={game.direction}
            marketName={game.market?.name}
            phase={game.phase}
          />
        </section>

        {/* The reel's OWN component height must be made responsive next. */}
        <section aria-label="Mechanical market result reel" className="relative z-10 flex min-h-0 min-w-0 items-center justify-center overflow-hidden">
          <div className="relative flex h-full min-h-0 w-full items-center justify-center">
            <MarketNumberSpinner
              value={game.resultPrice ?? game.price}
              decimals={decimals}
              tease={game.teasing}
              phase={game.phase}
              startPrice={game.startPrice}
            />
          </div>
        </section>

        <section aria-label="Game status" className="relative z-20 flex min-h-0 min-w-0 items-center justify-center overflow-hidden text-center">
          <StatusLine
            phase={game.phase}
            outcome={game.outcome}
            netResult={game.netResult}
            prediction={game.prediction}
            isBroke={game.isBroke}
            elapsed={game.elapsed}
          />
        </section>

        {/* RoundInfoPanel already draws its own housing. */}
        <section aria-label="Round progress" className="relative z-20 flex min-h-0 min-w-0 items-center justify-center overflow-hidden">
          <RoundInfoPanel
            round={game.round}
            roundsPlayed={game.roundsPlayed}
            stake={game.stake}
          />
        </section>

        <RoundReward round={game.round} stake={game.stake} />

        <section aria-label="Round multiplier progression" className="relative z-20 flex min-h-0 min-w-0 items-center justify-center overflow-hidden">
          <MultiplierLadder
            round={game.round}
            roundsPlayed={game.roundsPlayed}
            completedRounds={game.completedRounds}
            stake={game.stake}
          />
        </section>

        <section aria-label="Predict the market direction" className="relative z-30 flex min-h-0 min-w-0 items-center">
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_92px_minmax(0,1fr)] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)] sm:gap-3">
            <SwipePanel
              direction="up"
              disabled={!game.canSpin}
              selected={roundActive && game.prediction === 'up'}
              dimmed={roundActive && game.prediction === 'down'}
              onSelect={game.spin}
            />
            <StakeControl
              stake={game.stake}
              canDecrease={game.canDecrease}
              canIncrease={game.canIncrease}
              onDecrease={game.decreaseStake}
              onIncrease={game.increaseStake}
              isBroke={game.isBroke}
              onRestart={game.reset}
            />
            <SwipePanel
              direction="down"
              disabled={!game.canSpin}
              selected={roundActive && game.prediction === 'down'}
              dimmed={roundActive && game.prediction === 'up'}
              onSelect={game.spin}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default MarketFlux
