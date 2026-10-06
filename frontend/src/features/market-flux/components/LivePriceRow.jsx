/**
 * @file src/features/market-flux/components/LivePriceRow.jsx
 *
 * @description
 * The live price strip that sits under the reel.
 *
 *   Bitcoin      [ 8 | 6 | 6 | 4 | 1 | , | 8 | 2 ]      ● Live
 *
 * - Left: the market name (from the "Bitcoin" label beside the reel in
 *   the sketch).
 * - Centre: the live price in small boxed digit cells.
 * - Right: the Live marker.
 *
 * The reel above it shows the ROUND RESULT. This strip is the market
 * itself, ticking once a second.
 *
 * THE FLICK
 * ---------------------------------------------------------------------------
 * Digits are coloured by the direction of the latest tick (green up, red
 * down). When the market CHANGES direction, the strip flickers once, like
 * a relay clicking over, so a reversal is noticeable without reading the
 * numbers. Reduced-motion users get the colour change without the flicker.
 *
 * LIVE / FINAL
 * ---------------------------------------------------------------------------
 * The simulation freezes the market while the reel reveals and while the
 * result shows. During those phases the marker reads "Final", the digits
 * go neutral and nothing flickers.
 *
 * Presentational only.
 */

import { useState } from 'react'
import {
  motion,
  useReducedMotion,
} from 'framer-motion'

import { formatPrice } from '../utils/formatMoney'

const TONES = {
  up: {
    color: '#39FF88',
    shadow: '0 0 6px rgba(57,255,136,0.7)',
  },

  down: {
    color: '#FF3158',
    shadow: '0 0 6px rgba(255,49,88,0.7)',
  },

  closed: {
    color: 'rgba(234,248,255,0.7)',
    shadow: 'none',
  },
}

const FLICK = {
  opacity: [0.15, 1, 0.45, 1],
}

const FLICK_TRANSITION = {
  duration: 0.35,
  times: [0, 0.3, 0.55, 1],
}

/**
 * @param {object} props
 * @param {number} props.price Live market price.
 * @param {number} [props.decimals=2]
 * @param {'up'|'down'} [props.direction='up'] Direction of the latest tick.
 * @param {string} props.marketName Shown on the left.
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

  /**
   * Count direction reversals.
   *
   * State is adjusted during render (rather than in an effect) so the
   * flicker starts in the same commit as the new digits.
   */
  const [track, setTrack] =
    useState({
      price,
      direction,
      flicks: 0,
    })

  if (track.price !== price) {
    setTrack({
      price,
      direction,
      flicks:
        direction !== track.direction
          ? track.flicks + 1
          : track.flicks,
    })
  }

  const live =
    phase === 'idle' ||
    phase === 'live'

  const tone =
    live
      ? TONES[direction] ?? TONES.up
      : TONES.closed

  const formatted =
    formatPrice(
      price,
      decimals,
    )

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
      {/* ------------------------------------------------------------------
       * Market name
       * --------------------------------------------------------------- */}

      <span
        className="
          truncate
          text-[11px]
          font-semibold
          text-white/55
        "
      >
        {marketName}
      </span>

      {/* ------------------------------------------------------------------
       * Boxed digits
       * --------------------------------------------------------------- */}

      <motion.div
        key={track.flicks}
        role="img"
        aria-label={`${marketName} live price ${formatted}`}
        initial={{ opacity: 1 }}
        animate={
          !reducedMotion &&
          track.flicks > 0
            ? FLICK
            : { opacity: 1 }
        }
        transition={FLICK_TRANSITION}
        className="
          flex
          divide-x
          divide-white/10
          overflow-hidden
          rounded-[6px]
          border
          border-cyan-300/25
          bg-black/45
        "
      >
        {formatted
          .split('')
          .map((char, index) =>
            /\d/.test(char) ? (
              <span
                key={index}
                aria-hidden="true"
                className="
                  grid
                  h-6
                  w-[15px]
                  place-items-center
                  text-[15px]
                  font-black
                  leading-none
                  tabular-nums
                "
                style={{
                  color: tone.color,
                  textShadow: tone.shadow,
                }}
              >
                {char}
              </span>
            ) : (
              <span
                key={index}
                aria-hidden="true"
                className="
                  flex
                  h-6
                  w-[9px]
                  items-end
                  justify-center
                  pb-[3px]
                  text-[15px]
                  font-black
                  leading-none
                "
                style={{
                  color: tone.color,
                }}
              >
                {char}
              </span>
            ),
          )}
      </motion.div>

      {/* ------------------------------------------------------------------
       * Live marker
       * --------------------------------------------------------------- */}

      <LiveMarker live={live} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Live marker                                                                */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {boolean} props.live Market is ticking. Otherwise it is final.
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
              bg-emerald-400/60
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