/**
 * @file App.jsx
 *
 * @description
 * Root component for the Market Flux prototype.
 */

import AppShell from './components/layouts/AppShell'

/**
 * Root application component.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <AppShell>
      <div className="min-h-screen w-full" />
    </AppShell>
  )
}

export default App