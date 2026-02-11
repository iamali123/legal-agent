import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '@/lib/api/client'

interface GuestOnlyProps {
  children: React.ReactNode
}

/**
 * Wraps routes that should only be visible when not authenticated (e.g. login).
 * Redirects to / when user already has an access token.
 */
export function GuestOnly({ children }: GuestOnlyProps) {
  const location = useLocation()
  const token = getAccessToken()

  if (token) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
