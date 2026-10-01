/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Market Flux game screen.
 *
 * Layout, top to bottom:
 * header, market ticker, play area (Up panel / ladder / Down panel),
 * prediction bar, stake control.
 *
 * The viewport, background artwork and max width are owned by AppShell.
 */

import MarketFluxHeader from './components/MarketFluxHeader'
import MarketTicker from './components/MarketTicker'
import MultiplierLadder, { BonusBadge } from './components/MultiplierLadder'
import PredictionBar from './components/PredictionBar'
import StakeControl from './components/StakeControl'
import SwipePanel from './components/SwipePanel'
import { TOP_STEP, useMarketSimulation } from './hooks/useMarketSimulation'

function MarketFlux() {
  const game = useMarketSimulation()
  const roundActive = game.phase !== 'idle'

  return (
    <div className="flex min-h-dvh w-full flex-col gap-3 pb-4">
      <MarketFluxHeader balance={game.balance} />

      <MarketTicker
        market={game.market}
        markets={game.markets}
        price={game.price}
        direction={game.direction}
        isRoundLive={game.phase === 'live' || game.phase === 'revealing'}
        tease={game.teasing}
        canSelect={game.canSelectMarket}
        onSelect={game.selectMarket}
      />

      {/* Play area: bonus above the ladder, slim panels either side */}
      <section
        aria-label="Prediction"
        className="
          grid
          flex-1
          grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)_minmax(0,1fr)]
          grid-rows-[auto_minmax(0,1fr)]
          gap-x-3
          gap-y-2
          px-3
        "
      >
        <div className="col-start-2 row-start-1 flex justify-center">
          <BonusBadge reached={game.step === TOP_STEP} />
        </div>

        <div className="col-start-1 row-start-2 min-h-[270px]">
          <SwipePanel
            direction="up"
            disabled={!game.canPredict}
            selected={roundActive && game.prediction === 'up'}
            dimmed={roundActive && game.prediction === 'down'}
            onSelect={game.predict}
          />
        </div>

        <div className="col-start-2 row-start-2">
          <MultiplierLadder step={game.step} />
        </div>

        <div className="col-start-3 row-start-2 min-h-[270px]">
          <SwipePanel
            direction="down"
            disabled={!game.canPredict}
            selected={roundActive && game.prediction === 'down'}
            dimmed={roundActive && game.prediction === 'up'}
            onSelect={game.predict}
          />
        </div>
      </section>

      <PredictionBar
        changePct={game.changePct}
        round={game.round}
        stake={game.stake}
        phase={game.phase}
        prediction={game.prediction}
        elapsed={game.elapsed}
        outcome={game.outcome}
      />

      <StakeControl
        stake={game.stake}
        canDecrease={game.canDecrease}
        canIncrease={game.canIncrease}
        onDecrease={game.decreaseStake}
        onIncrease={game.increaseStake}
        isBroke={game.isBroke}
        onReset={game.reset}
      />
    </div>
  )
}

export default MarketFlux