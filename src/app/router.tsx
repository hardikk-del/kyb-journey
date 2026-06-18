import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from './Home'
import { KitchenSink } from '@/features/kitchen-sink/KitchenSink'
import { ConsolePlaceholder } from './placeholders/ConsolePlaceholder'
import { OnboardingLayout } from '@/features/onboarding/flow'
import { StartStep } from '@/features/onboarding/steps/StartStep'
import { PermissionsStep } from '@/features/onboarding/steps/PermissionsStep'
import { BusinessStep } from '@/features/onboarding/steps/BusinessStep'
import { PeopleStep } from '@/features/onboarding/steps/PeopleStep'
import { DocumentsStep } from '@/features/onboarding/steps/DocumentsStep'
import { IdentityStep } from '@/features/onboarding/steps/IdentityStep'
import { FinancialsStep } from '@/features/onboarding/steps/FinancialsStep'
import { PremisesStep } from '@/features/onboarding/steps/PremisesStep'
import { ReviewStep } from '@/features/onboarding/steps/ReviewStep'
import { VerifyHandoff } from '@/features/onboarding/steps/VerifyHandoff'

/**
 * Routes. The onboarding capture flow (Phase 3) is fully wired below; the
 * console surfaces arrive in Phase 6 and render honest placeholders meanwhile.
 * Per-step routes keep the flow deep-linkable and the browser back button
 * working; captured data survives navigation via the onboarding store.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/kitchen-sink', element: <KitchenSink /> },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <StartStep /> },
      { path: 'permissions', element: <PermissionsStep /> },
      { path: 'business', element: <BusinessStep /> },
      { path: 'people', element: <PeopleStep /> },
      { path: 'documents', element: <DocumentsStep /> },
      { path: 'identity', element: <IdentityStep /> },
      { path: 'financials', element: <FinancialsStep /> },
      { path: 'premises', element: <PremisesStep /> },
      { path: 'review', element: <ReviewStep /> },
      { path: 'verify', element: <VerifyHandoff /> },
    ],
  },
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
