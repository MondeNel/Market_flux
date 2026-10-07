/**
 * @file src/features/market-flux/components/LivePriceRow.jsx
 *
 * @description
 * Compact live-market strip displayed beneath the main Market Flux reel.
 *
 * VISUAL MODEL
 * ---------------------------------------------------------------------------
 * The row behaves like a live trading-terminal price display:
 *
 *   Bitcoin     [ 8 ][ 6 ][ 6 ][ 4 ][ 1 ][ 9 ][ 1 ]     ● LIVE
 *
 * Every incoming market tick is treated as a real price update.
 *
 * - Changed digits receive a short mechanical update animation.
 * - Upward ticks use neon green.
 * - Downward ticks use neon red.
 * - Unchanged digits remain visually stable.
 * - A direction reversal produces a slightly stronger row pulse.
 * - The physical digit cells retain the Market Flux 3D / glass language.
 *
 * LIVE / FINAL
 * ---------------------------------------------------------------------------
 * The market is considered live during idle and live phases.
 *
 * During revealing/result phases:
 * - the market display becomes neutral
 * - update animation stops
 * - the marker changes from LIVE to FINAL
 *
 * API
 * ---------------------------------------------------------------------------
 * Existing public props are intentionally preserved:
 *
 *   price
 *   decimals
 *   direction
 *   marketName
 *   phase
 */

import {
  useMemo,
  useState,
} from 'react'

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'

import { formatPrice } from '../utils/formatMoney'

const TONES = {
  up: {
    color: '#39FF88',
    glow: '0 0 7px rgba(57,255,136,0.62)',
    cellGlow: 'rgba(57,255,136,0.10)',
  },

  down: {
    color: '#FF3158',
    glow: '0 0 7px rgba(255,49,88,0.62)',
    cellGlow: 'rgba(255,49,88,0.10)',
  },

  closed: {
    color: 'rgba(234,248,255,0.68)',
    glow: 'none',
    cellGlow: 'rgba(255,255,255,0.025)',
  },
}

const TICK_ANIMATION = {
  initial: {
    y: 5,
    opacity: 0.35,
    scale: 0.94,
  },

  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
  },

  transition: {
    duration: 0.16,
    ease: 'easeOut',
  },
}

const REVERSAL_ANIMATION = {
  initial: {
    opacity: 0.72,
    scale: 0.985,
  },

  animate: {
    opacity: [0.72, 1, 0.86, 1],
    scale: [0.985, 1, 0.992, 1],
  },

  transition: {
    duration: 0.28,
    times: [0, 0.35, 0.65, 1],
    ease: 'easeOut',
  },
}

/**
 * @param {object} props
 * @param {number} props.price Live market price.
 * @param {number} [props.decimals=2] Decimal precision.
 * @param {'up'|'down'} [props.direction='up'] Latest market direction.
 * @param {string} props.marketName Market name.
 * @param {'idle'|'live'|'revealing'|'result'} [props.phase='idle']
 * @returns {JSX.Element}
 */
