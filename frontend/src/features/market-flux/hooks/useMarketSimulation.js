/**
 * @file src/features/market-flux/hooks/useMarketSimulation.js
 *
 * @description
 * Core frontend simulation engine for Market Flux.
 *
 * GAME MODEL
 * ---------------------------------------------------------------------------
 * Market Flux is a three-round streak game. The rounds are levels on a
 * ladder, and each level has a fixed multiplier:
 *
 *   Round 1 -> ×3
 *   Round 2 -> ×6
 *   Round 3 -> ×8
 *
 * The player starts at Round 1 and can only climb by winning:
 *
 *   WIN  -> move up to the next round
 *   LOSS -> fall back to Round 1 and the streak is lost
 *
 * Winning Round 3 completes the streak: the completion bonus is paid and
 * the player starts again at Round 1. A loss at Round 1 simply leaves the
 * player at Round 1.
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
 *   WIN  -> +R30, now on Round 2
 *   LOSS -> -R30, still on Round 1
 *
 * SPIN TIMING
 * ---------------------------------------------------------------------------
 * From the tap to the reels settling takes ROUND_MS + REVEAL_MS = 2.5 s:
 *
 *   0 - 1.0 s   the reels spin                          (ROUND_MS)
 *   1.0 - 2.5 s the reels stop on the final price       (REVEAL_MS)
 *
 * A near-miss tease adds NEAR_MISS_EXTRA_MS to the reveal.
 *
 * MARKET MOVEMENT
 * ---------------------------------------------------------------------------
 * The market moves for the whole spin, in step with the reels. The moment
 * the player taps UP or DOWN, the price path for the spin is generated:
 *
 *   one price every PATH_STEP_MS, ending on the final price
 *
 * The live price then walks along that path while the reels spin and stop,
 * and reaches the final price at the same moment the last reel settles.
 * Both are driven from the tap, so they stay in step.
 *
 * Outside a spin the market ticks every TICK_MS as before.
 *
 * `resultPrice` is the final price. The reel lands on it while the live
 * price is still on its way there.
 *
 * COMPLETION BONUS
 * ---------------------------------------------------------------------------
 * Winning Round 3 means three wins in a row, and pays an extra
 *
 *   stake × BONUS_MULTIPLIER (×10)
 *
 * on top of the Round 3 win. The stake used is the Round 3 stake.
 *
 * Example (R10 stake every round, three wins in a row):
 *
 *   +R30  +R60  +R80  +R100 bonus  =  +R270
 *
 * PROGRESS MODEL
 * ---------------------------------------------------------------------------
 *   round            the level the player is on (the next spin's round)
 *   completedRounds  wins in the current streak. Reset when the streak
 *                    ends, by a loss or by completing Round 3
 *   roundsPlayed     the same value, kept under this name for the UI
 *   netResult        net winnings of the current streak, including any
 *                    bonus. Reset when the streak ends
 *
 * The streak is only reset when the next round begins, so the result of a
 * lost spin stays readable on screen first.
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
 * The multiplier belongs to the level itself: the higher the level, the
 * bigger the multiplier.
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
 * Number of rounds in one streak.
 */
export const TOTAL_ROUNDS =
  ROUND_CONFIG.length

/**
 * Completion bonus multiplier.
 *
 * Winning Round 3 (three wins in a row) pays stake × BONUS_MULTIPLIER on
 * top of the Round 3 win. Set to zero to disable the bonus.
 */
export const BONUS_MULTIPLIER = 10

export const MIN_STAKE = 5
export const MAX_STAKE = 500
export const STAKE_STEP = 5

/**
 * How long the reels free-spin before they start to stop. The round is
 * settled on a timer this long after the tap.
 */
export const ROUND_MS = 1000

/**
 * How long the reels take to stop on the final value. Must be longer than
 * the reel's landing animation (about 1.4 s for a seven-digit price),
 * otherwise the result is shown before the last reel has stopped.
 *
 * ROUND_MS + REVEAL_MS is the total spin time: 2.5 s.
 */
export const REVEAL_MS = 1500

/**
 * Additional reveal time for near-miss feedback.
 */
export const NEAR_MISS_EXTRA_MS = 700

/**
 * Time between live price updates during a spin.
 */
export const PATH_STEP_MS = 250

/**
 * Number of price updates in one spin. The last one is the final price
 * and lands as the reels settle.
 */
