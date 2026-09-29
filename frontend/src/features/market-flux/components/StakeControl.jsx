/**
 * @file src/features/market-flux/components/StakeControl.jsx
 *
 * @description
 * Bottom stake selector: minus, amount, plus, and the risk/reward tagline.
 * When the player is out of funds the tagline becomes a reset button.
 */

import { Minus, Plus } from 'lucide-react'

/**
 * @param {object} props
 * @param {number} props.stake
 * @param {boolean} props.canDecrease
 * @param {boolean} props.canIncrease
 * @param {() => void} props.onDecrease
 * @param {() => void} props.onIncrease
 * @param {boolean} props.isBroke Balance is below the minimum stake.
 * @param {() => void} props.onReset
 * @returns {JSX.Element}
 */
function StakeControl({
  stake,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  isBroke,
  onReset,
}) {
  return (
    <section
      aria-label="Stake"
      className="
        market-flux-glass
        relative
        mx-3
        overflow-hidden
        rounded-[20px]
        border
        border-cyan-400/30
        px-3
        py-3
      "
    >
      <div className="flex items-center justify-between">
        <StakeButton
          label="Decrease stake"
          disabled={!canDecrease}
          onClick={onDecrease}
          icon={Minus}
        />

        <div className="text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Stake
          </p>
          <p className="mt-0.5 text-[22px] font-black leading-none tabular-nums text-white">
            R {stake}
          </p>
        </div>

        <StakeButton
          label="Increase stake"
          disabled={!canIncrease}
          onClick={onIncrease}
          icon={Plus}
        />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400/50" />
        {isBroke ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-cyan-300/40 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            Out of funds. Restart demo
          </button>
        ) : (
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Higher risk
            <span className="mx-2 text-cyan-400">•</span>
            Bigger rewards
          </p>
        )}
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-400/50" />
      </div>
    </section>
  )
}

function StakeButton({ label, disabled, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        grid
        h-12
        w-12
        place-items-center
        rounded-full
        border-2
        border-cyan-400/60
        bg-slate-950/80
        text-cyan-200
        shadow-[0_0_14px_rgba(0,174,255,0.3),inset_0_0_12px_rgba(0,174,255,0.15)]
        outline-offset-2
        transition-[opacity,transform]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-cyan-300
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-35
      "
    >
      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
    </button>
  )
}

export default StakeControl
