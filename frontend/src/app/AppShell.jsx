/**
 * @file src/app/AppShell.jsx
 *
 * @description
 * Global application shell for Market Flux.
 *
 * RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 * - Establishes the mobile-first game viewport.
 * - Renders the Market Flux background environment.
 * - Preserves the supplied background artwork.
 * - Adds subtle atmospheric depth behind the HUD.
 * - Constrains the application to the mobile-first content width.
 * - Gives the current screen a full-height flex column to lay out in.
 * - Provides the persistent bottom navigation.
 *
 * LAYER ORDER (back to front)
 * ---------------------------------------------------------------------------
 *   1. Background artwork          fixed
 *   2. Atmospheric darkening       fixed
 *   3. Edge vignette               fixed
 *   4. Application viewport        z-10   (the current screen)
 *   5. Bottom navigation           z-100  (always above the screen)
 *
 * HEIGHT CHAIN
 * ---------------------------------------------------------------------------
 * The viewport wrapper and the content wrapper are both flex columns, so a
 * screen whose root uses `flex-1` fills the space above the navigation.
 * Without this, `flex-1` on the screen root has no flex parent and does
 * nothing, leaving spare height as dead space on tall phones.
 *
 * The content wrapper reserves room for the fixed navigation plus the
 * device safe area (home-indicator inset on notched iPhones). The safe-area
 * inset only resolves when the viewport meta tag includes
 * `viewport-fit=cover`.
 *
 * The root is a <div>, not <main>, because each screen owns its own <main>
 * landmark.
 */

import BottomNav from '../features/market-flux/components/layout/BottomNav'

function AppShell({ children }) {
  return (
    <div
      className="
        relative
        min-h-dvh
        w-full
        overflow-x-hidden
        bg-[#02060c]
        text-white
      "
    >
      {/* ================================================================== */}
      {/* Background environment                                             */}
      {/* ================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/background.png')",
        }}
      />

      {/* ================================================================== */}
      {/* Atmospheric depth                                                  */}
      {/* ================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          bg-black/[0.14]
        "
      />

      {/* ================================================================== */}
      {/* Edge vignette                                                       */}
      {/* ================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.24)_100%)]
        "
      />

      {/* ================================================================== */}
      {/* Application viewport                                                */}
      {/* ================================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-dvh
          w-full
          max-w-[480px]
          flex-col
        "
      >
        {/* ================================================================ */}
        {/* Application content                                              */}
        {/* ================================================================ */}

        <div
          className="
            flex
            min-h-0
            w-full
            flex-1
            flex-col
            pb-[calc(78px+env(safe-area-inset-bottom,0px))]
          "
        >
          {children}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Persistent bottom navigation                                       */}
      {/* ================================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-x-0
          bottom-0
          z-[100]
          flex
          justify-center
        "
      >
        <div
          className="
            pointer-events-auto
            w-full
            max-w-[480px]
          "
        >
          <BottomNav />
        </div>
      </div>
    </div>
  )
}

export default AppShell