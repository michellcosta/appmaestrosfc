import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter'
import { ConvexClientProvider } from './ConvexProvider'
import './index.css'

// Sentry desabilitado temporariamente para evitar tela branca
// import { initSentry } from './config/sentry'
// initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ConvexClientProvider>
        <AppRouter />
      </ConvexClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)