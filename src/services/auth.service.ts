/**
 * Authentication Service
 * API functions for authentication endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  UAEPassLoginRequest,
} from '@/types/api.types'
import { setAccessToken, setRefreshToken } from '@/lib/api/client'

/**
 * Login with email and password
 */
export const login = async (
  credentials: LoginRequest
): Promise<ApiSuccessResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
    '/auth/login',
    credentials
  )
  
  // Store tokens
  if (response.data.success && response.data.data) {
    setAccessToken(response.data.data.accessToken)
    setRefreshToken(response.data.data.refreshToken)
  }
  
  return response.data
}

/**
 * Login with UAE Pass
 */
export const uaePassLogin = async (
  credentials: UAEPassLoginRequest
): Promise<ApiSuccessResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
    '/auth/uae-pass',
    credentials
  )
  
  // Store tokens
  if (response.data.success && response.data.data) {
    setAccessToken(response.data.data.accessToken)
    setRefreshToken(response.data.data.refreshToken)
  }
  
  return response.data
}

/**
 * Refresh access token
 */
export const refreshToken = async (
  request: RefreshTokenRequest
): Promise<ApiSuccessResponse<{ accessToken: string; expiresIn: number }>> => {
  const response = await apiClient.post<
    ApiSuccessResponse<{ accessToken: string; expiresIn: number }>
  >('/auth/refresh-token', request)
  
  // Update access token
  if (response.data.success && response.data.data) {
    setAccessToken(response.data.data.accessToken)
  }
  
  return response.data
}

/**
 * Logout user
 */
export const logout = async (
  request: LogoutRequest
): Promise<ApiSuccessResponse<null>> => {
  const response = await apiClient.post<ApiSuccessResponse<null>>(
    '/auth/logout',
    request
  )
  return response.data
}
