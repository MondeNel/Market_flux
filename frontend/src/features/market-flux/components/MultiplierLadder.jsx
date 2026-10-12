
/**
 * @file src/features/market-flux/components/MultiplierLadder.jsx
 *
 * @description
 * Market Flux mechanical multiplier progression console.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * - Single angular, metallic liquid-glass housing
 * - Continuous illuminated progression rail
 * - Circular physical multiplier nodes
 * - Emerald/cyan active round
 * - Recessed inactive rounds
 * - Gold completion bonus
 * - Responsive without individual rectangular cards
 *
 * GAME LOGIC
 * ---------------------------------------------------------------------------
 * - Multipliers come from ROUND_CONFIG
 * - Bonus multiplier comes from BONUS_MULTIPLIER
 * - Played rounds are derived from roundsPlayed
 * - Bonus eligibility depends on completedRounds
 * - No game-state mutations occur in this component
 */

import { Check, Star } from 'lucide-react'

import {
  BONUS_MULTIPLIER,
  ROUND_CONFIG,
} from '../hooks/useMarketSimulation'

import { formatMoney } from '../utils/formatMoney'

const HAS_BONUS = BONUS_MULTIPLIER > 0

/**
 * One physical multiplier station.
 */
function MultiplierNode({
  multiplier,
  label,
  amount,
  active = false,
  played = false,
  won = false,
  bonus = false,
  disabled = false,
}) {
  const illuminated = active && !bonus

  return (
    <div
      className={`
        relative z-10 flex min-w-0 flex-1
        flex-col items-center justify-start
        transition-opacity duration-300
        ${disabled ? 'opacity-35' : 'opacity-100'}
      `}
    >
      {/* Mechanical node assembly */}
      <div
        className={`
          relative grid aspect-square
          w-[clamp(48px,13vw,82px)]
          shrink-0 place-items-center
          rounded-full p-[4px]
          transition-all duration-500

          ${
            bonus
              ? `
                bg-[linear-gradient(145deg,#fff2b2_0%,#c68a20_17%,#362008_42%,#e4a72e_74%,#fff2ae_100%)]
                shadow-[0_0_13px_rgba(255,180,32,0.65),0_0_32px_rgba(255,160,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.9)]
              `
              : illuminated
                ? `
                  bg-[linear-gradient(145deg,#d5ffff_0%,#00f5e1_22%,#025a66_49%,#00ffba_78%,#c9ffff_100%)]
                  shadow-[0_0_15px_rgba(0,255,194,0.85),0_0_34px_rgba(0,255,194,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)]
                `
                : `
                  bg-[linear-gradient(145deg,#a6efff_0%,#167da8_20%,#02131f_50%,#08618c_79%,#80dcff_100%)]
                  shadow-[0_4px_10px_rgba(0,0,0,0.85),0_0_8px_rgba(0,168,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.55)]
                `
          }
        `}
      >
        {/* Dark metallic inner bezel */}
        <div
          className="
            absolute inset-[3px] rounded-full
            bg-[linear-gradient(150deg,#00131e_0%,#092b3d_35%,#00070e_65%,#126187_100%)]
            shadow-[inset_0_3px_7px_rgba(0,0,0,0.95),inset_0_-1px_2px_rgba(130,225,255,0.4)]
          "
        />

        {/* Glass lens */}
        <div
          className={`
            absolute inset-[7px] rounded-full border
            ${
              bonus
                ? 'border-amber-300/70 bg-[radial-gradient(circle_at_50%_28%,#5b390e_0%,#241402_56%,#090601_100%)]'
                : illuminated
                  ? 'border-emerald-300/75 bg-[radial-gradient(circle_at_50%_30%,#075b5d_0%,#003b40_48%,#001319_100%)]'
                  : 'border-cyan-400/35 bg-[radial-gradient(circle_at_50%_22%,#07344e_0%,#031827_55%,#000710_100%)]'
            }
            shadow-[inset_0_3px_8px_rgba(0,0,0,0.9),inset_0_-2px_6px_rgba(0,0,0,0.8)]
          `}
        />

        {/* Lens reflection */}
        <div
          className="
            pointer-events-none absolute
            inset-x-[19%] top-[13%] h-[24%]
            rounded-[100%]
            bg-gradient-to-b from-white/25 to-transparent
            opacity-65 blur-[2px]
          "
        />

        {/* Illuminated interior */}
        <div
          className={`
            relative z-10 flex flex-col
            items-center justify-center
            ${
              bonus
                ? 'text-[#ffe18a]'
                : illuminated
                  ? 'text-[#b7fff0]'
                  : 'text-[#8bcaff]'
            }
          `}
        >
          {bonus && (
            <Star
              size={17}
              fill="currentColor"
              strokeWidth={1.5}
              className="
                mb-[-2px]
                h-[clamp(12px,3vw,19px)]
                w-[clamp(12px,3vw,19px)]
                drop-shadow-[0_0_7px_rgba(255,202,80,0.9)]
              "
            />
          )}

          {played && won && !bonus ? (
            <Check
              className="h-6 w-6 text-emerald-300"
              strokeWidth={3}
            />
          ) : (
            <span
              className={`
                font-black leading-none tracking-[-0.05em]
                text-[clamp(17px,5vw,30px)]
                ${
                  bonus
                    ? 'drop-shadow-[0_0_9px_rgba(255,190,50,0.9)]'
                    : illuminated
                      ? 'drop-shadow-[0_0_10px_rgba(0,255,200,0.9)]'
                      : 'drop-shadow-[0_0_6px_rgba(0,160,255,0.4)]'
                }
              `}
            >
              ×{multiplier}
            </span>
          )}
        </div>

        {/* Outer light ring */}
        <div
          className={`
            pointer-events-none absolute inset-[-4px]
            rounded-full border
            ${
              bonus
                ? 'border-amber-300/35 shadow-[0_0_15px_rgba(255,190,45,0.4)]'
                : illuminated
                  ? 'border-emerald-300/45 shadow-[0_0_18px_rgba(0,255,200,0.5)]'
                  : 'border-cyan-400/10'
            }
          `}
        />
      </div>

      {/* Node identification */}
      <div className="mt-2 flex flex-col items-center gap-[2px] text-center">
        <span
          className={`
            whitespace-nowrap font-black uppercase
            tracking-[0.04em]
            text-[clamp(9px,2.3vw,13px)]
            ${
              bonus
                ? 'text-amber-200'
                : illuminated
                  ? 'text-emerald-300'
                  : 'text-[#82b7df]'
            }
          `}
        >
          {label}
        </span>

        {amount !== null && amount !== undefined && (
          <span
            className={`
              whitespace-nowrap font-bold
              text-[clamp(9px,2.3vw,12px)]
              ${
                bonus
                  ? 'text-amber-300'
                  : illuminated
                    ? 'text-cyan-100'
                    : 'text-cyan-300/65'
              }
            `}
          >
            {amount}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * @param {object} props
 * @param {number} props.round Current round, 1-based.
 * @param {number} [props.roundsPlayed] Rounds finished.
 * @param {number} [props.completedRounds] Rounds won.
 * @param {number} [props.stake] Current stake.
 * @returns {JSX.Element}
 */
function MultiplierLadder({
  round,
  roundsPlayed,
  completedRounds,
  stake,
}) {
  const played = roundsPlayed ?? round - 1

  const bonusAlive =
    completedRounds === undefined ||
    completedRounds >= played

  const bonusAmount =
    stake === undefined
      ? null
      : stake * BONUS_MULTIPLIER

  const nodes = [
    ...ROUND_CONFIG.map((item) => ({
      id: `round-${item.round}`,
      round: item.round,
      multiplier: item.multiplier,
      label: `Round ${item.round}`,
      bonus: false,
    })),
    ...(HAS_BONUS
      ? [
          {
            id: 'bonus',
            multiplier: BONUS_MULTIPLIER,
            label: 'Bonus',
            bonus: true,
          },
        ]
      : []),
  ]

  return (
    <section
      role="group"
      aria-label={
        HAS_BONUS
          ? `Round multipliers. Win all three rounds for a ×${BONUS_MULTIPLIER} bonus.`
          : 'Round multipliers'
      }
      className="relative mx-auto w-full max-w-[860px] px-1 pb-1 pt-3"
    >
      {/* Main structural housing */}
      <div
        className="
          relative isolate overflow-hidden
          rounded-[28px]
          border border-cyan-300/50
          bg-[linear-gradient(165deg,rgba(8,64,91,0.84)_0%,rgba(0,14,27,0.95)_24%,rgba(0,7,16,0.97)_73%,rgba(0,55,83,0.9)_100%)]
          px-[clamp(10px,3vw,26px)]
          pb-[clamp(12px,2.8vw,22px)]
          pt-[clamp(19px,3.4vw,28px)]
          shadow-[0_14px_32px_rgba(0,0,0,0.9),0_0_18px_rgba(0,194,255,0.25),inset_0_2px_2px_rgba(164,242,255,0.55),inset_0_-4px_12px_rgba(0,0,0,0.95)]
          backdrop-blur-xl
        "
        style={{
          clipPath:
            'polygon(4% 0, 96% 0, 100% 17%, 100% 89%, 96% 100%, 4% 100%, 0 89%, 0 17%)',
        }}
      >
        {/* Top metallic reflection */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            inset-x-[6%] top-0 h-[3px]
            bg-gradient-to-r
            from-transparent via-cyan-200 to-transparent
            shadow-[0_0_12px_rgba(0,220,255,0.85)]
          "
        />

        {/* Recessed glass interior */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-[7px]
            border border-cyan-400/15
            bg-[linear-gradient(180deg,rgba(0,190,255,0.055),transparent_45%,rgba(0,170,255,0.045))]
          "
          style={{
            clipPath:
              'polygon(4% 0, 96% 0, 100% 17%, 100% 89%, 96% 100%, 4% 100%, 0 89%, 0 17%)',
          }}
        />

        {/* Glass light sweep */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-[8%] right-[8%] top-[8px]
            h-[32%] rounded-[50%]
            bg-gradient-to-b from-cyan-300/[0.12] to-transparent
            blur-xl
          "
        />

        {/* Rail and nodes */}
        <div className="relative">
          {/* Continuous recessed energy track */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              left-[7%] right-[7%]
              top-[clamp(24px,6.5vw,41px)]
              h-[7px]
              -translate-y-1/2
              rounded-full
              bg-[#000810]
              shadow-[inset_0_2px_4px_rgba(0,0,0,1),0_1px_1px_rgba(100,220,255,0.4)]
            "
          >
            <div
              className="
                absolute inset-x-0 top-[2px] h-[2px]
                bg-gradient-to-r
                from-cyan-400
                via-emerald-300
                to-amber-300
                shadow-[0_0_8px_rgba(0,255,230,0.9)]
              "
            />
          </div>

          {/* Individual stations */}
          <div className="relative flex w-full items-start justify-between gap-1">
            {nodes.map((node) => {
              const isCurrent =
                !node.bonus && node.round === round

              const isPlayed =
                !node.bonus && node.round <= played

              const won =
                isPlayed &&
                completedRounds !== undefined &&
                completedRounds >= node.round

              const amount =
                node.bonus
                  ? bonusAmount === null
                    ? null
                    : formatMoney(bonusAmount, { sign: true })
                  : isCurrent && stake !== undefined
                    ? formatMoney(stake * node.multiplier)
                    : null

              return (
                <div
                  key={node.id}
                  className="relative flex min-w-0 flex-1 justify-center"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <MultiplierNode
                    multiplier={node.multiplier}
                    label={node.label}
                    amount={amount}
                    active={isCurrent}
                    played={isPlayed}
                    won={won}
                    bonus={node.bonus}
                    disabled={node.bonus && !bonusAlive}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Lower structural lighting */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            bottom-0 left-[18%] right-[18%]
            h-[2px]
            bg-gradient-to-r
            from-transparent via-cyan-300 to-transparent
            shadow-[0_0_12px_rgba(0,225,255,0.9)]
          "
        />
      </div>
    </section>
  )
}

export default MultiplierLadder
