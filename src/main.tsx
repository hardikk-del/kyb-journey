import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ToastViewport, TooltipProvider } from './components'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <RouterProvider router={router} />
      <ToastViewport />
    </TooltipProvider>
  </StrictMode>,
)
