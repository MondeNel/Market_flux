/**
 * @file src/features/market-flux/components/MarketSelector.jsx
 *
 * @description
 * Physical liquid-glass market selector for Market Flux.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * The selector is treated as an instrument mounted into the game machine.
 *
 * - Transparent liquid-glass body
 * - Deep black mechanical depth
 * - Cyan structural illumination
 * - Metallic/specular highlights
 * - Physical coin badge
 * - Recessed selector control
 * - Compact instrument tray dropdown
 *
 * FUNCTION
 * ---------------------------------------------------------------------------
 * - Supports keyboard navigation
 * - Supports Escape to close
 * - Closes when clicking outside
 * - Locks while a round is active
 * - Returns focus after keyboard selection
 *
 * API
 * ---------------------------------------------------------------------------
 * markets   -> available markets
 * selected  -> currently selected market
 * onSelect  -> market selection callback
 * disabled  -> prevents changing markets during a round
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import {
  Check,
  ChevronDown,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Coin badge                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Physical market coin.
 *
 * @param {object} props
 * @param {object} props.market
 * @returns {JSX.Element}
 */
export function CoinBadge({ market }) {
  return (
    <span
      aria-hidden="true"
      className="
        relative
        grid
        h-[25px]
        w-[25px]
        shrink-0
        place-items-center
        overflow-hidden
        rounded-full
        border
        border-white/20
        shadow-[0_3px_7px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.45),0_0_8px_rgba(255,255,255,0.08)]
      "
      style={{
        backgroundColor: market.color,
        color: market.glyphColor,
      }}
    >
      {/* Upper glass reflection */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-[4px]
          top-[2px]
          h-[35%]
          rounded-full
          bg-white/35
          blur-[1px]
        "
      />

      {/* Inner metallic highlight */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-[2px]
          rounded-full
          border
          border-white/10
        "
      />

      <span
        className="
          relative
          z-10
          text-[12px]
          font-black
          leading-none
        "
      >
        {market.glyph}
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Market selector                                                            */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {object[]} props.markets
 * @param {object} props.selected
 * @param {(marketId: string) => void} props.onSelect
 * @param {boolean} props.disabled
 * @returns {JSX.Element}
 */
function MarketSelector({
  markets,
  selected,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false)

  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const menuId = useId()

  const isOpen =
    open &&
    !disabled

  /* ------------------------------------------------------------------------ */
  /* Lock selector during a round                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (disabled) {
      setOpen(false)
    }
  }, [disabled])

  /* ------------------------------------------------------------------------ */
  /* Outside click + Escape                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (
        !rootRef.current?.contains(
          event.target,
        )
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    )

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector(
          '[aria-selected="true"]',
        )
        ?.focus()
    })

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [isOpen])

  /* ------------------------------------------------------------------------ */
  /* Keyboard navigation                                                      */
  /* ------------------------------------------------------------------------ */

  const handleMenuKeyDown = (event) => {
    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp'
    ) {
      return
    }

    event.preventDefault()

    const options = [
      ...(
        menuRef.current
          ?.querySelectorAll(
            '[role="option"]',
          ) ?? []
      ),
    ]

    if (!options.length) {
      return
    }

    const current =
      options.indexOf(
        document.activeElement,
      )

    const step =
      event.key === 'ArrowDown'
        ? 1
        : -1

    const next =
      (
        current +
        step +
        options.length
      ) %
      options.length

    options[next]?.focus()
  }

  /* ------------------------------------------------------------------------ */
  /* Select market                                                            */
  /* ------------------------------------------------------------------------ */

  const choose = (
    marketId,
    event,
  ) => {
    onSelect(marketId)
    setOpen(false)

    if (event.detail === 0) {
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className="
        relative
        mx-auto
        w-fit
      "
    >
      {/* ================================================================== */}
      {/* SELECTOR BODY                                                       */}
      {/* ================================================================== */}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={
          isOpen
            ? menuId
            : undefined
        }
        aria-label={
          `Market: ${selected.name} ${selected.pair}`
        }
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        className="
          group
          relative
          flex
          h-[43px]
          min-w-[151px]
          items-center
          gap-2
          overflow-hidden
          rounded-[14px]
          border
          border-cyan-300/20
          bg-black/35
          px-1.5
          pr-2
          text-left
          shadow-[0_7px_15px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-7px_12px_rgba(0,0,0,0.35)]
          backdrop-blur-md
          outline-offset-2
          transition-[border-color,box-shadow,transform,background-color]
          hover:border-cyan-300/40
          hover:bg-black/40
          hover:shadow-[0_9px_18px_rgba(0,0,0,0.52),0_0_14px_rgba(0,191,255,0.10),inset_0_1px_0_rgba(255,255,255,0.14)]
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-cyan-300
          active:translate-y-px
          active:shadow-[0_4px_9px_rgba(0,0,0,0.50),inset_0_2px_5px_rgba(0,0,0,0.40)]
          disabled:cursor-not-allowed
          disabled:opacity-45
        "
      >
        {/* -------------------------------------------------------------- */}
        {/* Glass top reflection                                           */}
        {/* -------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[15%]
            right-[15%]
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/25
            to-transparent
          "
        />

        {/* -------------------------------------------------------------- */}
        {/* Internal blue atmosphere                                       */}
        {/* -------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[20%]
            top-1/2
            h-8
            w-16
            -translate-y-1/2
            rounded-full
            bg-cyan-400/[0.035]
            blur-xl
          "
        />

        {/* -------------------------------------------------------------- */}
        {/* Mechanical left rail                                           */}
        {/* -------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[7px]
            left-2
            h-px
            w-7
            bg-cyan-400/65
            shadow-[0_0_5px_rgba(0,191,255,0.45)]
          "
        />

        {/* -------------------------------------------------------------- */}
        {/* Coin                                                            */}
        {/* -------------------------------------------------------------- */}

        <CoinBadge
          market={selected}
        />

        {/* -------------------------------------------------------------- */}
        {/* Market information                                              */}
        {/* -------------------------------------------------------------- */}

        <span
          className="
            relative
            min-w-0
            flex-1
            leading-none
          "
        >
          <span
            className="
              block
              truncate
              text-[10px]
              font-black
              uppercase
              tracking-[0.04em]
              text-white
            "
          >
            {selected.name}
          </span>

          <span
            className="
              mt-1
              block
              truncate
              text-[7px]
              font-bold
              tracking-[0.12em]
              text-white/40
            "
          >
            {selected.pair}
          </span>
        </span>

        {/* -------------------------------------------------------------- */}
        {/* Mechanical selector button                                     */}
        {/* -------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            relative
            grid
            h-6
            w-6
            shrink-0
            place-items-center
            rounded-[8px]
            border
            border-cyan-300/15
            bg-black/25
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_-2px_4px_rgba(0,0,0,0.35)]
          "
        >
          <span
            className="
              absolute
              left-1/2
              top-0
              h-px
              w-2
              -translate-x-1/2
              bg-white/20
            "
          />

          <ChevronDown
            className={`
              relative
              h-3
              w-3
              text-cyan-300
              transition-transform
              duration-200
              motion-reduce:transition-none
              ${
                isOpen
                  ? 'rotate-180'
                  : ''
              }
            `}
            strokeWidth={2.5}
          />
        </span>

        {/* -------------------------------------------------------------- */}
        {/* Bottom cyan structural edge                                    */}
        {/* -------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-[30%]
            right-[30%]
            h-px
            bg-cyan-400/30
          "
        />
      </button>

      {/* ================================================================== */}
      {/* MARKET INSTRUMENT TRAY                                              */}
      {/* ================================================================== */}

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label="Choose a market"
          onKeyDown={handleMenuKeyDown}
          className="
            absolute
            left-1/2
            top-full
            z-[100]
            mt-2
            w-[218px]
            -translate-x-1/2
            overflow-hidden
            rounded-[16px]
            border
            border-cyan-300/20
            bg-black/70
            p-1.5
            shadow-[0_18px_35px_rgba(0,0,0,0.68),0_0_22px_rgba(0,191,255,0.12),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-10px_20px_rgba(0,0,0,0.30)]
            backdrop-blur-xl
          "
        >
          {/* ------------------------------------------------------------ */}
          {/* Tray top rail                                                 */}
          {/* ------------------------------------------------------------ */}

          <div
            aria-hidden="true"
            className="
              flex
              items-center
              gap-2
              px-2
              pb-1.5
              pt-1
            "
          >
            <span
              className="
                h-px
                w-6
                bg-cyan-400/55
                shadow-[0_0_5px_rgba(0,191,255,0.30)]
              "
            />

            <span
              className="
                text-[7px]
                font-black
                uppercase
                tracking-[0.25em]
                text-white/35
              "
            >
              Market
            </span>

            <span
              className="
                h-px
                flex-1
                bg-gradient-to-r
                from-cyan-400/20
                to-transparent
              "
            />
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Options                                                       */}
          {/* ------------------------------------------------------------ */}

          <div className="space-y-1">
            {markets.map((market) => {
              const isSelected =
                market.id ===
                selected.id

              return (
                <button
                  key={market.id}
                  type="button"
                  role="option"
                  aria-selected={
                    isSelected
                  }
                  onClick={(event) =>
                    choose(
                      market.id,
                      event,
                    )
                  }
                  className={`
                    group
                    relative
                    flex
                    w-full
                    items-center
                    gap-2
                    overflow-hidden
                    rounded-[11px]
                    border
                    px-2
                    py-1.5
                    text-left
                    outline-none
                    transition-[background-color,border-color,transform]
                    ${
                      isSelected
                        ? 'border-cyan-300/15 bg-cyan-400/[0.07]'
                        : 'border-transparent bg-transparent'
                    }
                    hover:border-cyan-300/10
                    hover:bg-cyan-400/[0.06]
                    focus-visible:border-cyan-300/20
                    focus-visible:bg-cyan-400/[0.09]
                    active:translate-y-px
                  `}
                >
                  {/* Selected cyan rail */}

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-1.5
                        left-0
                        top-1.5
                        w-px
                        bg-cyan-300
                        shadow-[0_0_7px_rgba(0,191,255,0.8)]
                      "
                    />
                  )}

                  <CoinBadge
                    market={market}
                  />

                  <span
                    className="
                      min-w-0
                      flex-1
                      leading-none
                    "
                  >
                    <span
                      className="
                        block
                        truncate
                        text-[10px]
                        font-black
                        text-white
                      "
                    >
                      {market.name}
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        truncate
                        text-[7px]
                        font-bold
                        tracking-[0.1em]
                        text-white/35
                      "
                    >
                      {market.pair}
                    </span>
                  </span>

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="
                        relative
                        grid
                        h-5
                        w-5
                        shrink-0
                        place-items-center
                        rounded-[7px]
                        border
                        border-cyan-300/20
                        bg-cyan-400/[0.06]
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]
                      "
                    >
                      <Check
                        className="
                          h-3
                          w-3
                          text-cyan-300
                          drop-shadow-[0_0_4px_rgba(0,191,255,0.55)]
                        "
                        strokeWidth={3}
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Bottom mechanical rail                                        */}
          {/* ------------------------------------------------------------ */}

          <div
            aria-hidden="true"
            className="
              mt-1.5
              flex
              items-center
              gap-1.5
              px-2
              pb-1
            "
          >
            <span
              className="
                h-px
                w-7
                bg-cyan-400/45
              "
            />

            <span
              className="
                h-[2px]
                w-1
                rounded-full
                bg-cyan-300/65
                shadow-[0_0_5px_rgba(0,191,255,0.45)]
              "
            />

            <span
              className="
                h-px
                flex-1
                bg-cyan-400/10
              "
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketSelector