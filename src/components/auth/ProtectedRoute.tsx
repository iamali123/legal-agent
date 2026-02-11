import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '@/lib/api/client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Wraps routes that require authentication.
 * Redirects to /login when there is no access token.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const token = getAccessToken()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
