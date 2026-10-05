/**
 * @file src/features/market-flux/components/StatusLine.jsx
 *
 * @description
 * One-line status under the reel.
 *
 * Idle, it is the instruction line from the reference. During a round it
 * becomes the round status, and after settlement it reports the result:
 *
 *   idle        Tap UP or DOWN to spin the numbers
 *   live        Round live · UP
 *   revealing   Revealing price
 *   result      Correct +R30 · ×3   Net +R30
 *   broke       Out of funds · restart to play again
 *
 * The net for the current three-round run is only shown from the second
 * round on, when it differs from the round result.
 *
 * Presentational only.
 */

import {
  ChevronsLeft,
  ChevronsRight,
  Pointer,
} from 'lucide-react'

import { formatMoney } from '../utils/formatMoney'

const TONES = {
  hint: 'text-cyan-200/85',
  live: 'text-cyan-200',
  win: 'text-emerald-300',
  loss: 'text-rose-300',
  warn: 'text-amber-300',
}

/**
 * @param {object} props
 * @returns {{text: string, tone: string, icon: boolean, net: object|null}}
 */
function getMessage({
  phase,
  outcome,
  netResult,
  prediction,
  isBroke,
}) {
  if (
    phase === 'result' &&
    outcome
  ) {
    const net =
      netResult !== outcome.amount
        ? {
            text: formatMoney(netResult, { sign: true }),
            tone:
              netResult > 0
                ? TONES.win
                : netResult < 0
                  ? TONES.loss
                  : 'text-white/70',
          }
        : null

    return {
      text: `${outcome.won ? 'Correct' : 'Missed'} ${formatMoney(outcome.amount, { sign: true })} · ×${outcome.multiplier}`,
      tone: outcome.won ? TONES.win : TONES.loss,
      icon: false,
      net,
    }
  }

  if (phase === 'revealing') {
    return {
      text: 'Revealing price',
      tone: TONES.live,
      icon: false,
      net: null,
    }
  }

  if (phase === 'live') {
    return {
      text: prediction
        ? `Round live · ${prediction.toUpperCase()}`
        : 'Round live',
      tone: TONES.live,
      icon: false,
      net: null,
    }
  }

  if (isBroke) {
    return {
      text: 'Out of funds · restart to play again',
      tone: TONES.warn,
      icon: false,
      net: null,
    }
  }

  return {
    text: 'Tap UP or DOWN to spin the numbers',
    tone: TONES.hint,
    icon: true,
    net: null,
  }
}

/**
 * @param {object} props
 * @param {'idle'|'live'|'revealing'|'result'} props.phase
 * @param {object|null} props.outcome Last round outcome.
 * @param {number} props.netResult Net for the current three-round run.
 * @param {'up'|'down'|null} props.prediction
 * @param {boolean} props.isBroke
 * @returns {JSX.Element}
 */
function StatusLine({
  phase,
  outcome,
  netResult,
  prediction,
  isBroke,
}) {
  const message = getMessage({
    phase,
    outcome,
    netResult,
    prediction,
    isBroke,
  })

  return (
    <p
      aria-live="polite"
      className={`
        flex
        min-h-[22px]
        items-center
        justify-center
        gap-2
        text-[12px]
        font-semibold
        ${message.tone}
      `}
    >
      <ChevronsRight
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-cyan-300/70"
        strokeWidth={2.5}
      />

      {message.icon && (
        <Pointer
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-cyan-300"
          strokeWidth={2}
        />
      )}

      <span className="truncate">
        {message.text}
      </span>

      {message.net && (
        <span
          className={`shrink-0 text-[11px] font-bold ${message.net.tone}`}
        >
          Net {message.net.text}
        </span>
      )}

      <ChevronsLeft
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-cyan-300/70"
        strokeWidth={2.5}
      />
    </p>
  )
}

export default StatusLine