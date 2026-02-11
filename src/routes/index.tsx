import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { Dashboard } from '@/pages/Dashboard'
import { Legislations } from '@/pages/Legislations'
import { LawsPolicy } from '@/pages/LawsPolicy'
import { Contracts } from '@/pages/Contracts'
import { Agreements } from '@/pages/Agreements'
import { Approvals } from '@/pages/Approvals'
import { AILegal } from '@/pages/AILegal'
import { Login } from '@/pages/Login'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'legislations',
        element: <Legislations />,
      },
      {
        path: 'laws-policy',
        element: <LawsPolicy />,
      },
      {
        path: 'contracts',
        element: <Contracts />,
      },
      {
        path: 'agreements',
        element: <Agreements />,
      },
      {
        path: 'approvals',
        element: <Approvals />,
      },
      {
        path: 'ai-legal',
        element: <AILegal />,
      },
    ],
  },
])
