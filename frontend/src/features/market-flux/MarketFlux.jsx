/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Main Market Flux game screen.
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
  useMarketSimulation,
} from './hooks/useMarketSimulation'

function MarketFlux() {
  const game = useMarketSimulation()

  const roundActive =
    game.phase !== 'idle'

  const decimals =
    game.market?.decimals ?? 2

  return (
    <div
      className="
        relative
        flex
        min-h-0
        w-full
        flex-1
        flex-col
        overflow-hidden
        pb-1
      "
    >
      {/* HEADER */}
      <header className="relative z-[60] shrink-0">
        <MarketFluxHeader
          balance={game.balance}
        />
      </header>

      {/* MARKET SELECTOR */}
      <section
        aria-label="Market selection"
        className="
          relative
          z-[70]
          shrink-0
          px-3
          pt-0.5
        "
      >
        <MarketTicker
          market={game.market}
          markets={game.markets}
          canSelect={game.canSelectMarket}
          onSelect={game.selectMarket}
        />
      </section>

      {/* MAIN GAME MACHINE */}
      <main
        aria-label="Market Flux game"
        className="
          relative
          flex
          min-h-0
          flex-1
          flex-col
          px-2.5
          pt-1
        "
      >
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[15%]
            z-0
            h-48
            w-64
            -translate-x-1/2
            rounded-full
            bg-cyan-400/[0.08]
            blur-3xl
          "
        />

        <section
          aria-label="Market Flux machine"
          className="
            relative
            z-10
            flex
            min-h-0
            flex-1
            flex-col
            overflow-visible
          "
        >
          {/* UPPER MACHINE */}
          <div
            className="
              relative
              flex
              min-h-0
              flex-1
              flex-col
              overflow-visible
              rounded-[28px]
              border
              border-cyan-400/30
              bg-[linear-gradient(180deg,rgba(4,12,20,0.85)_0%,rgba(1,4,8,0.95)_100%)]
              shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-20px_40px_rgba(0,0,0,0.8)]
              backdrop-blur-2xl
            "
          >
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-8
                top-0
                z-50
                h-[2px]
                bg-gradient-to-r
                from-transparent
                via-cyan-300/60
                to-transparent
                shadow-[0_0_8px_rgba(0,191,255,0.8)]
              "
            />

            {/* MARKET SIGNAL ROW */}
            <div
              className="
                relative
                z-30
                flex
                shrink-0
                items-center
                justify-between
                px-4
                pt-2.5
                pb-1.5
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                "
              >
                <span
                  className="
                    relative
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-cyan-400/40
                    bg-cyan-950/60
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_0_10px_rgba(0,191,255,0.2)]
                  "
                >
                  <span
                    className="
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-cyan-400
                      shadow-[0_0_8px_rgba(0,191,255,1)]
                    "
                  />
                </span>

                <div className="min-w-0">
                  <div
                    className="
                      truncate
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-white
                    "
                  >
                    {game.market?.name ?? 'Market'}
                  </div>

                  <div
                    className="
                      text-[9px]
                      font-bold
                      tracking-[0.12em]
                      text-cyan-400/60
                    "
                  >
                    LIVE MARKET
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <LivePriceRow
                  price={game.price}
                  decimals={decimals}
                  direction={game.direction}
                  marketName={game.market?.name}
                  phase={game.phase}
                />
              </div>
            </div>

            {/* RESULT REEL */}
            <div
              className="
                relative
                z-20
                flex
                min-h-0
                flex-1
                items-center
                justify-center
                px-2
              "
            >
              <div
                className="
                  relative
                  w-full
                "
              >
                <MarketNumberSpinner
                  value={
                    game.resultPrice ??
                    game.price
                  }
                  decimals={decimals}
                  tease={game.teasing}
                  phase={game.phase}
                  startPrice={game.startPrice}
                />
              </div>
            </div>

            {/* STATUS LINE */}
            <div
              className="
                relative
                z-30
                shrink-0
                px-4
                pb-2
              "
            >
              <StatusLine
                phase={game.phase}
                outcome={game.outcome}
                netResult={game.netResult}
                prediction={game.prediction}
                isBroke={game.isBroke}
                elapsed={game.elapsed}
              />
            </div>
          </div>

          {/* ROUND CONTROL DECK */}
          <div
            className="
              relative
              z-30
              mt-2
              shrink-0
              rounded-[22px]
              border
              border-cyan-400/30
              bg-[linear-gradient(180deg,rgba(4,12,20,0.8)_0%,rgba(1,4,8,0.92)_100%)]
              px-3
              py-2.5
              shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-10px_20px_rgba(0,0,0,0.6)]
              backdrop-blur-xl
            "
          >
            <RoundInfoPanel
              round={game.round}
              roundsPlayed={game.roundsPlayed}
              stake={game.stake}
            />

            <div className="mt-2">
              <MultiplierLadder
                round={game.round}
                roundsPlayed={game.roundsPlayed}
                completedRounds={
                  game.completedRounds
                }
                stake={game.stake}
              />
            </div>
          </div>

          {/* DECISION DECK (UP / STAKE / DOWN) */}
          <section
            aria-label="Predict the market direction"
            className="
              relative
              z-40
              mt-2
              shrink-0
            "
          >
            <div
              className="
                relative
                grid
                grid-cols-[1fr_auto_1fr]
                items-center
                gap-2.5
              "
            >
              <SwipePanel
                direction="up"
                disabled={!game.canSpin}
                selected={
                  roundActive &&
                  game.prediction === 'up'
                }
                dimmed={
                  roundActive &&
                  game.prediction === 'down'
                }
                onSelect={game.spin}
              />

              <div
                className="
                  relative
                  flex
                  min-w-[90px]
                  items-center
                  justify-center
                "
              >
                <StakeControl
                  stake={game.stake}
                  canDecrease={game.canDecrease}
                  canIncrease={game.canIncrease}
                  onDecrease={
                    game.decreaseStake
                  }
                  onIncrease={
                    game.increaseStake
                  }
                  isBroke={game.isBroke}
                  onRestart={game.reset}
                />
              </div>

              <SwipePanel
                direction="down"
                disabled={!game.canSpin}
                selected={
                  roundActive &&
                  game.prediction === 'down'
                }
                dimmed={
                  roundActive &&
                  game.prediction === 'up'
                }
                onSelect={game.spin}
              />
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default MarketFlux