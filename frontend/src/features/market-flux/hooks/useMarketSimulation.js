/**
 * @file src/features/market-flux/hooks/useMarketSimulation.js
 *
 * @description
 * Core frontend simulation engine for Market Flux.
 *
 * GAME MODEL
 * ---------------------------------------------------------------------------
 * Market Flux is a three-round market prediction game.
 *
 * Each round has a fixed multiplier:
 *
 *   Round 1 -> ×3
 *   Round 2 -> ×6
 *   Round 3 -> ×8
 *
 * The player selects UP or DOWN and the round starts. The selected market
 * continues to simulate movement until the round finishes.
 *
 * The final market value determines whether the prediction was correct.
 *
 * Round settlement:
 *
 *   WIN  -> stake × round multiplier is added to the balance
 *   LOSS -> stake × round multiplier is removed from the balance,
 *           capped at the balance the player has left
 *
 * Example:
 *
 *   Stake: R10
 *   Round 1: ×3
 *
 *   WIN  -> +R30
 *   LOSS -> -R30 (or less, if the balance is below R30)
 *
 * COMPLETION BONUS
 * ---------------------------------------------------------------------------
 * Winning all three rounds of a run pays an extra
 *
 *   stake × BONUS_MULTIPLIER (×10)
 *
 * on top of the Round 3 win. The stake used is the Round 3 stake.
 *
 * Example (R10 stake every round, all three won):
 *
 *   +R30  +R60  +R80  +R100 bonus  =  +R270
 *
 * PROGRESS MODEL
 * ---------------------------------------------------------------------------
 * Two different counters describe progress through a three-round sequence:
 *
 *   completedRounds  rounds the player WON (wins only)
 *   roundsPlayed     rounds finished, win or lose
 *   spinsRemaining   rounds the player can still start
 *
 * UI that shows progress ("Round 2 / 3", spin dots, bonus-table ticks)
 * should use roundsPlayed and spinsRemaining.
 *
 * The reel is intentionally not responsible for game rules.
 * It only reveals the final market value.
 */

import {
  useCallback,
  useEffect,
  useReducer,
} from 'react'

import {
  DEFAULT_MARKET_ID,
  MARKETS,
  MARKETS_BY_ID,
} from '../data/markets'

/* -------------------------------------------------------------------------- */
/* Game configuration                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Multiplier attached to each round.
 *
 * The multiplier belongs to the round itself rather than a progressive
 * success ladder.
 */
export const ROUND_CONFIG = [
  {
    round: 1,
    multiplier: 3,
  },
  {
    round: 2,
    multiplier: 6,
  },
  {
    round: 3,
    multiplier: 8,
  },
]

/**
 * Number of rounds in one Market Flux game.
 */
export const TOTAL_ROUNDS =
  ROUND_CONFIG.length

/**
 * Completion bonus multiplier.
 *
 * Winning all three rounds of a run pays stake × BONUS_MULTIPLIER on top
 * of the Round 3 win. Set to zero to disable the bonus.
 */
export const BONUS_MULTIPLIER = 10

export const MIN_STAKE = 5
export const MAX_STAKE = 500
export const STAKE_STEP = 5

/**
 * Length of an active market round.
 */
export const ROUND_MS = 8000

/**
 * Frequency of simulated market updates.
 */
export const TICK_MS = 1000

/**
 * Time required for the reel to reveal the final value.
 */
export const REVEAL_MS = 3400

/**
 * Additional reveal time for near-miss feedback.
 */
export const NEAR_MISS_EXTRA_MS = 700

/**
 * Time the result remains visible before advancing.
 */
export const RESULT_MS = 1800

/**
 * Losing movement inside this percentage is treated as a near miss.
 */
export const NEAR_MISS_PCT = 0.03

const DEFAULT_MARKET =
  MARKETS_BY_ID[DEFAULT_MARKET_ID]

