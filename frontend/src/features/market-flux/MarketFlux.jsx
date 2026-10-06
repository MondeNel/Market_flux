/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Main Market Flux game screen.
 *
 * The screen is intentionally kept as a composition layer. Game rules,
 * market simulation, round settlement and balance calculations are owned by
 * useMarketSimulation().
 *
 * SCREEN LAYERS (top to bottom)
 * ---------------------------------------------------------------------------
 *   1. Header          MarketFluxHeader (balance, rank, followers)
 *   2. Market selector MarketTicker (centred dropdown)
 *   3. Reel            MarketNumberSpinner, the only flexible-height section.
 *                      Beneath it: LivePriceRow (the live market) and
 *                      StatusLine
 *   4. Round panel     RoundInfoPanel (round, spins left, stake)
 *   5. Bonus panel     MultiplierLadder (payout table)
 *   6. Action row      SwipePanel UP, SpinButton, SwipePanel DOWN
 *
 * The persistent navigation sits below all of this in AppShell.
 *
 * THE TWO NUMBER DISPLAYS
 * ---------------------------------------------------------------------------
 *   Reel           the ROUND RESULT. Rests on zeros, rolls up to the final
 *                  price at the reveal, resets for the next round.
 *   LivePriceRow   the MARKET. Ticks every second and flicks when the
 *                  direction changes.
 *
 * STACKING
 * ---------------------------------------------------------------------------
 *   z-50  market selector   the dropdown must open over everything below
 *   z-30  action row
 *   z-40  spin hub          raised above its neighbours, overlapping the bonus panel
 *   z-10  info panels
 *
 * LAYOUT OWNERSHIP
 * ---------------------------------------------------------------------------
 * The wrappers here own horizontal padding. The components inside them own
 * none, except the header, whose brand rail runs to the screen edge.
 *
 * GAME FLOW
 * ---------------------------------------------------------------------------
 * 1. The selected market continuously produces simulated market data.
 * 2. The player selects UP or DOWN.
 * 3. The prediction starts the current round.
 * 4. The reel rolls up from zero and reveals the resulting market value.
 * 5. The engine determines whether the prediction was correct.
 * 6. The round multiplier is applied:
 *
 *      Round 1 -> ×3
 *      Round 2 -> ×6
 *      Round 3 -> ×8
 *
 * 7. The resulting amount is added to or removed from the balance.
 * 8. After Round 3, a new three-round sequence begins. Winning all three
 *    rounds also pays a completion bonus of stake × 10.
 */

import MarketFluxHeader from './components/MarketFluxHeader'
import MarketTicker from './components/MarketTicker'
import MarketNumberSpinner from './components/MarketNumberSpinner'
import LivePriceRow from './components/LivePriceRow'
import StatusLine from './components/StatusLine'
import RoundInfoPanel from './components/RoundInfoPanel'
import MultiplierLadder from './components/MultiplierLadder'
import SwipePanel from './components/SwipePanel'
import SpinButton from './components/SpinButton'

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
        pb-2
      "
    >
      {/* ================================================================== */}
      {/* 1. HEADER                                                          */}
      {/* ================================================================== */}

      <MarketFluxHeader
        balance={game.balance}
      />

      {/* ================================================================== */}
      {/* 2. MARKET SELECTOR                                                 */}
      {/* ================================================================== */}

      <div
        className="
          relative
          z-50
          mt-1
          shrink-0
          px-3
        "
      >
        <MarketTicker
          market={game.market}
          markets={game.markets}
          canSelect={game.canSelectMarket}
          onSelect={game.selectMarket}
        />
      </div>

      {/* ================================================================== */}
      {/* GAME MACHINE                                                       */}
      {/* ================================================================== */}

      <main
        aria-label="Market Flux game"
        className="
          relative
          flex
          min-h-0
          flex-1
          flex-col
        "
      >
        {/* -------------------------------------------------------------- */}
        {/* 3. REEL, LIVE ROW AND STATUS (takes all spare height)           */}
        {/* -------------------------------------------------------------- */}

        <section
          aria-label="Market"
          className="
            relative
            flex
            min-h-0
            flex-1
            flex-col
            items-center
            justify-center
            px-3
            pt-1
          "
        >
          <div className="relative w-full">
            <MarketNumberSpinner
              value={game.price}
              decimals={decimals}
              tease={game.teasing}
              phase={game.phase}
              startPrice={game.startPrice}
            />
          </div>

          <div className="mt-1 w-full">
            <LivePriceRow
              price={game.price}
              decimals={decimals}
              direction={game.direction}
              marketName={game.market.name}
              phase={game.phase}
            />
          </div>

          <div className="mt-1.5 w-full">
            <StatusLine
              phase={game.phase}
              outcome={game.outcome}
              netResult={game.netResult}
              prediction={game.prediction}
              isBroke={game.isBroke}
            />
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 4. ROUND PANEL                                                  */}
        {/* -------------------------------------------------------------- */}

        <div
          className="
            relative
            z-10
            mt-1
            shrink-0
            px-3
          "
        >
          <RoundInfoPanel
            round={game.round}
            spinsRemaining={game.spinsRemaining}
            stake={game.stake}
            canDecrease={game.canDecrease}
            canIncrease={game.canIncrease}
            onDecrease={game.decreaseStake}
            onIncrease={game.increaseStake}
          />
        </div>

        {/* -------------------------------------------------------------- */}
        {/* 5. BONUS PANEL                                                  */}
        {/* -------------------------------------------------------------- */}

        <div
          className="
            relative
            z-10
            shrink-0
            px-3
            pt-1.5
          "
        >
          <MultiplierLadder
            round={game.round}
            roundsPlayed={game.roundsPlayed}
            stake={game.stake}
          />
        </div>

        {/* -------------------------------------------------------------- */}
        {/* 6. ACTION ROW                                                   */}
        {/* -------------------------------------------------------------- */}

        <div
          role="group"
          aria-label="Predict the market direction"
          className="
            relative
            z-30
            grid
            shrink-0
            grid-cols-[1fr_auto_1fr]
            items-end
            gap-2.5
            px-3
            pt-3
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

          {/* Raised hub: lifted above the row and above its neighbours. */}
          <div className="relative z-40 -mt-3">
            <SpinButton
              phase={game.phase}
              prediction={game.prediction}
              elapsed={game.elapsed}
              outcome={game.outcome}
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
      </main>
    </div>
  )
}

export default MarketFlux