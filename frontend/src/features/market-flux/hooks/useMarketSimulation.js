/**
 * @file src/features/market-flux/hooks/useMarketSimulation.js
 *
 * @description
 * Core frontend simulation engine for Market Flux.
 *
 * GAME MODEL
 * ---------------------------------------------------------------------------
 * Market Flux is played as a three-round market prediction sequence.
 *
 * 1. The selected market continuously produces a simulated price.
 * 2. The player clicks UP or DOWN.
 * 3. The click commits the prediction and locks the stake.
 * 4. The market continues moving for ROUND_MS.
 * 5. The final market value determines whether the prediction was correct.
 * 6. The market-number spinner reveals the final value.
 * 7. Changed digit positions receive the final market direction colour.
 * 8. The result is applied after the reveal:
 *      - correct call -> ladder advances + payout
 *      - incorrect call -> ladder resets
 *      - top ladder step -> bonus is awarded
 * 9. After Round 3, the three-round sequence starts again at Round 1.
 *
 * THREE-ROUND GAME
 * ---------------------------------------------------------------------------
 * Round 1
 *   First prediction in the sequence.
 *
 * Round 2
 *   Second prediction. A successful previous round keeps the ladder
 *   progression alive.
 *
 * Round 3
 *   Final prediction in the sequence. After settlement, the sequence
 *   returns to Round 1.
 *
 * IMPORTANT
 * ---------------------------------------------------------------------------
 * The spinner is intentionally not responsible for game rules.
 *
 * The UI can call:
 *
 *     spin('up')
 *     spin('down')
 *
 * The engine owns:
 *
 *     - market movement
 *     - three-round progression
 *     - stake
 *     - balance
 *     - ladder
 *     - result
 *     - near misses
 *     - bonus progression
 *
 * This keeps MarketFlux.jsx focused on composition rather than game logic.
 */

import { useCallback, useEffect, useReducer } from 'react'

import {
  DEFAULT_MARKET_ID,
  MARKETS,
  MARKETS_BY_ID,
} from '../data/markets'

/* -------------------------------------------------------------------------- */
/* Game configuration                                                         */
/* -------------------------------------------------------------------------- */

export const MULTIPLIERS = [1, 2, 4, 6, 8, 10]

export const TOP_STEP =
  MULTIPLIERS.length - 1

/**
 * Market Flux is played in three rounds per sequence.
 */
export const TOTAL_ROUNDS = 3

export const BONUS_AMOUNT = 1000

export const MIN_STAKE = 5

export const MAX_STAKE = 500

export const STAKE_STEP = 5

/**
 * Length of an active market round.
 */
export const ROUND_MS = 8000

/**
 * Frequency at which the simulated market updates.
 *
 * A shorter interval makes the market feel alive while still keeping
 * the spinner readable.
 */
export const TICK_MS = 1000

/**
 * Time the final market value remains in the revealing phase.
 *
 * This should cover the longest normal MarketNumberSpinner animation.
 */
export const REVEAL_MS = 3400

/**
 * Additional reveal time for near-miss animations.
 */
export const NEAR_MISS_EXTRA_MS = 700

/**
 * Time the result remains visible before the next round opens.
 */
export const RESULT_MS = 1800

/**
 * A losing round inside this percentage is considered a photo finish.
 */
export const NEAR_MISS_PCT = 0.03

const DEFAULT_MARKET =
  MARKETS_BY_ID[DEFAULT_MARKET_ID]

const START_BALANCE = 124.5

const START_STAKE = 10

/* -------------------------------------------------------------------------- */
/* Initial state                                                              */
/* -------------------------------------------------------------------------- */

