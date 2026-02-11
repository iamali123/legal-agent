/**
 * Authentication Hooks
 * React Query hooks for authentication
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authService from '@/services/auth.service'
import { clearTokens } from '@/lib/api/client'
import type {
  LoginRequest,
  UAEPassLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from '@/types/api.types'

/**
 * Login mutation hook
 */
export const useLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      navigate('/')
    },
  })
}

/**
 * UAE Pass login mutation hook
 */
export const useUAEPassLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: UAEPassLoginRequest) =>
      authService.uaePassLogin(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      navigate('/')
    },
  })
}

/**
 * Refresh token mutation hook
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (request: RefreshTokenRequest) =>
      authService.refreshToken(request),
  })
}

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: LogoutRequest) => authService.logout(request),
    onSuccess: () => {
      clearTokens()
      queryClient.clear()
      navigate('/login')
    },
  })
}
