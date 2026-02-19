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
 * @param credentials - Login credentials
 * @param rememberMe - If true, store tokens in cookies; if false, store in localStorage
 */
export const login = async (
  credentials: LoginRequest,
  rememberMe: boolean = false
): Promise<ApiSuccessResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
    '/auth/login',
    credentials
  )
  
  // Store tokens
  if (response.data.success && response.data.data) {
    setAccessToken(response.data.data.accessToken, rememberMe)
    setRefreshToken(response.data.data.refreshToken, rememberMe)
  }
  
  return response.data
}

/**
 * Login with UAE Pass
 * @param credentials - UAE Pass credentials
 * @param rememberMe - If true, store tokens in cookies; if false, store in localStorage
 */
export const uaePassLogin = async (
  credentials: UAEPassLoginRequest,
  rememberMe: boolean = false
): Promise<ApiSuccessResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
    '/auth/uae-pass',
    credentials
  )
  
  // Store tokens
  if (response.data.success && response.data.data) {
    setAccessToken(response.data.data.accessToken, rememberMe)
    setRefreshToken(response.data.data.refreshToken, rememberMe)
  }
  
  return response.data
}

/**
 * Refresh access token
 * @param request - Refresh token request
 * @param rememberMe - If true, store tokens in cookies; if false, store in localStorage
 */
export const refreshToken = async (
  request: RefreshTokenRequest,
  rememberMe: boolean = false
): Promise<ApiSuccessResponse<{ accessToken: string; expiresIn: number }>> => {
  const response = await apiClient.post<
    ApiSuccessResponse<{ accessToken: string; expiresIn: number }>
  >('/auth/refresh-token', request)
  
  // Update access token
  if (response.data.success && response.data.data) {
    setAccessToken(response.data.data.accessToken, rememberMe)
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
