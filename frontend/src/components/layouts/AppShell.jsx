/**
 * @file AppShell.jsx
 *
 * @description
 * Global visual shell for the Market Flux prototype.
 *
 * Responsibilities:
 * - Render the global background
 * - Establish the game viewport
 * - Control mobile/desktop width
 * - Provide the visual layer on which game components sit
 *
 * The shell intentionally contains no game logic.
 */

/**
 * Global application shell.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Application content.
 * @returns {JSX.Element}
 */
function AppShell({ children }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#02060d] text-white">
      {/* ================================================================
          BACKGROUND
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-0
          bg-[url('/background.png')]
          bg-cover
          bg-center
          bg-no-repeat
        "
      />

      {/* ================================================================
          ATMOSPHERIC OVERLAY
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-0
          bg-black/10
        "
      />

      {/* ================================================================
          GAME VIEWPORT
          ================================================================ */}

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-md">
        {children}
      </div>
    </main>
  )
}

export default AppShell