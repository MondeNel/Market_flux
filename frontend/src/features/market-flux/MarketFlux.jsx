/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Root feature component for Market Flux.
 *
 * MarketFlux is responsible for composing the game interface.
 * Individual UI components own their presentation and interaction
 * responsibilities, while game state and market calculations will
 * eventually be provided through the feature hooks.
 */

import MarketNumberSpinner from './components/MarketNumberSpinner'
import DirectionControls from './components/DirectionControls'
import StakeControl from './components/StakeControl'
import BonusLadder from './components/BonusLadder'
import GameStatus from './components/GameStatus'

/**
 * Market Flux main game screen.
 *
 * @returns {JSX.Element} The Market Flux game interface.
 */
export default function MarketFlux() {
  return (
    <main className="relative flex min-h-full w-full flex-col overflow-hidden">
      {/* Market value */}
      <section className="px-4 pt-4">
        <MarketNumberSpinner />
      </section>

      {/* Direction decision */}
      <section className="px-4 pt-5">
        <DirectionControls />
      </section>

      {/* Stake */}
      <section className="px-4 pt-4">
        <StakeControl />
      </section>

      {/* Progress toward bonus */}
      <section className="px-4 pt-5">
        <BonusLadder />
      </section>

      {/* Round feedback / state */}
      <section className="px-4 pb-6 pt-4">
        <GameStatus />
      </section>
    </main>
  )
}