export const SPIN_STEPS =
  Math.round(
    (ROUND_MS + REVEAL_MS) /
      PATH_STEP_MS,
  )

/**
 * Frequency of market updates while no spin is running.
 */
export const TICK_MS = 500

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

/**
 * Applies one random market step to a price.
 *
 * @param {number} price
 * @param {object} market
 * @param {number} unit Random value in the range -1 to 1.
 * @returns {number}
 */
function stepPrice(
  price,
  market,
  unit,
) {
  return Math.max(
    0,
    price *
      (
        1 +
        unit *
          market.volatility
      ),
  )
}

/**
 * Builds the price path for a spin: one price per step, each a random
 * step from the one before, the last being the final price.
 *
 * @param {number} startPrice
 * @param {object} market
 * @param {number[]} units Random values in the range -1 to 1.
 * @returns {number[]}
 */
function buildPath(
  startPrice,
  market,
  units,
) {
  const path = []

  let price = startPrice

  for (const unit of units) {
    price =
      stepPrice(
        price,
        market,
        unit,
      )

    path.push(price)
  }

  return path
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
 * The completion bonus is awarded for winning Round 3. A player can only
 * be on Round 3 after winning Rounds 1 and 2 in a row.
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
   * Completion bonus: winning the top round of the streak.
   */
  const bonus =
    won &&
    state.round === TOTAL_ROUNDS
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

  /**
   * The level the player is on. Climbs by one after each win and falls
   * back to 1 after a loss or after completing the top round.
   */
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

  outcome:
    null,

  /**
   * Result calculated when the round ends but hidden until the reel
   * finishes revealing the final market value.
   */
  pending:
    null,

  /**
   * The price path of the current spin, and how much of it has been
   * played so far. Empty outside a spin.
   */
  path:
    [],

  pathIndex:
    0,

  /**
   * Financial result of the most recently completed round.
   */
  roundResult:
    0,

  /**
   * Net result accumulated during the current streak, including any
   * completion bonus. Reset when the streak ends.
   */
  netResult:
    0,

  /**
   * Wins in the current streak. Reset when the streak ends.
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
       * Ticks only move the market between spins. During a spin the price
       * follows the spin's own path, and afterwards it is frozen while the
       * result is displayed.
       */
      if (
        state.phase !==
        'idle'
      ) {
        return state
      }

      const market =
        MARKETS_BY_ID[
          state.marketId
        ]

      const price =
        stepPrice(
          state.price,
          market,
          action.unit,
        )

      return {
        ...state,

        price,

        direction:
          price >= state.price
            ? 'up'
            : 'down',
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
       *
       * The whole price path for the spin is generated now, and its first
       * step is applied at once, so the market starts moving with the
       * reels.
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

      const market =
        MARKETS_BY_ID[
          state.marketId
        ]

      const path =
        buildPath(
          state.price,
          market,
          action.units ?? [],
        )

      const first =
        path[0] ??
        state.price

      return {
        ...state,

        phase:
          'live',

        prediction:
          action.direction,

        startPrice:
          state.price,

        price:
          first,

        direction:
          first >= state.price
            ? 'up'
            : 'down',

        changePct:
          (
            first /
              state.price -
            1
          ) * 100,

        path,

        pathIndex:
          path.length > 0
            ? 1
            : 0,

        outcome:
          null,

        pending:
          null,

        roundResult:
          0,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Spin path                                                              */
    /* ---------------------------------------------------------------------- */

    case 'PATH_STEP': {
      /**
       * Plays the next price of the spin's path. Runs on a timer started
       * by the tap and keeps going through the reveal, so the live price
       * reaches the final price as the reels settle.
       */
      if (
        (
          state.phase !==
            'live' &&
          state.phase !==
            'revealing'
        ) ||
        state.pathIndex >=
          state.path.length
      ) {
        return state
      }

      const price =
        state.path[
          state.pathIndex
        ]

      return {
        ...state,

        price,

        direction:
          price >= state.price
            ? 'up'
            : 'down',

        changePct:
          (
            price /
              state.startPrice -
            1
          ) * 100,

        pathIndex:
          state.pathIndex + 1,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Round end                                                              */
    /* ---------------------------------------------------------------------- */

    case 'ROUND_END': {
      /**
       * Fired by a timer ROUND_MS after the tap, when the reels start to
       * stop. The final price is the last price of the spin's path. The
       * result is settled now but hidden until the reels have stopped.
       */
      if (
        state.phase !==
        'live'
      ) {
        return state
      }

      const finalPrice =
        state.path[
          state.path.length - 1
        ] ?? state.price

      const changePct =
        (
          finalPrice /
            state.startPrice -
          1
        ) * 100

      const won =
        state.prediction ===
        'up'
          ? finalPrice >
            state.startPrice
          : finalPrice <
            state.startPrice

      return {
        ...state,

        phase:
          'revealing',

        pending: {
          ...settleRound(
            state,
            won,
            changePct,
          ),

          finalPrice,
        },
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

        /**
         * Land the live price exactly on the final price, whatever the
         * timers did.
         */
        price:
          pending.finalPrice,

        changePct:
          (
            pending.finalPrice /
              state.startPrice -
            1
          ) * 100,

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

        path:
          [],

        pathIndex:
          0,
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Next round                                                             */
    /* ---------------------------------------------------------------------- */

    case 'NEXT_ROUND': {
      /**
       * Rounds are a streak:
       *
       *   win below the top  -> climb to the next round
       *   win at the top     -> streak complete, start again at Round 1
       *   loss               -> streak lost, back to Round 1
       *
       * The streak totals are cleared here, not when the result arrives,
       * so a lost streak can still be read on screen.
       */
      const won =
        state.outcome?.won === true

      const climbing =
        won &&
        state.round <
          TOTAL_ROUNDS

      const nextRound =
        climbing
          ? state.round + 1
          : 1

      return {
        ...state,

        phase:
          'idle',

        prediction:
          null,

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

        netResult:
          climbing
            ? state.netResult
            : 0,

        completedRounds:
          climbing
            ? state.completedRounds
            : 0,

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
 *   resultPrice: number|null,
 *   startPrice: number,
 *   direction: 'up'|'down',
 *   changePct: number,
 *   balance: number,
 *   stake: number,
 *   round: number,
 *   multiplier: number,
 *   phase: string,
 *   prediction: 'up'|'down'|null,
 *   outcome: object|null,
 *   roundResult: number,
 *   netResult: number,
 *   completedRounds: number,
 *   roundsPlayed: number,
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
  /* Market ticks between spins                                               */
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
  /* Live price during a spin                                                 */
  /* ------------------------------------------------------------------------ */

  /**
   * One timer for the whole spin. It depends on `spinning`, not on the
   * phase, so it keeps its rhythm when the spin moves from 'live' to
   * 'revealing'.
   */
  const spinning =
    state.phase ===
      'live' ||
    state.phase ===
      'revealing'

  useEffect(() => {
    if (!spinning) {
      return undefined
    }

    const id =
      setInterval(() => {
        dispatch({
          type:
            'PATH_STEP',
        })
      }, PATH_STEP_MS)

    return () =>
      clearInterval(id)
  }, [
    spinning,
  ])

  /* ------------------------------------------------------------------------ */
  /* Round end                                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      state.phase !==
      'live'
    ) {
      return undefined
    }

    const id =
      setTimeout(() => {
        dispatch({
          type:
            'ROUND_END',
        })
      }, ROUND_MS)

    return () =>
      clearTimeout(id)
  }, [
    state.phase,
  ])

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
   * Commits an UP or DOWN prediction and starts the spin.
   *
   * The random numbers for the spin's price path are drawn here, so the
   * reducer stays pure.
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
          units:
            Array.from(
              {
                length:
                  SPIN_STEPS + 1,
              },
              () =>
                Math.random() *
                  2 -
                1,
            ),
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
   * Rounds already climbed in the current streak.
   *
   * This is the number of wins in a row, and it is what the round bar and
   * the bonus table tick off. A lost spin is never ticked.
   */
  const roundsPlayed =
    state.completedRounds

  /**
   * The final price of the spin, for the reel to land on. Known from the
   * moment the reels start to stop; before that it is null and the reel
   * has nothing to show. After the reveal it is simply the market price.
   */
  const resultPrice =
    state.phase ===
    'revealing'
      ? state.pending
          ?.finalPrice ??
        null
      : state.phase ===
          'result'
        ? state.price
        : null

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

    resultPrice,

    spin,

    increaseStake,

    decreaseStake,

    reset,

    selectMarket,
  }
}