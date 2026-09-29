import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'
import './styles/effects.css'

import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