const initialState = {
  /**
   * Selected market.
   */
  marketId: DEFAULT_MARKET_ID,

  /**
   * Current simulated market value.
   */
  price: DEFAULT_MARKET.startPrice,

  /**
   * Market value at the beginning of the current round.
   */
  startPrice: DEFAULT_MARKET.startPrice,

  /**
   * Latest market movement direction.
   *
   * 'up' | 'down'
   */
  direction: 'up',

  /**
   * Percentage movement from the round opening value.
   */
  changePct: 0,

  /**
   * Player balance.
   */
  balance: START_BALANCE,

  /**
   * Current stake.
   */
  stake: START_STAKE,

  /**
   * Current round within the three-round sequence.
   *
   * 1 -> 2 -> 3 -> 1
   */
  round: 1,

  /**
   * Current bonus ladder position.
   */
  step: 0,

  /**
   * Current game phase.
   *
   * 'idle'
   * 'live'
   * 'revealing'
   * 'result'
   */
  phase: 'idle',

  /**
   * Direction committed by the player.
   *
   * null | 'up' | 'down'
   */
  prediction: null,

  /**
   * Milliseconds elapsed in the active round.
   */
  elapsed: 0,

  /**
   * Final result.
   */
  outcome: null,

  /**
   * Result calculated at the end of the market round but intentionally
   * hidden until the spinner has finished revealing the final number.
   */
  pending: null,
}

