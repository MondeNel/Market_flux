/**
 * @file src/features/market-flux/components/StatusLine.jsx
 *
 * @description
 * One-line status under the reel and the live price row.
 *
 * Idle, it is the instruction line. During a round it becomes the round
 * status with a countdown, and after settlement it reports the result:
 *
 *   idle        Pick UP or DOWN to start the round
 *   live        Round live · UP · 5s
 *   revealing   Revealing the price
 *   result      Correct +R30 · ×3
 *               Correct +R80 · Bonus +R100   Net +R270
 *   broke       Restart to play again
 *
 * The net for the current three-round run is shown from the second round
 * on, when it differs from the round result. A completion bonus is
 * reported on its own, and the net always includes it.
 *
 * SCREEN READERS
 * ---------------------------------------------------------------------------
 * Only the message is a live region. The countdown seconds are kept out of
 * it, otherwise the line would be read aloud every second.
 *
 * Presentational only.
 */

import {
  ChevronsLeft,
  ChevronsRight,
  Pointer,
} from 'lucide-react'

import { ROUND_MS } from '../hooks/useMarketSimulation'
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
 * @returns {{text: string, tone: string, icon: boolean, net: object|null, countdown: boolean}}
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
    const hasBonus =
      outcome.bonus > 0

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

    const result =
      `${outcome.won ? 'Correct' : 'Missed'} ${formatMoney(outcome.amount, { sign: true })}`

    return {
      text: hasBonus
        ? `${result} · Bonus ${formatMoney(outcome.bonus, { sign: true })}`
        : `${result} · ×${outcome.multiplier}`,
      tone: outcome.won ? TONES.win : TONES.loss,
      icon: false,
      net,
      countdown: false,
    }
  }

  if (phase === 'revealing') {
    return {
      text: 'Revealing the price',
      tone: TONES.live,
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
      tone: TONES.live,
      icon: false,
      net: null,
      countdown: true,
    }
  }

  if (isBroke) {
    return {
      text: 'Restart to play again',
      tone: TONES.warn,
      icon: false,
      net: null,
      countdown: false,
    }
  }

  return {
    text: 'Pick UP or DOWN to start the round',
    tone: TONES.hint,
    icon: true,
    net: null,
    countdown: false,
  }
}

/**
 * @param {object} props
 * @param {'idle'|'live'|'revealing'|'result'} props.phase
 * @param {object|null} props.outcome Last round outcome.
 * @param {number} props.netResult Net for the current three-round run.
 * @param {'up'|'down'|null} props.prediction
 * @param {boolean} props.isBroke
 * @param {number} [props.elapsed] Milliseconds elapsed in the live round.
 *   When omitted, no countdown is shown.
 * @returns {JSX.Element}
 */
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
    <p
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

      <span
        aria-live="polite"
        className="truncate"
      >
        {message.text}
      </span>

      {seconds !== null && (
        <span
          aria-hidden="true"
          className="
            shrink-0
            tabular-nums
            text-cyan-100
          "
        >
          · {seconds}s
        </span>
      )}

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