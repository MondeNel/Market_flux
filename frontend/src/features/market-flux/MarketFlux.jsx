/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Market Flux game screen.
 *
 * Layout, top to bottom:
 * header, market ticker, central market-number play area,
 * UP/DOWN direction buttons, prediction bar, stake control.
 *
 * The game engine is owned by useMarketSimulation().
 * This component is responsible only for composing the UI.
 *
 * GAME FLOW
 * ---------------------------------------------------------------------------
 * 1. Market value continuously updates.
 * 2. Player clicks UP or DOWN.
 * 3. The click commits the prediction and locks the stake.
 * 4. The market continues moving.
 * 5. The final value is revealed by MarketNumberSpinner.
 * 6. The engine applies the result after the reveal.
 */

import MarketFluxHeader from './components/MarketFluxHeader'
import MarketTicker from './components/MarketTicker'
import MarketNumberSpinner from './components/MarketNumberSpinner'
import MultiplierLadder, {
  BonusBadge,
} from './components/MultiplierLadder'
import PredictionBar from './components/PredictionBar'
import StakeControl from './components/StakeControl'
import SwipePanel from './components/SwipePanel'
import {
  TOP_STEP,
  useMarketSimulation,
} from './hooks/useMarketSimulation'

function MarketFlux() {
  const game = useMarketSimulation()

  /**
   * A prediction is considered committed once the player
   * has left the idle phase.
   */
  const roundActive =
    game.phase !== 'idle'

  /**
   * Market definitions are expected to expose their decimal
   * precision. Fall back to two decimals for markets that do
   * not explicitly define it.
   */
  const decimals =
    game.market?.decimals ?? 2

  return (
    <div
      className="
        flex
        min-h-0
        w-full
        flex-1
        flex-col
        gap-3
        pb-3
      "
    >
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <MarketFluxHeader
        balance={game.balance}
      />

      {/* ================================================================== */}
      {/* Market ticker                                                      */}
      {/* ================================================================== */}

      <MarketTicker
        market={game.market}
        markets={game.markets}
        price={game.price}
        tease={game.teasing}
        canSelect={game.canSelectMarket}
        onSelect={game.selectMarket}
      />

      {/* ================================================================== */}
      {/* Main play area                                                     */}
      {/* ================================================================== */}

      <section
        aria-label="Market Flux play area"
        className="
          flex
          min-h-0
          flex-1
          flex-col
          px-[7.2%]
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Bonus badge                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            relative
            z-10
            flex
            shrink-0
            justify-center
          "
        >
          <BonusBadge
            reached={
              game.step === TOP_STEP
            }
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Central game display                                             */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col
            items-center
            justify-center
            gap-3
            py-2
          "
        >
          {/* -------------------------------------------------------------- */}
          {/* Multiplier ladder                                              */}
          {/* -------------------------------------------------------------- */}

          <div className="w-full shrink-0">
            <MultiplierLadder
              step={game.step}
            />
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Market number spinner                                          */}
          {/* -------------------------------------------------------------- */}

          <div
            className="
              flex
              min-h-0
              w-full
              flex-1
              items-center
              justify-center
            "
          >
            <MarketNumberSpinner
              value={game.price}
              decimals={decimals}
              tease={game.teasing}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Direction controls                                               */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            grid
            w-full
            shrink-0
            grid-cols-2
            gap-3
            pt-2
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

      {/* ================================================================== */}
      {/* Round / market status                                              */}
      {/* ================================================================== */}

      <PredictionBar
        changePct={game.changePct}
        round={game.round}
        stake={game.stake}
        phase={game.phase}
        prediction={game.prediction}
        elapsed={game.elapsed}
        outcome={game.outcome}
      />

      {/* ================================================================== */}
      {/* Stake control                                                       */}
      {/* ================================================================== */}

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