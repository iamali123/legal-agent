/**
 * Authentication Hooks
 * React Query hooks for authentication
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authService from '@/services/auth.service'
import { clearTokens, getRefreshToken } from '@/lib/api/client'
import type {
  LoginRequest,
  UAEPassLoginRequest,
  RefreshTokenRequest,
} from '@/types/api.types'

/**
 * Extended login request with rememberMe
 */
export interface LoginRequestWithRememberMe extends LoginRequest {
  rememberMe?: boolean
}

/**
 * Extended UAE Pass login request with rememberMe
 */
export interface UAEPassLoginRequestWithRememberMe extends UAEPassLoginRequest {
  rememberMe?: boolean
}

/**
 * Login mutation hook
 */
export const useLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequestWithRememberMe) => {
      const { rememberMe, ...loginData } = credentials
      return authService.login(loginData, rememberMe ?? false)
    },
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
    mutationFn: (credentials: UAEPassLoginRequestWithRememberMe) => {
      const { rememberMe, ...loginData } = credentials
      return authService.uaePassLogin(loginData, rememberMe ?? false)
    },
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
 * Logout mutation hook.
 * Calls logout API when refresh token exists; always clears local tokens and redirects to login (onSettled).
 */
export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        return authService.logout({ refreshToken })
      }
      return { success: true as const, message: 'Logged out', data: null }
    },
    onSettled: () => {
      clearTokens()
      queryClient.clear()
      navigate('/login')
    },
  })
}