function LivePriceRow({
  price,
  decimals = 2,
  direction = 'up',
  marketName,
  phase = 'idle',
}) {
  const reducedMotion =
    useReducedMotion()

  const live =
    phase === 'idle' ||
    phase === 'live'

  const formatted =
    formatPrice(
      price,
      decimals,
    )

  /**
   * Keep the previous formatted value and direction so we can determine
   * exactly which characters changed on the latest market tick.
   *
   * This deliberately lives in component state rather than using an effect.
   * The incoming price is the source of truth and the next render immediately
   * derives the tick metadata from it.
   */
  const [previous, setPrevious] =
    useState({
      value: formatted,
      direction,
      tick: 0,
      reversal: false,
    })

  if (previous.value !== formatted) {
    setPrevious({
      value: formatted,
      direction,
      tick: previous.tick + 1,
      reversal:
        direction !== previous.direction,
    })
  }

  const previousValue =
    previous.value

  /**
   * Determine which display characters changed during this tick.
   *
   * We compare the rendered strings character-by-character so separators
   * such as commas and decimal points remain stable.
   */
  const changedIndexes =
    useMemo(() => {
      const maxLength =
        Math.max(
          formatted.length,
          previousValue.length,
        )

      const indexes = new Set()

      for (
        let index = 0;
        index < maxLength;
        index += 1
      ) {
        if (
          formatted[index] !==
          previousValue[index]
        ) {
          indexes.add(index)
        }
      }

      return indexes
    }, [
      formatted,
      previousValue,
    ])

  const tone =
    live
      ? TONES[direction] ?? TONES.up
      : TONES.closed

  const rowKey =
    previous.tick

  return (
    <div
      role="group"
      aria-label="Live market price"
      className="
        grid
        grid-cols-[1fr_auto_1fr]
        items-center
        gap-2
      "
    >
      {/* ================================================================== */}
      {/* MARKET NAME                                                        */}
      {/* ================================================================== */}

      <span
        className="
          truncate
          text-[11px]
          font-semibold
          tracking-[0.01em]
          text-white/55
        "
      >
        {marketName}
      </span>

      {/* ================================================================== */}
      {/* LIVE PRICE MACHINE                                                 */}
      {/* ================================================================== */}

      <motion.div
        key={rowKey}
        role="img"
        aria-label={`${marketName} live price ${formatted}`}
        initial={
          !reducedMotion &&
          previous.reversal &&
          live
            ? REVERSAL_ANIMATION.initial
            : false
        }
        animate={
          !reducedMotion &&
          previous.reversal &&
          live
            ? REVERSAL_ANIMATION.animate
            : undefined
        }
        transition={
          !reducedMotion &&
          previous.reversal &&
          live
            ? REVERSAL_ANIMATION.transition
            : undefined
        }
        className="
          relative
          flex
          overflow-hidden
          rounded-[7px]
          border
          border-cyan-300/20
          bg-black/55
          shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-2px_5px_rgba(0,0,0,0.65),0_4px_10px_rgba(0,0,0,0.25)]
        "
      >
        {/* -------------------------------------------------------------- */}
        {/* Top glass reflection                                           */}
        {/* -------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-20
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent
          "
        />

        {formatted
          .split('')
          .map((char, index) => {
            const isDigit =
              /\d/.test(char)

            const changed =
              changedIndexes.has(index)

            if (!isDigit) {
              return (
                <span
                  key={`${char}-${index}`}
                  aria-hidden="true"
                  className="
                    relative
                    grid
                    h-6
                    w-[9px]
                    place-items-center
                    border-r
                    border-white/[0.06]
                    text-[14px]
                    font-black
                    leading-none
                    text-white/50
                  "
                >
                  {char}
                </span>
              )
            }

            const digitKey =
              `${index}-${char}-${rowKey}`

            return (
              <span
                key={digitKey}
                className="
                  relative
                  grid
                  h-6
                  w-[15px]
                  place-items-center
                  overflow-hidden
                  border-r
                  border-white/[0.07]
                  last:border-r-0
                "
                style={{
                  backgroundColor:
                    live && changed
                      ? tone.cellGlow
                      : 'rgba(255,255,255,0.012)',
                }}
              >
                {/* Mechanical inner highlight */}

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-white/[0.12]
                  "
                />

                {/* Digit */}

                <AnimatePresence
                  initial={false}
                  mode="popLayout"
                >
                  <motion.span
                    key={digitKey}
                    aria-hidden="true"
                    initial={
                      !reducedMotion &&
                      live &&
                      changed
                        ? TICK_ANIMATION.initial
                        : false
                    }
                    animate={
                      !reducedMotion &&
                      live &&
                      changed
                        ? TICK_ANIMATION.animate
                        : undefined
                    }
                    transition={
                      !reducedMotion &&
                      live &&
                      changed
                        ? TICK_ANIMATION.transition
                        : undefined
                    }
                    className="
                      relative
                      z-10
                      text-[15px]
                      font-black
                      leading-none
                      tabular-nums
                    "
                    style={{
                      color:
                        live
                          ? tone.color
                          : TONES.closed.color,

                      textShadow:
                        live &&
                        changed
                          ? tone.glow
                          : tone.shadow,
                    }}
                  >
                    {char}
                  </motion.span>
                </AnimatePresence>

                {/* Active digit lower reflection */}

                {live &&
                  changed && (
                    <motion.span
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        bottom-0
                        left-1/2
                        h-1
                        w-3
                        -translate-x-1/2
                        rounded-full
                        blur-[3px]
                      "
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: [
                          0,
                          0.7,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 0.22,
                        ease: 'easeOut',
                      }}
                      style={{
                        backgroundColor:
                          tone.color,
                      }}
                    />
                  )}
              </span>
            )
          })}
      </motion.div>

      {/* ================================================================== */}
      {/* LIVE MARKER                                                        */}
      {/* ================================================================== */}

      <LiveMarker
        live={live}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Live marker                                                                */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {boolean} props.live Market is currently ticking.
 * @returns {JSX.Element}
 */
function LiveMarker({ live }) {
  return (
    <span
      className="
        flex
        items-center
        justify-end
        gap-1.5
      "
    >
      <span className="relative flex h-2 w-2">
        {live && (
          <span
            aria-hidden="true"
            className="
              absolute
              inline-flex
              h-full
              w-full
              animate-ping
              rounded-full
              bg-emerald-400/50
              motion-reduce:animate-none
            "
          />
        )}

        <span
          className={`
            relative
            inline-flex
            h-2
            w-2
            rounded-full
            ${
              live
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                : 'bg-white/30'
            }
          `}
        />
      </span>

      <span
        className={`
          text-[11px]
          font-black
          uppercase
          tracking-[0.14em]
          ${
            live
              ? 'text-emerald-300'
              : 'text-white/40'
          }
        `}
      >
        {live ? 'Live' : 'Final'}
      </span>
    </span>
  )
}

export default LivePriceRow