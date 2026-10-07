/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Main Market Flux game screen.
 *
 * MarketFlux is intentionally a composition layer. Game rules, market
 * simulation, round settlement and balance calculations remain inside
 * useMarketSimulation().
 *
 * PLATFORM VISUAL LANGUAGE
 * ---------------------------------------------------------------------------
 * The screen follows the Market Flux physical-game-machine language:
 *
 * - dark structural surfaces
 * - liquid-glass layers
 * - controlled cyan illumination
 * - mechanical depth
 * - subtle bevels and reflections
 * - no flat dashboard cards
 *
 * SCREEN HIERARCHY
 * ---------------------------------------------------------------------------
 *   1. Header
 *   2. Market selector
 *   3. Result reel, live market price and status line
 *   4. Round information (round, spins remaining, current stake)
 *   5. Bonus / multiplier progression
 *   6. Direction + stake controls (UP | stake − + | DOWN)
 *
 * NUMBER DISPLAYS
 * ---------------------------------------------------------------------------
 *   MarketNumberSpinner
 *     The round-result reel. It rests on zeros through the round, rolls up
 *     from zero to reveal the final market value, then resets.
 *
 *   LivePriceRow
 *     The continuously moving market price. It flickers when market
 *     direction changes.
 *
 * GAME FLOW
 * ---------------------------------------------------------------------------
 *   Round 1 -> ×3
 *   Round 2 -> ×6
 *   Round 3 -> ×8
 *   Winning all three rounds -> completion bonus of stake × 10
 *
 * STACKING
 * ---------------------------------------------------------------------------
 *   z-50  market selector   its dropdown opens over everything below
 *   z-30  direction row
 *   z-20  round information, live price and status
 *   z-10  result reel, bonus panel
 *
 * Persistent platform navigation is owned by AppShell.
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
        pb-2
      "
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <MarketFluxHeader
        balance={game.balance}
      />

      {/* ================================================================== */}
      {/* MARKET SELECTOR                                                    */}
      {/* ================================================================== */}

      <section
        aria-label="Market selection"
        className="
          relative
          z-50
          shrink-0
          px-3
          pt-1
        "
      >
        <MarketTicker
          market={game.market}
          markets={game.markets}
          canSelect={game.canSelectMarket}
          onSelect={game.selectMarket}
        />
      </section>

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
          px-3
        "
      >
        {/* ================================================================ */}
        {/* MARKET MACHINE (takes all spare height)                          */}
        {/* ================================================================ */}

        <section
          aria-label="Market result"
          className="
            relative
            z-10
            mt-1
            flex
            min-h-0
            flex-1
            flex-col
            items-center
            justify-center
          "
        >
          {/* -------------------------------------------------------------- */}
          {/* Machine shell                                                  */}
          {/* -------------------------------------------------------------- */}

          <div
            className="
              relative
              flex
              w-full
              min-h-0
              flex-1
              flex-col
              items-center
              justify-center
              overflow-visible
              rounded-[24px]
              bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(0,0,0,0.20))]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-18px_35px_rgba(0,0,0,0.24),0_14px_35px_rgba(0,0,0,0.20)]
            "
          >
            {/* Upper physical highlight */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[12%]
                right-[12%]
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-cyan-200/30
                to-transparent
              "
            />

            {/* ------------------------------------------------------------ */}
            {/* Main reel                                                    */}
            {/* ------------------------------------------------------------ */}

            <div
              className="
                relative
                z-10
                flex
                w-full
                min-h-0
                flex-1
                items-center
                justify-center
                px-1
              "
            >
              <div className="w-full">
                <MarketNumberSpinner
                  value={game.price}
                  decimals={decimals}
                  tease={game.teasing}
                  phase={game.phase}
                  startPrice={game.startPrice}
                />
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Live market                                                   */}
            {/* ------------------------------------------------------------ */}

            <div
              className="
                relative
                z-20
                w-full
                shrink-0
                px-3
                pb-1
              "
            >
              <LivePriceRow
                price={game.price}
                decimals={decimals}
                direction={game.direction}
                marketName={game.market.name}
                phase={game.phase}
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Status                                                        */}
            {/* ------------------------------------------------------------ */}

            <div
              className="
                relative
                z-20
                w-full
                shrink-0
                px-1
                pb-1.5
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
        </section>

        {/* ================================================================= */}
        {/* ROUND INFORMATION                                                 */}
        {/* ================================================================= */}

        <section
          aria-label="Current round"
          className="
            relative
            z-20
            mt-2
            shrink-0
          "
        >
          <RoundInfoPanel
            round={game.round}
            roundsPlayed={game.roundsPlayed}
            stake={game.stake}
          />
        </section>

        {/* ================================================================= */}
        {/* BONUS / MULTIPLIER PROGRESSION                                   */}
        {/* ================================================================= */}

        <section
          aria-label="Bonus progression"
          className="
            relative
            z-10
            mt-1
            shrink-0
          "
        >
          <MultiplierLadder
            round={game.round}
            roundsPlayed={game.roundsPlayed}
            completedRounds={game.completedRounds}
            stake={game.stake}
          />
        </section>

        {/* ================================================================= */}
        {/* DIRECTION + STAKE                                                 */}
        {/* ================================================================= */}

        <section
          aria-label="Predict the market direction"
          className="
            relative
            z-30
            mt-2
            shrink-0
          "
        >
          <div
            className="
              grid
              grid-cols-[1fr_auto_1fr]
              items-end
              gap-2.5
            "
          >
            {/* ------------------------------------------------------------ */}
            {/* UP                                                            */}
            {/* ------------------------------------------------------------ */}

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

            {/* ------------------------------------------------------------ */}
            {/* STAKE (or restart when out of funds)                          */}
            {/* ------------------------------------------------------------ */}

            <StakeControl
              stake={game.stake}
              canDecrease={game.canDecrease}
              canIncrease={game.canIncrease}
              onDecrease={game.decreaseStake}
              onIncrease={game.increaseStake}
              isBroke={game.isBroke}
              onRestart={game.reset}
            />

            {/* ------------------------------------------------------------ */}
            {/* DOWN                                                          */}
            {/* ------------------------------------------------------------ */}

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
      </main>
    </div>
  )
}

export default MarketFlux