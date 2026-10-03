/**
 * @file src/components/layout/BottomNav.jsx
 *
 * @description
 * Market Flux mobile-first bottom navigation.
 *
 * DESIGN
 * ---------------------------------------------------------------------------
 * The navigation follows the Market Flux physical HUD language:
 *
 * - Deep black structural housing
 * - Transparent liquid-glass surface
 * - Metallic white specular highlights
 * - Subtle cyan atmospheric glow
 * - Recessed physical active module
 * - Muted monochrome inactive icons
 * - Compact mobile-first proportions
 *
 * The navigation intentionally avoids a conventional solid card appearance.
 */

import { motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  Home as HomeIcon,
  Swords,
  Trophy,
  Wallet,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  {
    key: 'market-flux',
    label: 'Market Flux',
    icon: Activity,
    to: '/',
  },
  {
    key: 'battles',
    label: 'Battles',
    icon: Swords,
    to: '/battles',
  },
  {
    key: 'home',
    label: 'Home',
    icon: HomeIcon,
    to: '/home',
  },
  {
    key: 'leaderboard',
    label: 'Ranks',
    icon: Trophy,
    to: '/leaderboard',
  },
  {
    key: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    to: '/wallet',
  },
]

const BLUE = '#20BFFF'
const BLUE_BRIGHT = '#73E4FF'

const triggerHaptic = (duration = 10) => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    navigator.vibrate(duration)
  }
}

function activeKeyFromPath(pathname) {
  const match = NAV_ITEMS.find((item) =>
    item.to === '/'
      ? pathname === '/'
      : pathname.startsWith(item.to)
  )

  return match?.key ?? 'home'
}

