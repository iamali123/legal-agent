/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearTokenCookies,
} from '@/lib/utils/cookies'

// Export getRefreshTokenCookie for use in refresh logic
export { getRefreshTokenCookie }

// Token storage keys
const TOKEN_STORAGE_KEY = 'legal_portal_access_token'
const REFRESH_TOKEN_STORAGE_KEY = 'legal_portal_refresh_token'

/**
 * Get access token from storage (checks cookies first, then localStorage)
 */
export const getAccessToken = (): string | null => {
  // Check cookies first (remember me)
  const cookieToken = getAccessTokenCookie()
  if (cookieToken) return cookieToken
  
  // Fallback to localStorage (session)
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Set access token in storage
 * @param token - The access token
 * @param rememberMe - If true, store in cookies; if false, store in localStorage
 */
export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    // Store in cookies for persistent storage
    setAccessTokenCookie(token, true)
    // Also store in localStorage as backup
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    // Store only in localStorage for session storage
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    // Clear cookies if they exist
    clearTokenCookies()
  }
}

/**
 * Get refresh token from storage (checks cookies first, then localStorage)
 */
export const getRefreshToken = (): string | null => {
  // Check cookies first (remember me)
  const cookieToken = getRefreshTokenCookie()
  if (cookieToken) return cookieToken
  
  // Fallback to localStorage (session)
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Set refresh token in storage
 * @param token - The refresh token
 * @param rememberMe - If true, store in cookies; if false, store in localStorage
 */
export const setRefreshToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    // Store in cookies for persistent storage
    setRefreshTokenCookie(token, true)
    // Also store in localStorage as backup
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
  } else {
    // Store only in localStorage for session storage
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
    // Clear cookies if they exist
    clearTokenCookies()
  }
}

/**
 * Clear all tokens from storage (both cookies and localStorage)
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  clearTokenCookies()
}

/**
 * Create axios instance with default config
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
    // Accept 304 Not Modified as valid (browser cache, but server sends data anyway)
    validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
  })

  // Request interceptor - Add auth token to requests
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - Handle errors and token refresh
  client.interceptors.response.use(
    (response) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // Handle 401 Unauthorized - Token expired or invalid
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const refreshToken = getRefreshToken()
        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh-token`, {
              refreshToken,
            })

            const { accessToken } = response.data.data
            if (accessToken) {
              // Determine if we should use rememberMe based on where refresh token was stored
              const rememberMe = !!getRefreshTokenCookie()
              setAccessToken(accessToken, rememberMe)
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
              }
              return client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        } else {
          // No refresh token - redirect to login
          clearTokens()
          window.location.href = '/login'
        }
      }

      return Promise.reject(error)
    }
  )

  return client
}

// Export the configured axios instance
export const apiClient = createApiClient()

// Export axios for direct use if needed
export { axios }
