/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Market Flux's reference-inspired mechanical game stage.
 *
 * The simulation hook remains the sole owner of game state. This screen
 * composes the header, market selector, live readout, mechanical reel,
 * round progression, reward display, multiplier track and direction controls.
 * The persistent bottom navigation belongs to AppShell.
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

/** Angled chrome/glass enclosure shared by the reference's lower consoles. */
function MachineConsole({ children, className = '' }) {
  return (
    <div
      className={`relative isolate min-w-0 overflow-hidden border border-cyan-300/45 bg-[linear-gradient(160deg,rgba(7,44,65,0.88)_0%,rgba(0,9,19,0.94)_32%,rgba(0,6,13,0.96)_70%,rgba(5,48,69,0.86)_100%)] shadow-[0_12px_25px_rgba(0,0,0,0.75),0_0_15px_rgba(0,192,255,0.16),inset_0_2px_2px_rgba(174,243,255,0.4),inset_0_-3px_10px_rgba(0,0,0,0.9)] backdrop-blur-xl ${className}`}
      style={{ clipPath: 'polygon(5% 0,95% 0,100% 19%,100% 83%,95% 100%,5% 100%,0 83%,0 19%)' }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-100 to-transparent shadow-[0_0_12px_rgba(0,230,255,0.9)]" />
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-[20%] bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
    </div>
  )
}

/** Display-only reward; settlement continues to be handled by the engine. */
function RoundReward({ round, stake }) {
  const configuration = ROUND_CONFIG.find((item) => item.round === round)
  const multiplier = configuration?.multiplier ?? 1
  const amount = Number(stake ?? 0) * multiplier

  return (
    <section aria-label={`Round ${round} potential payout`} className="relative mx-auto w-full max-w-[760px]">
      <MachineConsole className="px-5 py-3 text-center sm:py-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-[7px] border border-cyan-300/15" style={{ clipPath: 'polygon(5% 0,95% 0,100% 20%,100% 80%,95% 100%,5% 100%,0 80%,0 20%)' }} />
        <p className="relative text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-100 sm:text-sm">
          Win this round
        </p>
        <div className="relative mt-0.5 text-[clamp(30px,8vw,66px)] font-black leading-none tracking-tight text-[#d7fbff] [text-shadow:0_0_7px_rgba(255,255,255,0.8),0_0_20px_rgba(0,210,255,0.85),0_0_35px_rgba(0,150,255,0.5)]">
          +{formatMoney(amount)}
        </div>
        <div className="relative mt-0.5 text-[clamp(19px,5vw,36px)] font-black leading-none text-cyan-200 [text-shadow:0_0_12px_rgba(0,200,255,0.8)]">
          ×{multiplier}
        </div>
      </MachineConsole>
    </section>
  )
}

function MarketFlux() {
  const game = useMarketSimulation()
  const roundActive = game.phase !== 'idle'
  const decimals = game.market?.decimals ?? 2

  return (
    <div className="relative flex w-full min-w-0 flex-1 flex-col pb-2">
      {/* Header and market selector float over the atmospheric background. */}
      <header className="relative z-[60] shrink-0">
        <MarketFluxHeader balance={game.balance} />
      </header>

      <section aria-label="Market selection" className="relative z-[70] mx-auto w-full max-w-[800px] shrink-0 px-3 pt-1 sm:px-5">
        <MarketTicker
          market={game.market}
          markets={game.markets}
          canSelect={game.canSelectMarket}
          onSelect={game.selectMarket}
        />
      </section>

      <main aria-label="Market Flux game" className="relative mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-2.5 px-2 pt-3 sm:gap-4 sm:px-5 sm:pt-5">
        {/* Ambient stage lighting; no giant opaque black dashboard panel. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[5%] top-[10%] h-[42%] rounded-full bg-cyan-400/[0.07] blur-[65px]" />

        {/* Live market readout is a compact overlay, not a second housing. */}
        <section aria-label="Live market information" className="relative z-20 flex min-w-0 items-center justify-between gap-2 px-1 sm:px-5">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cyan-300/55 bg-[#031725] shadow-[0_0_10px_rgba(0,214,255,0.4),inset_0_0_8px_rgba(0,220,255,0.2)]">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,225,255,1)]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-white sm:text-xs">{game.market?.name ?? 'Market'}</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-cyan-300 sm:text-[10px]">Live market</p>
            </div>
          </div>
          <div className="min-w-0 max-w-[72%]">
            <LivePriceRow
              price={game.price}
              decimals={decimals}
              direction={game.direction}
              marketName={game.market?.name}
              phase={game.phase}
            />
          </div>
        </section>

        {/* Dominant physical machine: ReelFrame owns the barrel and end caps. */}
        <section aria-label="Mechanical market result reel" className="relative z-10 flex min-w-0 flex-col items-center justify-center py-2 sm:py-5">
          <div className="relative w-full">
            <MarketNumberSpinner
              value={game.resultPrice ?? game.price}
              decimals={decimals}
              tease={game.teasing}
              phase={game.phase}
              startPrice={game.startPrice}
            />
          </div>
          <div className="relative mt-1 w-full max-w-[820px] px-3 text-center">
            <StatusLine
              phase={game.phase}
              outcome={game.outcome}
              netResult={game.netResult}
              prediction={game.prediction}
              isBroke={game.isBroke}
              elapsed={game.elapsed}
            />
          </div>
        </section>

        {/* Round information: thin, full-width instrument rail. */}
        <section aria-label="Round progress" className="relative z-20">
          <MachineConsole className="px-3 py-2 sm:px-6 sm:py-3">
            <RoundInfoPanel
              round={game.round}
              roundsPlayed={game.roundsPlayed}
              stake={game.stake}
            />
          </MachineConsole>
        </section>

        {/* Large reward console, absent from the previous composition. */}
        <RoundReward round={game.round} stake={game.stake} />

        {/* Single connected multiplier track; no additional parent card. */}
        <section aria-label="Round multiplier progression" className="relative z-20">
          <MultiplierLadder
            round={game.round}
            roundsPlayed={game.roundsPlayed}
            completedRounds={game.completedRounds}
            stake={game.stake}
          />
        </section>

        {/* Physical direction buttons and stake controls. */}
        <section aria-label="Predict the market direction" className="relative z-30 mt-1 pb-1 sm:mt-2">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(90px,0.9fr)_minmax(0,1fr)] items-center gap-1.5 sm:gap-4">
            <SwipePanel
              direction="up"
              disabled={!game.canSpin}
              selected={roundActive && game.prediction === 'up'}
              dimmed={roundActive && game.prediction === 'down'}
              onSelect={game.spin}
            />
            <div className="relative flex min-w-0 items-center justify-center">
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