function NavButton({
  item,
  isActive,
  badgeCount,
  reducedMotion,
  onPress,
}) {
  const Icon = item.icon
  const showBadge = badgeCount > 0 && !isActive

  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-current={isActive ? 'page' : undefined}
      aria-label={
        showBadge
          ? `${item.label}, ${badgeCount} pending`
          : item.label
      }
      whileTap={
        reducedMotion
          ? undefined
          : { scale: 0.92 }
      }
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 24,
      }}
      className="
        group
        relative
        flex
        min-w-0
        flex-1
        flex-col
        items-center
        justify-center
        rounded-xl
        py-1.5
        outline-none
        focus-visible:ring-1
        focus-visible:ring-white/40
      "
    >
      {/* -----------------------------------------------------------------
       * Active physical module
       * ----------------------------------------------------------------- */}

      {isActive && (
        <motion.div
          layoutId={
            reducedMotion
              ? undefined
              : 'marketFluxNavActive'
          }
          initial={
            reducedMotion
              ? { opacity: 0 }
              : false
          }
          animate={{
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 30,
            mass: 0.8,
          }}
          className="
            absolute
            inset-0.5
            overflow-hidden
            rounded-xl
          "
          style={{
            background: `
              linear-gradient(
                160deg,
                rgba(115,228,255,0.17) 0%,
                rgba(32,191,255,0.07) 42%,
                rgba(2,6,9,0.82) 100%
              )
            `,

            border:
              '1px solid rgba(32,191,255,0.30)',

            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.22),
              inset 0 -5px 10px rgba(0,0,0,0.76),
              0 0 12px rgba(32,191,255,0.15)
            `,

            backdropFilter:
              'blur(8px) saturate(150%)',

            WebkitBackdropFilter:
              'blur(8px) saturate(150%)',
          }}
        >
          {/* Active metallic reflection */}

          <div
            aria-hidden="true"
            className="
              absolute
              left-1/2
              top-1
              h-px
              w-10
              -translate-x-1/2
            "
            style={{
              background: `
                linear-gradient(
                  90deg,
                  transparent,
                  ${BLUE_BRIGHT},
                  transparent
                )
              `,
            }}
          />

          {/* Active glass highlight */}

          <div
            aria-hidden="true"
            className="
              absolute
              left-1/2
              top-1
              h-1.5
              w-7
              -translate-x-1/2
              rounded-full
              bg-white/30
              blur-[3px]
            "
          />

          {/* Lower mechanical recess */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-3
              bottom-0
              h-px
            "
            style={{
              background: `
                linear-gradient(
                  90deg,
                  transparent,
                  rgba(0,200,255,0.38),
                  transparent
                )
              `,
            }}
          />
        </motion.div>
      )}

      {/* -----------------------------------------------------------------
       * Icon
       * ----------------------------------------------------------------- */}

      <div className="relative z-10">
        <Icon
          size={17}
          strokeWidth={isActive ? 2.3 : 1.8}
          style={{
            color: isActive
              ? BLUE_BRIGHT
              : 'rgba(255,255,255,0.42)',

            filter: isActive
              ? `drop-shadow(0 0 5px ${BLUE}AA)`
              : 'none',

            transition:
              'color 180ms ease, filter 180ms ease',
          }}
        />

        {/* -----------------------------------------------------------------
         * Notification badge
         * ----------------------------------------------------------------- */}

        {showBadge && (
          <span
            className="
              absolute
              -right-2
              -top-1.5
              flex
              h-[13px]
              min-w-[13px]
              items-center
              justify-center
              rounded-full
              px-1
              text-[8px]
              font-black
              leading-none
            "
            style={{
              color: '#020507',
              background: '#FF4D5E',
              boxShadow:
                '0 0 8px rgba(255,77,94,0.62)',
            }}
          >
            {badgeCount > 9
              ? '9+'
              : badgeCount}
          </span>
        )}
      </div>

      {/* -----------------------------------------------------------------
       * Label
       * ----------------------------------------------------------------- */}

      <span
        className="
          relative
          z-10
          mt-0.5
          max-w-full
          truncate
          px-0.5
          text-[8px]
          font-bold
          tracking-[0.01em]
          transition-colors
          duration-200
        "
        style={{
          color: isActive
            ? '#DDF8FF'
            : 'rgba(255,255,255,0.38)',

          textShadow: isActive
            ? `0 0 8px ${BLUE}55`
            : 'none',
        }}
      >
        {item.label}
      </span>
    </motion.button>
  )
}

export default function BottomNav({ badges = {} }) {
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()

  const activeKey = activeKeyFromPath(location.pathname)

  const handlePress = (item) => {
    if (item.key !== activeKey) {
      triggerHaptic()
    }

    navigate(item.to)
  }

  return (
    <nav
      className="
        relative
        z-50
        w-full
        shrink-0
      "
      aria-label="Primary"
    >
      {/* =================================================================
       * OUTER PHYSICAL HOUSING
       * ================================================================= */}

      <div
        className="
          relative
          w-full
          overflow-hidden
        "
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(255,255,255,0.055) 0%,
              rgba(9,11,13,0.94) 11%,
              rgba(1,3,5,0.985) 100%
            )
          `,

          borderTop:
            '1px solid rgba(255,255,255,0.12)',

          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 -8px 24px rgba(0,0,0,0.72),
            0 -1px 0 rgba(0,200,255,0.035)
          `,

          paddingBottom:
            'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* =============================================================
         * TOP METALLIC SPECULAR
         * ============================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
          "
          style={{
            background: `
              linear-gradient(
                90deg,
                transparent 0%,
                rgba(255,255,255,0.12) 18%,
                rgba(255,255,255,0.48) 50%,
                rgba(255,255,255,0.12) 82%,
                transparent 100%
              )
            `,
          }}
        />

        {/* =============================================================
         * CYAN ATMOSPHERIC GLOW
         * ============================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -top-10
            left-1/2
            h-20
            w-48
            -translate-x-1/2
            rounded-full
            blur-3xl
          "
          style={{
            background: `${BLUE}0D`,
          }}
        />

        {/* =============================================================
         * NAV CONTENT
         * ============================================================= */}

        <div
          className="
            relative
            mx-auto
            flex
            w-full
            max-w-[480px]
            items-center
            justify-between
            gap-1
            px-2
            py-1.5
          "
        >
          {NAV_ITEMS.map((item) => {
            const badgeCount =
              Number(badges?.[item.key]) || 0

            return (
              <NavButton
                key={item.key}
                item={item}
                isActive={
                  item.key === activeKey
                }
                badgeCount={badgeCount}
                reducedMotion={reducedMotion}
                onPress={() =>
                  handlePress(item)
                }
              />
            )
          })}
        </div>

        {/* =============================================================
         * BOTTOM STRUCTURAL SHADOW
         * ============================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-px
          "
          style={{
            background:
              'rgba(0,0,0,0.92)',
          }}
        />
      </div>
    </nav>
  )
}