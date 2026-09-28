/**
 * @file src/components/layouts/AppShell.jsx
 *
 * @description
 * Global visual shell for the Market Flux prototype.
 *
 * Responsibilities:
 * - Render the global background
 * - Establish the game viewport
 * - Provide mobile-first viewport sizing
 * - Keep the application visually isolated from the page
 *
 * The shell contains no game logic.
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
    <main
      className="
        relative
        min-h-[100dvh]
        w-full
        overflow-hidden
        bg-[#02060d]
        text-white
      "
    >
      {/* ================================================================
          MOBILE-FIRST BACKGROUND
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-0
          bg-[#02060d]
          bg-[url('/background.png')]
          bg-cover
          bg-center
          bg-no-repeat
          sm:bg-[length:cover]
        "
      />

      {/* ================================================================
          DARK ATMOSPHERIC LAYER
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-0
          bg-black/20
        "
      />

      {/* ================================================================
          MOBILE SAFE-AREA / GAME VIEWPORT
          ================================================================ */}

      <div
        className="
          relative
          z-10
          mx-auto
          min-h-[100dvh]
          w-full
          max-w-md
        "
      >
        {children}
      </div>
    </main>
  )
}

export default AppShell