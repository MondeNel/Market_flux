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
 * - Provides the persistent bottom navigation.
 *
 * The bottom navigation is fixed to the viewport so it remains visible
 * independently of the height of the current game screen.
 */

import BottomNav from '../features/market-flux/components/layout/BottomNav'

function AppShell({ children }) {
  return (
    <main
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
          min-h-dvh
          w-full
          max-w-[480px]
        "
      >
        {/* ================================================================ */}
        {/* Application content                                              */}
        {/* ================================================================ */}

        <div
          className="
            min-h-dvh
            w-full
            pb-[78px]
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
    </main>
  )
}

export default AppShell