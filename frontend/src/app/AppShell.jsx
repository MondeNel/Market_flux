/**
 * @file src/app/AppShell.jsx
 *
 * @description
 * Global application shell for Market Flux.
 *
 * - Establishes the mobile-first game viewport.
 * - Renders the application background.
 * - Provides the visual environment behind the HUD.
 */

function AppShell({ children }) {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-[#02060c] text-white">
      {/* Application environment */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.png')" }}
      />

      {/* Dark atmospheric overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[rgba(0,4,10,0.28)]"
      />

      {/* Game content */}
      <div className="relative z-10 mx-auto min-h-dvh w-full max-w-[480px]">
        {children}
      </div>
    </main>
  )
}

export default AppShell