const START_BALANCE = 100
const START_STAKE = 10

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Returns the configuration for a specific round.
 *
 * @param {number} round
 * @returns {{round: number, multiplier: number}}
 */
function getRoundConfig(round) {
  return (
    ROUND_CONFIG[round - 1] ??
    ROUND_CONFIG[0]
  )
}

/**
 * Returns the multiplier for the current round.
 *
 * @param {number} round
 * @returns {number}
 */
function getRoundMultiplier(round) {
  return getRoundConfig(round).multiplier
}

/**
 * Returns the maximum stake the player can afford.
 *
 * @param {number} balance
 * @returns {number}
 */
function maxAffordableStake(balance) {
  const affordable =
    Math.floor(
      balance / STAKE_STEP,
    ) * STAKE_STEP

  return Math.max(
    MIN_STAKE,
    Math.min(
      MAX_STAKE,
      affordable,
    ),
  )
}

/**
 * Keeps the stake inside the valid range and affordability limit.
 *
 * @param {number} stake
 * @param {number} balance
 * @returns {number}
 */
function clampStake(
  stake,
  balance,
) {
  return Math.min(
    Math.max(
      stake,
      MIN_STAKE,
    ),
    maxAffordableStake(
      balance,
    ),
  )
}

/* -------------------------------------------------------------------------- */
/* Round settlement                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Calculates the financial result of a completed round.
 *
 * IMPORTANT:
 * The stake is NOT deducted when the player commits a prediction.
 * The round result is applied once, after the market reveal completes.
 *
 * A loss is capped at the player's remaining balance so the balance can
 * never go negative.
 *
 * The completion bonus is awarded when the player wins Round 3 having
 * already won every earlier round of the run.
 *
 * @param {object} state
 * @param {boolean} won
 * @param {number} changePct
 * @returns {{
 *   balance: number,
 *   roundResult: number,
 *   outcome: {
 *     won: boolean,
 *     round: number,
 *     multiplier: number,
 *     stake: number,
 *     amount: number,
 *     bonus: number,
 *     nearMiss: string|null,
 *     marginPct: number
 *   }
 * }}
 */
