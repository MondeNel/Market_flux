/**
 * @file src/features/market-flux/components/StatusLine.jsx
 *
 * @description
 * Compact cinematic status HUD beneath the Market Flux reel.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Floating HUD text, no solid rectangular housing
 * - Symmetrical cyan mechanical chevrons
 * - Small illuminated status indicator
 * - Responsive single-line layout
 * - Emerald wins, red losses, amber warnings
 * - Compact countdown and net-result display
 *
 * BEHAVIOUR
 * ---------------------------------------------------------------------------
 * - Preserves all existing status messages
 * - Countdown is excluded from the live region
 * - Bonus and net results remain visible
 * - No simulation-state mutations
 */

import {
  ChevronsLeft,
  ChevronsRight,
  Pointer,
} from 'lucide-react'

import { ROUND_MS } from '../hooks/useMarketSimulation'
import { formatMoney } from '../utils/formatMoney'

/* -------------------------------------------------------------------------- */
/* Visual tones                                                               */
/* -------------------------------------------------------------------------- */

const TONES = {
  hint: {
    text: 'text-[#a8dcf4]',
    accent: '#00dfff',
    glow: 'rgba(0,210,255,0.35)',
  },

  live: {
    text: 'text-[#c5f5ff]',
    accent: '#00eaff',
    glow: 'rgba(0,234,255,0.55)',
  },

  win: {
    text: 'text-[#39FF88]',
    accent: '#39FF88',
    glow: 'rgba(57,255,136,0.45)',
  },

  loss: {
    text: 'text-[#FF3158]',
    accent: '#FF3158',
    glow: 'rgba(255,49,88,0.45)',
  },

  warn: {
    text: 'text-amber-300',
    accent: '#ffbd48',
    glow: 'rgba(255,189,72,0.4)',
  },
}

/* -------------------------------------------------------------------------- */
/* Message logic                                                              */
/* -------------------------------------------------------------------------- */

function getMessage({
  phase,
  outcome,
  netResult,
  prediction,
  isBroke,
}) {
  if (phase === 'result' && outcome) {
    const hasBonus = outcome.bonus > 0

    const net =
      netResult !== outcome.amount
        ? {
            text: formatMoney(netResult, {
              sign: true,
            }),
            tone:
              netResult > 0
                ? 'text-[#39FF88]'
                : netResult < 0
                  ? 'text-[#FF3158]'
                  : 'text-white/70',
          }
        : null

    const result =
      `${outcome.won ? 'Correct' : 'Missed'} ` +
      formatMoney(outcome.amount, {
        sign: true,
      })

    return {
      text: hasBonus
        ? `${result} · Bonus ${formatMoney(
            outcome.bonus,
            { sign: true },
          )}`
        : `${result} · ×${outcome.multiplier}`,
      tone: outcome.won ? 'win' : 'loss',
      icon: false,
      net,
      countdown: false,
    }
  }

  if (phase === 'revealing') {
    return {
      text: 'Revealing the price',
      tone: 'live',
      icon: false,
      net: null,
      countdown: false,
    }
  }

  if (phase === 'live') {
    return {
      text: prediction
        ? `Round live · ${prediction.toUpperCase()}`
        : 'Round live',
      tone: 'live',
      icon: false,
      net: null,
      countdown: true,
    }
  }

  if (isBroke) {
    return {
      text: 'Restart to play again',
      tone: 'warn',
      icon: false,
      net: null,
      countdown: false,
    }
  }

  return {
    text: 'Pick UP or DOWN to start the round',
    tone: 'hint',
    icon: true,
    net: null,
    countdown: false,
  }
}

/* -------------------------------------------------------------------------- */
/* Decorative HUD chevron                                                     */
/* -------------------------------------------------------------------------- */

function StatusChevron({
  side,
  color,
  glow,
}) {
  const Icon =
    side === 'left'
      ? ChevronsRight
      : ChevronsLeft

  return (
    <span
      aria-hidden="true"
      className="
        pointer-events-none
        flex shrink-0
        items-center justify-center
      "
    >
      <Icon
        className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px]"
        strokeWidth={2}
        style={{
          color,
          filter: `drop-shadow(0 0 4px ${glow})`,
        }}
      />
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

function StatusLine({
  phase,
  outcome,
  netResult,
  prediction,
  isBroke,
  elapsed,
}) {
  const message = getMessage({
    phase,
    outcome,
    netResult,
    prediction,
    isBroke,
  })

  const tone = TONES[message.tone] ?? TONES.hint

  const seconds =
    message.countdown &&
    elapsed !== undefined
      ? Math.max(
          0,
          Math.ceil(
            (ROUND_MS - elapsed) / 1000,
          ),
        )
      : null

  return (
    <div
      role="status"
      className="
        relative isolate
        flex h-[20px] min-h-0
        w-full max-w-full
        items-center justify-center
        overflow-hidden
        px-1
        sm:h-[24px]
      "
    >
      {/* Soft atmospheric illumination */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute left-1/2 top-1/2
          -z-10
          h-[16px] w-[65%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full blur-[12px]
        "
        style={{
          background: tone.glow,
          opacity: 0.22,
        }}
      />

      {/* Left mechanical chevron */}
      <StatusChevron
        side="left"
        color={tone.accent}
        glow={tone.glow}
      />

      {/* Status content */}
      <div
        className="
          relative flex min-w-0
          items-center justify-center
          gap-[4px]
          px-[5px]
          sm:gap-[6px]
          sm:px-2
        "
      >
        {/* Small active status light */}
        <span
          aria-hidden="true"
          className="
            h-[4px] w-[4px]
            shrink-0 rounded-full
          "
          style={{
            background: tone.accent,
            boxShadow: `0 0 5px ${tone.glow}`,
          }}
        />

        {message.icon && (
          <Pointer
            aria-hidden="true"
            className="
              h-[11px] w-[11px]
              shrink-0
              text-cyan-300
              sm:h-[13px] sm:w-[13px]
            "
            strokeWidth={2}
          />
        )}

        {/* Accessible message */}
        <span
          aria-live="polite"
          aria-atomic="true"
          className={`
            min-w-0 truncate
            whitespace-nowrap
            text-[clamp(9px,2.4vw,12px)]
            font-bold leading-none
            tracking-[0.01em]
            ${tone.text}
          `}
          style={{
            textShadow: `0 0 7px ${tone.glow}`,
          }}
        >
          {message.text}
        </span>

        {/* Visual countdown only */}
        {seconds !== null && (
          <span
            aria-hidden="true"
            className="
              shrink-0
              whitespace-nowrap
              text-[10px]
              font-black leading-none
              tabular-nums
              text-cyan-100
              sm:text-[12px]
            "
          >
            · {seconds}s
          </span>
        )}

        {/* Net result */}
        {message.net && (
          <span
            className={`
              shrink-0 whitespace-nowrap
              text-[9px] font-black
              leading-none
              sm:text-[11px]
              ${message.net.tone}
            `}
          >
            Net {message.net.text}
          </span>
        )}
      </div>

      {/* Right mechanical chevron */}
      <StatusChevron
        side="right"
        color={tone.accent}
        glow={tone.glow}
      />
    </div>
  )
}

export default StatusLine