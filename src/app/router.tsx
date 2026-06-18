import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from './Home'
import { KitchenSink } from '@/features/kitchen-sink/KitchenSink'
import { ConsolePlaceholder } from './placeholders/ConsolePlaceholder'
import { OnboardingPlaceholder } from './placeholders/OnboardingPlaceholder'

/**
 * Routes. Feature surfaces (onboarding capture, the console screens) arrive in
 * later phases; for now they render honest "coming in a later phase"
 * placeholders inside their real shells so the shells are reviewable.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/kitchen-sink', element: <KitchenSink /> },
  { path: '/onboarding', element: <OnboardingPlaceholder /> },
  {
    path: '/console',
    children: [
      { index: true, element: <ConsolePlaceholder page="Pipeline" /> },
      { path: 'applications', element: <ConsolePlaceholder page="Applications" /> },
      { path: 'monitoring', element: <ConsolePlaceholder page="Monitoring" /> },
      { path: 'admin', element: <ConsolePlaceholder page="Admin" /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
