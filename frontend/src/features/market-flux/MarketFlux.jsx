/**
 * @file src/features/market-flux/MarketFlux.jsx
 *
 * @description
 * Main Market Flux game screen.
 *
 * The screen is composed as one physical liquid-glass game machine rather
 * than a collection of dashboard cards.
 *
 * PLATFORM VISUAL LANGUAGE
 * ---------------------------------------------------------------------------
 * - dark environmental background remains visible
 * - liquid-glass surfaces
 * - transparent layered construction
 * - mechanical 3D depth
 * - cyan edge illumination
 * - metallic/specular highlights
 * - recessed controls
 * - no flat dashboard cards
 *
 * VISUAL HIERARCHY
 * ---------------------------------------------------------------------------
 *   1. Header / account
 *   2. Market selector
 *   3. Live market signal
 *   4. Mechanical result reel
 *   5. Round + reward progression
 *   6. UP / STAKE / DOWN controls
 *
 * GAME FLOW
 * ---------------------------------------------------------------------------
 *   Round 1 -> ×3
 *   Round 2 -> ×6
 *   Round 3 -> ×8
 *   All three rounds -> ×10 completion bonus
 *
 * GAME LOGIC
 * ---------------------------------------------------------------------------
 * All game rules remain inside useMarketSimulation().
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
        pb-1
      "
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="relative z-[60] shrink-0">
        <MarketFluxHeader
          balance={game.balance}
        />
      </header>

      {/* ================================================================== */}
      {/* MARKET SELECTOR                                                    */}
      {/* ================================================================== */}

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

      {/* ================================================================== */}
      {/* MAIN GAME MACHINE                                                  */}
      {/* ================================================================== */}

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
        {/* ---------------------------------------------------------------- */}
        {/* Atmospheric machine glow                                        */}
        {/* ---------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[11%]
            z-0
            h-40
            w-56
            -translate-x-1/2
            rounded-full
            bg-cyan-400/[0.055]
            blur-3xl
          "
        />

        {/* ---------------------------------------------------------------- */}
        {/* Physical machine body                                            */}
        {/* ---------------------------------------------------------------- */}

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
          {/* ============================================================= */}
          {/* UPPER MACHINE                                                 */}
          {/* ============================================================= */}

          <div
            className="
              relative
              flex
              min-h-0
              flex-1
              flex-col
              overflow-visible
              rounded-[25px]
              border
              border-white/[0.075]
              bg-black/[0.16]
              shadow-[0_18px_45px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-20px_35px_rgba(0,0,0,0.30)]
            "
          >
            {/* ========================================================== */}
            {/* Physical top highlight                                      */}
            {/* ========================================================== */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[9%]
                right-[9%]
                top-0
                z-50
                h-px
                bg-gradient-to-r
                from-transparent
                via-cyan-200/45
                to-transparent
              "
            />

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[20%]
                right-[20%]
                top-px
                z-50
                h-[2px]
                rounded-full
                bg-cyan-300/[0.08]
                blur-[1px]
              "
            />

            {/* ========================================================== */}
            {/* MARKET SIGNAL                                                */}
            {/* ========================================================== */}

            <div
              className="
                relative
                z-30
                flex
                shrink-0
                items-center
                justify-between
                px-3
                pt-2
                pb-1
              "
            >
              {/* Market name */}

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    relative
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-cyan-300/20
                    bg-black/50
                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_0_10px_rgba(0,191,255,0.10)]
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-cyan-300
                      shadow-[0_0_7px_rgba(0,220,255,0.85)]
                    "
                  />
                </span>

                <div className="min-w-0">
                  <div
                    className="
                      truncate
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.18em]
                      text-white/80
                    "
                  >
                    {game.market?.name ?? 'Market'}
                  </div>

                  <div
                    className="
                      text-[8px]
                      font-semibold
                      tracking-[0.08em]
                      text-white/35
                    "
                  >
                    LIVE MARKET
                  </div>
                </div>
              </div>

              {/* Live price */}

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

            {/* ========================================================== */}
            {/* RESULT REEL                                                 */}
            {/* ========================================================== */}

            <div
              className="
                relative
                z-20
                flex
                min-h-0
                flex-1
                items-center
                justify-center
                px-1
              "
            >
              {/* -------------------------------------------------------- */}
              {/* Outer mechanical rails                                    */}
              {/* -------------------------------------------------------- */}

              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-0
                  top-1/2
                  h-[72%]
                  w-[2px]
                  -translate-y-1/2
                  rounded-full
                  bg-gradient-to-b
                  from-transparent
                  via-cyan-300/40
                  to-transparent
                  shadow-[0_0_8px_rgba(0,191,255,0.28)]
                "
              />

              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  right-0
                  top-1/2
                  h-[72%]
                  w-[2px]
                  -translate-y-1/2
                  rounded-full
                  bg-gradient-to-b
                  from-transparent
                  via-cyan-300/30
                  to-transparent
                "
              />

              {/* -------------------------------------------------------- */}
              {/* Reel mounting glow                                        */}
              {/* -------------------------------------------------------- */}

              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-[7%]
                  right-[7%]
                  top-1/2
                  h-20
                  -translate-y-1/2
                  rounded-full
                  bg-cyan-400/[0.035]
                  blur-2xl
                "
              />

              <div
                className="
                  relative
                  w-full
                "
              >
                {/* Mechanical reel top lip */}

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -top-1
                    left-[7%]
                    right-[7%]
                    z-40
                    h-[3px]
                    rounded-full
                    bg-gradient-to-r
                    from-transparent
                    via-cyan-300/55
                    to-transparent
                    shadow-[0_0_7px_rgba(0,191,255,0.28)]
                  "
                />

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -bottom-1
                    left-[10%]
                    right-[10%]
                    z-40
                    h-px
                    rounded-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/10
                    to-transparent
                  "
                />

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

            {/* ========================================================== */}
            {/* STATUS                                                      */}
            {/* ========================================================== */}

            <div
              className="
                relative
                z-30
                shrink-0
                px-3
                pb-1
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

            {/* ========================================================== */}
            {/* MACHINE BOTTOM LIGHT                                        */}
            {/* ========================================================== */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-0
                left-[8%]
                right-[8%]
                z-40
                h-px
                bg-gradient-to-r
                from-transparent
                via-cyan-400/35
                to-transparent
              "
            />
          </div>

          {/* ================================================================= */}
          {/* ROUND CONTROL DECK                                                */}
          {/* ================================================================= */}

          <div
            className="
              relative
              z-30
              mt-1.5
              shrink-0
              rounded-[20px]
              border
              border-white/[0.065]
              bg-black/[0.18]
              px-2
              py-1.5
              shadow-[0_12px_28px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-10px_20px_rgba(0,0,0,0.22)]
            "
          >
            {/* Deck top reflection */}

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
                via-white/15
                to-transparent
              "
            />

            {/* ------------------------------------------------------------- */}
            {/* Round information                                             */}
            {/* ------------------------------------------------------------- */}

            <RoundInfoPanel
              round={game.round}
              roundsPlayed={game.roundsPlayed}
              stake={game.stake}
            />

            {/* ------------------------------------------------------------- */}
            {/* Multiplier progression                                         */}
            {/* ------------------------------------------------------------- */}

            <div className="mt-1">
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

          {/* ================================================================= */}
          {/* DECISION DECK                                                     */}
          {/* ================================================================= */}

          <section
            aria-label="Predict the market direction"
            className="
              relative
              z-40
              mt-1.5
              shrink-0
            "
          >
            <div
              className="
                relative
                grid
                grid-cols-[1fr_auto_1fr]
                items-center
                gap-2
              "
            >
              {/* =========================================================== */}
              {/* UP                                                           */}
              {/* =========================================================== */}

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

              {/* =========================================================== */}
              {/* STAKE                                                        */}
              {/* =========================================================== */}

              <div
                className="
                  relative
                  flex
                  min-w-[72px]
                  items-center
                  justify-center
                "
              >
                {/* central mechanical mount */}

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-1
                    top-1/2
                    h-9
                    -translate-y-1/2
                    rounded-[12px]
                    border
                    border-white/[0.07]
                    bg-black/[0.28]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-5px_10px_rgba(0,0,0,0.30)]
                  "
                />

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

              {/* =========================================================== */}
              {/* DOWN                                                         */}
              {/* =========================================================== */}

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