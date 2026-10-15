/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Compact, single-screen Market Flux game stage.
 * The simulation hook owns game state; AppShell owns bottom navigation.
 *
 * AppShell contract:
 * - If AppShell already reserves nav space, set --market-flux-nav-height: 0px.
 * - Otherwise set it to the actual nav height (default 64px).
 * - Do not add a second scrolling container around this stage.
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

import { ROUND_CONFIG, useMarketSimulation } from './hooks/useMarketSimulation'
import { formatMoney } from './utils/formatMoney'

function getRoundMultiplier(round) {
  if (Array.isArray(ROUND_CONFIG)) {
    const entry = ROUND_CONFIG.find((item) => item && typeof item === 'object' && Number(item.round) === Number(round))
    const fallback = ROUND_CONFIG[round - 1]
    const value = entry?.multiplier ?? fallback?.multiplier ?? fallback
    return Number.isFinite(Number(value)) ? Number(value) : 1
  }

  if (ROUND_CONFIG && typeof ROUND_CONFIG === 'object') {
    const entry = ROUND_CONFIG[round] ?? ROUND_CONFIG[String(round)]
    const value = entry?.multiplier ?? entry
    return Number.isFinite(Number(value)) ? Number(value) : 1
  }

  return 1
}

/** Presentation only. The simulation engine determines actual winnings. */
function RoundReward({ round, stake }) {
  const multiplier = getRoundMultiplier(round)
  const payout = Number(stake ?? 0) * multiplier

  return (
    <section
      aria-label={`Round ${round} potential payout`}
      className="relative flex h-full min-h-0 min-w-0 items-center justify-center"
    >
      <div
        className="relative flex h-full w-full max-w-[680px] min-w-0 flex-col items-center justify-center overflow-hidden border border-cyan-300/40 bg-[linear-gradient(180deg,rgba(9,43,62,0.85),rgba(0,8,18,0.94)_46%,rgba(5,37,53,0.87))] px-3 text-center shadow-[inset_0_1px_1px_rgba(210,250,255,0.28),0_4px_10px_rgba(0,0,0,0.5)]"
        style={{ clipPath: 'polygon(4% 0,96% 0,100% 22%,100% 78%,96% 100%,4% 100%,0 78%,0 22%)' }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/75 to-transparent" />
        <span className="text-[9px] font-extrabold uppercase leading-none tracking-[0.15em] text-cyan-100 sm:text-[11px]">
          Win this round
        </span>
        <strong className="mt-[2px] block text-[clamp(22px,4.3dvh,36px)] font-black leading-none tracking-tight text-[#d7fbff] [text-shadow:0_0_10px_rgba(0,210,255,0.55)]">
          +{formatMoney(payout)}
        </strong>
        <span className="mt-[2px] text-[clamp(12px,2.2dvh,17px)] font-black leading-none text-cyan-200">
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
    <div className="relative isolate flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <header className="relative z-40 shrink-0">
        <MarketFluxHeader balance={game.balance} />
      </header>

      <main
        aria-label="Market Flux game"
        className="relative mx-auto grid min-h-0 w-full max-w-[860px] flex-1 grid-cols-1 gap-y-[clamp(2px,0.45dvh,5px)] overflow-hidden px-2 pb-1 pt-1 sm:px-4"
        style={{
          // Compact fixed rows leave the centre reel to absorb remaining height.
          // The minimum reel height supports the 52px digit chamber and 80px frame.
          gridTemplateRows: [
            'clamp(40px,5.7dvh,49px)',
            'clamp(22px,3.4dvh,29px)',
            'minmax(80px,1fr)',
            'clamp(16px,2.5dvh,21px)',
            'clamp(34px,4.7dvh,42px)',
            'clamp(54px,8dvh,72px)',
            'clamp(65px,9.8dvh,76px)',
            'clamp(72px,10.5dvh,86px)',
          ].join(' '),
        }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[14%] top-[12%] h-[42%] rounded-full bg-cyan-400/[0.06] blur-[45px]" />

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

        <section aria-label="Mechanical market result reel" className="relative z-10 flex min-h-0 min-w-0 items-center justify-center overflow-hidden">
          <div className="flex h-full min-h-0 w-full items-center justify-center">
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

        {/* RoundInfoPanel supplies its own angular glass enclosure. */}
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

        <section aria-label="Predict the market direction" className="relative z-30 flex min-h-0 min-w-0 items-center overflow-hidden">
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_92px_minmax(0,1fr)] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)] sm:gap-3">
            <SwipePanel
              direction="up"
              disabled={!game.canSpin}
              selected={roundActive && game.prediction === 'up'}
              dimmed={roundActive && game.prediction === 'down'}
              onSelect={game.spin}
            />
            <div className="flex min-w-0 items-center justify-center">
              <StakeControl
                stake={game.stake}
                canDecrease={game.canDecrease}
                canIncrease={game.canIncrease}
                onDecrease={game.decreaseStake}
                onIncrease={game.increaseStake}
                isBroke={game.isBroke}
                onRestart={game.reset}
              />
            </div>
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