function settleRound(
  state,
  won,
  changePct,
) {
  const multiplier =
    getRoundMultiplier(
      state.round,
    )

  const amount =
    state.stake *
    multiplier

  const marginPct =
    Math.abs(changePct)

  let nearMiss = null

  if (
    !won &&
    marginPct <
      NEAR_MISS_PCT
  ) {
    nearMiss = 'photo'
  }

  /**
   * Completion bonus.
   *
   * `completedRounds` counts wins so far in this run and has not yet been
   * updated for the round being settled, so a clean sweep means two wins
   * going into a winning Round 3.
   */
  const wonAllRounds =
    won &&
    state.round === TOTAL_ROUNDS &&
    state.completedRounds ===
      TOTAL_ROUNDS - 1

  const bonus =
    wonAllRounds
      ? state.stake *
        BONUS_MULTIPLIER
      : 0

  /**
   * A loss can never take more than the player has left.
   */
  const loss =
    Math.min(
      amount,
      state.balance,
    )

  const roundResult =
    won
      ? amount
      : -loss

  return {
    balance:
      state.balance +
      roundResult +
      bonus,

    roundResult,

    outcome: {
      won,

      round:
        state.round,

      multiplier,

      stake:
        state.stake,

      amount:
        roundResult,

      bonus,

      nearMiss,

      marginPct,
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Initial state                                                              */
/* -------------------------------------------------------------------------- */

const initialState = {
  marketId:
    DEFAULT_MARKET_ID,

  price:
    DEFAULT_MARKET.startPrice,

  startPrice:
    DEFAULT_MARKET.startPrice,

  direction:
    'up',

  changePct:
    0,

  balance:
    START_BALANCE,

  stake:
    START_STAKE,

  round:
    1,

  /**
   * Current round multiplier.
   *
   * This is derived from `round`, but keeping it in the public state makes
   * the UI very simple to consume.
   */
  multiplier:
    getRoundMultiplier(1),

  phase:
    'idle',

  prediction:
    null,

  elapsed:
    0,

  outcome:
    null,

  /**
   * Result calculated when the round ends but hidden until the reel
   * finishes revealing the final market value.
   */
  pending:
    null,

  /**
   * Financial result of the most recently completed round.
   */
  roundResult:
    0,

  /**
   * Net result accumulated during the current three-round game,
   * including any completion bonus.
   */
  netResult:
    0,

  /**
   * Number of rounds WON in the current three-round game.
   *
   * Wins only. For "rounds finished" use the derived `roundsPlayed`.
   */
  completedRounds:
    0,
}

/* -------------------------------------------------------------------------- */
/* Reducer                                                                    */
/* -------------------------------------------------------------------------- */

function reducer(
  state,
  action,
) {
  switch (action.type) {
    /* ---------------------------------------------------------------------- */
    /* Market tick                                                            */
    /* ---------------------------------------------------------------------- */

    case 'TICK': {
      /**
       * The market is frozen while the final number is being revealed or
       * while the result is displayed.
       */
      if (
        state.phase ===
          'revealing' ||
        state.phase ===
          'result'
      ) {
        return state
      }

      const market =
        MARKETS_BY_ID[
          state.marketId
        ]

      const price =
        Math.max(
          0,
          state.price *
            (
              1 +
              action.unit *
                market.volatility
            ),
        )

      const direction =
        price >= state.price
          ? 'up'
          : 'down'

      /**
       * Before a prediction has been made, the market simply moves.
       */
      if (
        state.phase !==
        'live'
      ) {
        return {
          ...state,
          price,
          direction,
        }
      }

      const elapsed =
        state.elapsed +
        TICK_MS

      const changePct =
        (
          price /
            state.startPrice -
          1
        ) * 100

      /**
       * The round is still active.
       */
      if (
        elapsed <
        ROUND_MS
      ) {
        return {
          ...state,
          price,
          direction,
          elapsed,
          changePct,
        }
      }

      /* -------------------------------------------------------------------- */
      /* Round finished                                                       */
      /* -------------------------------------------------------------------- */

      const won =
        state.prediction ===
        'up'
          ? price >
            state.startPrice
          : price <
            state.startPrice

      return {
        ...state,

        price,

        direction,

        elapsed:
          ROUND_MS,

        changePct,

        phase:
          'revealing',

        pending:
          settleRound(
            state,
            won,
            changePct,
          ),
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Player prediction                                                      */
    /* ---------------------------------------------------------------------- */

    case 'SPIN': {
      /**
       * Committing UP or DOWN starts the round.
       *
       * The stake is NOT removed here.
       * It remains untouched until the round is settled.
       */
      if (
        state.phase !==
          'idle' ||
        state.balance <
          state.stake
      ) {
        return state
      }

      if (
        action.direction !==
          'up' &&
        action.direction !==
          'down'
      ) {
        return state
      }

      return {
        ...state,

        phase:
          'live',

        prediction:
          action.direction,

        startPrice:
          state.price,

        elapsed:
          0,

        changePct:
          0,

        outcome:
          null,

        pending:
          null,

        roundResult:
          0,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Reveal finished                                                        */
    /* ---------------------------------------------------------------------- */

    case 'REVEAL_DONE': {
      if (
        state.phase !==
          'revealing' ||
        !state.pending
      ) {
        return state
      }

      const pending =
        state.pending

      return {
        ...state,

        phase:
          'result',

        balance:
          pending.balance,

        outcome:
          pending.outcome,

        roundResult:
          pending.roundResult,

        netResult:
          state.netResult +
          pending.roundResult +
          pending.outcome.bonus,

        completedRounds:
          pending.outcome.won
            ? state.completedRounds + 1
            : state.completedRounds,

        pending:
          null,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Next round                                                             */
    /* ---------------------------------------------------------------------- */

    case 'NEXT_ROUND': {
      const completedFinalRound =
        state.round ===
        TOTAL_ROUNDS

      /**
       * The three-round game ends after Round 3.
       *
       * We then start a fresh three-round sequence.
       */
      const nextRound =
        completedFinalRound
          ? 1
          : state.round + 1

      return {
        ...state,

        phase:
          'idle',

        prediction:
          null,

        elapsed:
          0,

        changePct:
          0,

        outcome:
          null,

        round:
          nextRound,

        multiplier:
          getRoundMultiplier(
            nextRound,
          ),

        /**
         * Start a new financial sequence after Round 3.
         */
        netResult:
          completedFinalRound
            ? 0
            : state.netResult,

        completedRounds:
          completedFinalRound
            ? 0
            : state.completedRounds,

        roundResult:
          0,

        stake:
          clampStake(
            state.stake,
            state.balance,
          ),
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Stake                                                                  */
    /* ---------------------------------------------------------------------- */

    case 'CHANGE_STAKE': {
      if (
        state.phase !==
        'idle'
      ) {
        return state
      }

      return {
        ...state,

        stake:
          clampStake(
            state.stake +
              action.delta,
            state.balance,
          ),
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Market selection                                                       */
    /* ---------------------------------------------------------------------- */

    case 'SELECT_MARKET': {
      const market =
        MARKETS_BY_ID[
          action.marketId
        ]

      if (
        state.phase !==
          'idle' ||
        !market ||
        market.id ===
          state.marketId
      ) {
        return state
      }

      return {
        ...state,

        marketId:
          market.id,

        price:
          market.startPrice,

        startPrice:
          market.startPrice,

        direction:
          'up',

        changePct:
          0,

        round:
          1,

        multiplier:
          getRoundMultiplier(1),

        prediction:
          null,

        outcome:
          null,

        pending:
          null,

        roundResult:
          0,

        netResult:
          0,

        completedRounds:
          0,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Reset                                                                  */
    /* ---------------------------------------------------------------------- */

    case 'RESET': {
      return {
        ...initialState,

        marketId:
          state.marketId,

        price:
          state.price,

        startPrice:
          state.price,
      }
    }

    default:
      return state
  }
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Market Flux simulation hook.
 *
 * @returns {{
 *   market: object,
 *   markets: object[],
 *   marketId: string,
 *   price: number,
 *   startPrice: number,
 *   direction: 'up'|'down',
 *   changePct: number,
 *   balance: number,
 *   stake: number,
 *   round: number,
 *   multiplier: number,
 *   phase: string,
 *   prediction: 'up'|'down'|null,
 *   elapsed: number,
 *   outcome: object|null,
 *   roundResult: number,
 *   netResult: number,
 *   completedRounds: number,
 *   roundsPlayed: number,
 *   spinsRemaining: number,
 *   canSelectMarket: boolean,
 *   teasing: boolean,
 *   isBroke: boolean,
 *   canSpin: boolean,
 *   canDecrease: boolean,
 *   canIncrease: boolean,
 *   spin: Function,
 *   increaseStake: Function,
 *   decreaseStake: Function,
 *   reset: Function,
 *   selectMarket: Function
 * }}
 */
export function useMarketSimulation() {
  const [
    state,
    dispatch,
  ] = useReducer(
    reducer,
    initialState,
  )

  /* ------------------------------------------------------------------------ */
  /* Continuous market simulation                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const id =
      setInterval(() => {
        dispatch({
          type: 'TICK',
          unit:
            Math.random() *
              2 -
            1,
        })
      }, TICK_MS)

    return () =>
      clearInterval(id)
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Reel reveal                                                              */
  /* ------------------------------------------------------------------------ */

  const nearMiss =
    state.pending
      ?.outcome
      ?.nearMiss ??
    null

  useEffect(() => {
    if (
      state.phase !==
      'revealing'
    ) {
      return undefined
    }

    const wait =
      REVEAL_MS +
      (
        nearMiss
          ? NEAR_MISS_EXTRA_MS
          : 0
      )

    const id =
      setTimeout(() => {
        dispatch({
          type:
            'REVEAL_DONE',
        })
      }, wait)

    return () =>
      clearTimeout(id)
  }, [
    state.phase,
    nearMiss,
  ])

  /* ------------------------------------------------------------------------ */
  /* Result phase                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      state.phase !==
      'result'
    ) {
      return undefined
    }

    const id =
      setTimeout(() => {
        dispatch({
          type:
            'NEXT_ROUND',
        })
      }, RESULT_MS)

    return () =>
      clearTimeout(id)
  }, [
    state.phase,
  ])

  /* ------------------------------------------------------------------------ */
  /* Public actions                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Commits an UP or DOWN prediction and starts the market round.
   *
   * @param {'up'|'down'} direction
   */
  const spin =
    useCallback(
      (direction) => {
        dispatch({
          type:
            'SPIN',
          direction,
        })
      },
      [],
    )

  /**
   * Increases the current stake.
   */
  const increaseStake =
    useCallback(
      () => {
        dispatch({
          type:
            'CHANGE_STAKE',
          delta:
            STAKE_STEP,
        })
      },
      [],
    )

  /**
   * Decreases the current stake.
   */
  const decreaseStake =
    useCallback(
      () => {
        dispatch({
          type:
            'CHANGE_STAKE',
          delta:
            -STAKE_STEP,
        })
      },
      [],
    )

  /**
   * Resets the current game state while preserving the selected market.
   */
  const reset =
    useCallback(
      () => {
        dispatch({
          type:
            'RESET',
        })
      },
      [],
    )

  /**
   * Changes the selected market.
   *
   * @param {string} marketId
   */
  const selectMarket =
    useCallback(
      (marketId) => {
        dispatch({
          type:
            'SELECT_MARKET',
          marketId,
        })
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                            */
  /* ------------------------------------------------------------------------ */

  const isIdle =
    state.phase ===
    'idle'

  const isBroke =
    isIdle &&
    state.balance <
      MIN_STAKE

  const canSpin =
    isIdle &&
    !isBroke &&
    state.balance >=
      state.stake

  const canDecrease =
    isIdle &&
    state.stake >
      MIN_STAKE

  const canIncrease =
    isIdle &&
    state.stake +
      STAKE_STEP <=
      maxAffordableStake(
        state.balance,
      )

  /**
   * Rounds finished in the current three-round sequence, win or lose.
   *
   * `completedRounds` only counts wins, so it cannot drive progress UI:
   * after a loss in Round 1 it would still read 0 while Round 2 is current.
   *
   * The current round counts as played once its result is on screen.
   */
  const roundsPlayed =
    state.phase ===
    'result'
      ? state.round
      : state.round - 1

  /**
   * Rounds the player can still start, for the "Spins Remaining" dots.
   *
   * The current round counts as used as soon as a prediction is committed:
   *
   *   idle,  round 1 -> 3        live,  round 1 -> 2
   *   idle,  round 3 -> 1        live,  round 3 -> 0
   */
  const spinsRemaining =
    TOTAL_ROUNDS -
    state.round +
    (isIdle ? 1 : 0)

  return {
    ...state,

    market:
      MARKETS_BY_ID[
        state.marketId
      ],

    markets:
      MARKETS,

    canSelectMarket:
      isIdle,

    teasing:
      state.phase ===
        'revealing' &&
      nearMiss !== null,

    isBroke,

    canSpin,

    canDecrease,

    canIncrease,

    roundsPlayed,

    spinsRemaining,

    spin,

    increaseStake,

    decreaseStake,

    reset,

    selectMarket,
  }
}