/* -------------------------------------------------------------------------- */
/* Stake helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Returns the highest stake the player can currently afford.
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
    maxAffordableStake(balance),
  )
}

/* -------------------------------------------------------------------------- */
/* Round settlement                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Calculates the result of a completed round.
 *
 * Nothing is applied to the visible game state yet. The returned object is
 * stored in `pending` while the spinner reveals the final market value.
 *
 * @param {object} state
 * @param {boolean} won
 * @param {number} changePct
 * @returns {{
 *   step: number,
 *   balance: number,
 *   outcome: {
 *     won: boolean,
 *     stake: number,
 *     payout: number,
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
  if (!won) {
    const marginPct =
      Math.abs(changePct)

    let nearMiss = null

    /**
     * Losing immediately below the bonus step.
     */
    if (
      state.step ===
      TOP_STEP - 1
    ) {
      nearMiss = 'bonus'
    }

    /**
     * Extremely small market movement.
     */
    else if (
      marginPct <
      NEAR_MISS_PCT
    ) {
      nearMiss = 'photo'
    }

    return {
      step: 0,

      /**
       * The stake was already deducted when the player clicked.
       * Therefore a loss does not subtract it again.
       */
      balance: state.balance,

      outcome: {
        won: false,
        stake: state.stake,
        payout: 0,
        bonus: 0,
        nearMiss,
        marginPct,
      },
    }
  }

  const step =
    Math.min(
      state.step + 1,
      TOP_STEP,
    )

  const payout =
    state.stake *
    MULTIPLIERS[step]

  const bonus =
    step === TOP_STEP
      ? BONUS_AMOUNT
      : 0

  return {
    step,

    balance:
      state.balance +
      payout +
      bonus,

    outcome: {
      won: true,
      stake: state.stake,
      payout,
      bonus,
      nearMiss: null,
      marginPct:
        Math.abs(changePct),
    },
  }
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
        state.phase === 'result'
      ) {
        return state
      }

      const market =
        MARKETS_BY_ID[
          state.marketId
        ]

      /**
       * `unit` is generated outside the reducer so the reducer remains pure.
       *
       * Expected range:
       *
       *     -1 ... 1
       */
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
       * Outside an active round, the market simply updates.
       */
      if (
        state.phase !== 'live'
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
       * Round is still active.
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
        state.prediction === 'up'
          ? price >
            state.startPrice
          : price <
            state.startPrice

      return {
        ...state,

        price,

        direction,

        elapsed: ROUND_MS,

        changePct,

        phase: 'revealing',

        pending:
          settleRound(
            state,
            won,
            changePct,
          ),
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Direction / spin                                                       */
    /* ---------------------------------------------------------------------- */

    case 'SPIN': {
      /**
       * A button click is the player's actual prediction.
       *
       * The spinner remains responsible for visually animating the number.
       * The engine only records the direction and starts the round.
       */
      if (
        state.phase !== 'idle' ||
        state.balance <
          state.stake
      ) {
        return state
      }

      if (
        action.direction !== 'up' &&
        action.direction !== 'down'
      ) {
        return state
      }

      return {
        ...state,

        phase: 'live',

        prediction:
          action.direction,

        /**
         * Lock the stake immediately when the player commits.
         */
        balance:
          state.balance -
          state.stake,

        /**
         * The current market number becomes the round's baseline.
         */
        startPrice:
          state.price,

        elapsed: 0,

        changePct: 0,

        outcome: null,

        pending: null,
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

      return {
        ...state,

        phase: 'result',

        step:
          state.pending.step,

        balance:
          state.pending.balance,

        outcome:
          state.pending.outcome,

        pending: null,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Next round                                                             */
    /* ---------------------------------------------------------------------- */

    case 'NEXT_ROUND': {
      const completedBonus =
        state.outcome?.bonus > 0

      const completedFinalRound =
        state.round ===
        TOTAL_ROUNDS

      /**
       * A bonus completes the current ladder run.
       *
       * The three-round sequence also resets after Round 3.
       */
      const resetSequence =
        completedBonus ||
        completedFinalRound

      return {
        ...state,

        phase: 'idle',

        prediction: null,

        elapsed: 0,

        changePct: 0,

        outcome: null,

        /**
         * Advance through:
         *
         *     1 -> 2 -> 3 -> 1
         */
        round:
          completedFinalRound
            ? 1
            : state.round + 1,

        /**
         * Successful wins keep climbing during the three-round sequence.
         *
         * The ladder resets when:
         *
         * - the player reaches the top bonus, or
         * - the three-round sequence is complete.
         */
        step:
          resetSequence
            ? 0
            : state.step,

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
        state.phase !== 'idle'
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
        state.phase !== 'idle' ||
        !market ||
        market.id ===
          state.marketId
      ) {
        return state
      }

      return {
        ...state,

        marketId: market.id,

        price:
          market.startPrice,

        startPrice:
          market.startPrice,

        direction: 'up',

        changePct: 0,

        /**
         * Selecting another market starts a fresh three-round sequence.
         */
        round: 1,

        step: 0,

        prediction: null,

        outcome: null,

        pending: null,
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
 * The hook owns all game state while the UI remains responsible for
 * rendering the market number, direction buttons, ladder, stake controls
 * and result feedback.
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
 *   step: number,
 *   phase: string,
 *   prediction: 'up'|'down'|null,
 *   elapsed: number,
 *   outcome: object|null,
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
            Math.random() * 2 - 1,
        })
      }, TICK_MS)

    return () =>
      clearInterval(id)
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Spinner reveal                                                           */
  /* ------------------------------------------------------------------------ */

  const nearMiss =
    state.pending?.outcome
      ?.nearMiss ?? null

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
          type: 'REVEAL_DONE',
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
      state.phase !== 'result'
    ) {
      return undefined
    }

    const id =
      setTimeout(() => {
        dispatch({
          type: 'NEXT_ROUND',
        })
      }, RESULT_MS)

    return () =>
      clearTimeout(id)
  }, [state.phase])

  /* ------------------------------------------------------------------------ */
  /* Public actions                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Commits an UP or DOWN prediction.
   *
   * @param {'up'|'down'} direction
   */
  const spin =
    useCallback(
      (direction) => {
        dispatch({
          type: 'SPIN',
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
          type: 'CHANGE_STAKE',
          delta: STAKE_STEP,
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
          type: 'CHANGE_STAKE',
          delta:
            -STAKE_STEP,
        })
      },
      [],
    )

  /**
   * Resets the current game state while keeping the selected market.
   */
  const reset =
    useCallback(
      () => {
        dispatch({
          type: 'RESET',
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
          type: 'SELECT_MARKET',
          marketId,
        })
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                            */
  /* ------------------------------------------------------------------------ */

  const isIdle =
    state.phase === 'idle'

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

  return {
    ...state,

    market:
      MARKETS_BY_ID[
        state.marketId
      ],

    markets: MARKETS,

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

    spin,

    increaseStake,

    decreaseStake,

    reset,

    selectMarket,
  }
}