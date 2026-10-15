/**
 * @file src/app/AppShell.jsx
 *
 * @description
 * Viewport-height application shell for Market Flux.
 * AppShell alone reserves space for the fixed bottom navigation.
 * Child screens fill the remaining area with h-full/min-h-0.
 */

import BottomNav from '../features/market-flux/components/layout/BottomNav'

const NAV_HEIGHT = 78

function AppShell({ children }) {
  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-[#02060c] text-white"
      style={{ '--market-flux-nav-height': `${NAV_HEIGHT}px` }}
    >
      {/* Supplied background artwork — do not replace with gradients. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.png')" }}
      />

      {/* Subtle atmosphere, above the artwork and below the HUD. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-black/[0.14]" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.24)_100%)]"
      />

      {/* Exactly one reservation for the fixed navigation. */}
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[480px] flex-col">
        <div
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
          style={{
            paddingBottom: 'calc(var(--market-flux-nav-height) + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center">
        <div className="pointer-events-auto w-full max-w-[480px]">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}

export default AppShell
