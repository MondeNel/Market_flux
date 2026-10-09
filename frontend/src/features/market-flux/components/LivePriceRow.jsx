/**
 * @file src/features/market-flux/components/LivePriceRow.jsx
 *
 * @description
 * Compact live-market strip displayed beneath the main Market Flux reel.
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
    glow: '0 0 8px rgba(57,255,136,0.8)',
    cellGlow: 'rgba(57,255,136,0.12)',
  },

  down: {
    color: '#FF3158',
    glow: '0 0 8px rgba(255,49,88,0.8)',
    cellGlow: 'rgba(255,49,88,0.12)',
  },

  closed: {
    color: 'rgba(234,248,255,0.85)',
    glow: 'none',
    cellGlow: 'rgba(255,255,255,0.03)',
  },
}

const TICK_ANIMATION = {
  initial: {
    y: 4,
    opacity: 0.4,
    scale: 0.95,
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

function LivePriceRow({
  price,
  decimals = 2,
  direction = 'up',
  marketName,
  phase = 'idle',
}) {
  const reducedMotion = useReducedMotion()

  const live = phase !== 'result'

  const formatted = formatPrice(price, decimals)

  const [previous, setPrevious] = useState({
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
      reversal: direction !== previous.direction,
    })
  }

  const previousValue = previous.value

  const changedIndexes = useMemo(() => {
    const maxLength = Math.max(
      formatted.length,
      previousValue.length,
    )

    const indexes = new Set()

    for (let index = 0; index < maxLength; index += 1) {
      if (formatted[index] !== previousValue[index]) {
        indexes.add(index)
      }
    }

    return indexes
  }, [formatted, previousValue])

  const tone = live ? TONES[direction] ?? TONES.up : TONES.closed
  const rowKey = previous.tick

  return (
    <div
      role="group"
      aria-label="Live market price"
      className="
        relative
        mx-auto
        flex
        h-[52px]
        w-full
        max-w-[420px]
        items-center
        justify-between
        rounded-full
        border
        border-cyan-400/40
        bg-gradient-to-r
        from-cyan-950/70
        via-black/85
        to-cyan-950/70
        px-4
        shadow-[0_0_25px_rgba(0,191,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-4px_10px_rgba(0,0,0,0.85)]
        backdrop-blur-2xl
      "
    >
      {/* Top glossy reflection line */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-6
          top-0
          h-[1px]
          bg-gradient-to-r
          from-transparent
          via-cyan-200/70
          to-transparent
        "
      />

      {/* Market Name */}
      <span
        className="
          truncate
          text-[13px]
          font-black
          tracking-wider
          text-white
          drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
        "
      >
        {marketName}
      </span>

      {/* Live Price Machine Display */}
      <motion.div
        key={rowKey}
        role="img"
        aria-label={`${marketName} live price ${formatted}`}
        initial={
          !reducedMotion && previous.reversal && live
            ? REVERSAL_ANIMATION.initial
            : false
        }
        animate={
          !reducedMotion && previous.reversal && live
            ? REVERSAL_ANIMATION.animate
            : undefined
        }
        transition={
          !reducedMotion && previous.reversal && live
            ? REVERSAL_ANIMATION.transition
            : undefined
        }
        className="
          flex
          overflow-hidden
          rounded-lg
          border
          border-cyan-400/30
          bg-black/60
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]
        "
      >
        {formatted.split('').map((char, index) => {
          const isDigitChar = /\d/.test(char)
          const changed = changedIndexes.has(index)

          if (!isDigitChar) {
            return (
              <span
                key={`${char}-${index}`}
                aria-hidden="true"
                className="
                  grid
                  h-7
                  w-[10px]
                  place-items-center
                  border-r
                  border-cyan-400/10
                  text-[15px]
                  font-black
                  leading-none
                  text-cyan-300/70
                "
              >
                {char}
              </span>
            )
          }

          const digitKey = `${index}-${char}-${rowKey}`

          return (
            <span
              key={digitKey}
              className="
                relative
                grid
                h-7
                w-[18px]
                place-items-center
                overflow-hidden
                border-r
                border-cyan-400/10
                last:border-r-0
              "
              style={{
                backgroundColor:
                  live && changed
                    ? tone.cellGlow
                    : 'rgba(0,191,255,0.02)',
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={digitKey}
                  aria-hidden="true"
                  initial={
                    !reducedMotion && live && changed
                      ? TICK_ANIMATION.initial
                      : false
                  }
                  animate={
                    !reducedMotion && live && changed
                      ? TICK_ANIMATION.animate
                      : undefined
                  }
                  transition={
                    !reducedMotion && live && changed
                      ? TICK_ANIMATION.transition
                      : undefined
                  }
                  className="
                    relative
                    z-10
                    text-[16px]
                    font-black
                    leading-none
                    tabular-nums
                  "
                  style={{
                    color: live ? tone.color : TONES.closed.color,
                    textShadow:
                      live && changed
                        ? tone.glow
                        : '0 0 10px rgba(0,191,255,0.4)',
                  }}
                >
                  {char}
                </motion.span>
              </AnimatePresence>
            </span>
          )
        })}
      </motion.div>

      {/* Live / Final Marker */}
      <LiveMarker live={live} />
    </div>
  )
}

function LiveMarker({ live }) {
  return (
    <span
      className="
        flex
        items-center
        gap-1.5
      "
    >
      <span className="relative flex h-2.5 w-2.5">
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
              bg-cyan-400/60
              motion-reduce:animate-none
            "
          />
        )}

        <span
          className={`
            relative
            inline-flex
            h-2.5
            w-2.5
            rounded-full
            ${
              live
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,191,255,1)]'
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
          tracking-[0.15em]
          ${
            live
              ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(0,191,255,0.6)]'
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