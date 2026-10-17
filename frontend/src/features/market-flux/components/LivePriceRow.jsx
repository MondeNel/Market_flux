/**
 * @file src/features/market-flux/components/LivePriceRow.jsx
 *
 * Compact, reference-inspired live-price rail.
 * The market name is retained for accessibility but is not repeated visually.
 */

import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { formatPrice } from '../utils/formatMoney'

const COLORS = {
  up: '#39FF88',
  down: '#FF3158',
  neutral: '#A8F3FF',
}

function LivePriceRow({
  price,
  decimals = 2,
  direction = 'up',
  marketName,
  phase = 'idle',
}) {
  const reducedMotion = useReducedMotion()
  const formatted = formatPrice(price, decimals)
  const previousRef = useRef(formatted)
  const previousDirectionRef = useRef(direction)
  const tickRef = useRef(0)

  // Remember the last rendered price so only actual changes animate.
  const previous = previousRef.current
  const reversed = direction !== previousDirectionRef.current
  if (formatted !== previous) {
    tickRef.current += 1
    previousRef.current = formatted
    previousDirectionRef.current = direction
  }

  const live = phase !== 'result'
  const tone = live ? COLORS[direction] ?? COLORS.neutral : COLORS.neutral
  const previousDigits = previous.replace(/\D/g, '')
  const currentDigits = formatted.replace(/\D/g, '')
  const changedFromRight = new Set()

  for (let i = 0; i < currentDigits.length; i += 1) {
    const current = currentDigits[currentDigits.length - 1 - i]
    const prior = previousDigits[previousDigits.length - 1 - i]
    if (current !== prior) changedFromRight.add(i)
  }

  let digitPosition = -1
  const digitTotal = currentDigits.length

  return (
    <div
      role="group"
      aria-label={`${marketName || 'Market'} ${live ? 'live' : 'final'} price ${formatted}`}
      className="relative mx-auto flex h-[24px] w-full max-w-[860px] min-w-0 items-center justify-between overflow-hidden border-x border-cyan-400/30 bg-[linear-gradient(90deg,rgba(0,12,22,0.55),rgba(0,20,34,0.82)_50%,rgba(0,12,22,0.55))] px-3 shadow-[inset_0_1px_0_rgba(160,245,255,0.24),inset_0_-1px_0_rgba(0,200,255,0.22)] sm:h-[28px] sm:px-5"
      style={{ clipPath: 'polygon(3% 0,97% 0,100% 50%,97% 100%,3% 100%,0 50%)' }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent" />

      <span className="relative z-10 flex shrink-0 items-center gap-1 text-[8px] font-black uppercase tracking-[0.1em] text-cyan-200/75 sm:text-[10px]">
        <span className="h-[5px] w-[5px] rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(0,220,255,0.85)]" />
        Price
      </span>

      <div
        role="img"
        aria-label={`Price ${formatted}`}
        className="relative z-10 flex min-w-0 items-center justify-center gap-[1px] overflow-hidden rounded-[3px] border border-cyan-500/15 bg-black/45 px-[5px] py-[1px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)]"
      >
        {[...formatted].map((char, index) => {
          if (!/\d/.test(char)) {
            return (
              <span key={`separator-${index}`} aria-hidden="true" className="text-[11px] font-black leading-none text-cyan-200/65 sm:text-[13px]">
                {char}
              </span>
            )
          }

          digitPosition += 1
          const changed = changedFromRight.has(digitTotal - 1 - digitPosition)
          return (
            <motion.span
              key={`digit-${index}`}
              aria-hidden="true"
              initial={false}
              animate={
                !reducedMotion && live && changed
                  ? { y: [3, 0], opacity: [0.55, 1] }
                  : { y: 0, opacity: 1 }
              }
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="inline-block min-w-[10px] text-center text-[12px] font-black leading-none tabular-nums sm:min-w-[12px] sm:text-[14px]"
              style={{
                color: live && changed ? tone : '#DDF8FF',
                textShadow: live && changed ? `0 0 7px ${tone}` : '0 0 4px rgba(0,180,255,0.35)',
              }}
            >
              {char}
            </motion.span>
          )
        })}
      </div>

      <span className="relative z-10 flex shrink-0 items-center gap-1 text-[9px] font-black uppercase tracking-[0.08em] text-cyan-200 sm:text-[11px]">
        <span className={`h-[6px] w-[6px] rounded-full ${live ? 'bg-cyan-400 shadow-[0_0_7px_rgba(0,220,255,0.9)]' : 'bg-white/35'}`} />
        {live ? 'Live' : 'Final'}
      </span>
      {reversed && live && !reducedMotion && (
        <motion.span
          key={`reversal-${tickRef.current}`}
          aria-hidden="true"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 bg-cyan-300/10"
        />
      )}
    </div>
  )
}

export default LivePriceRow
