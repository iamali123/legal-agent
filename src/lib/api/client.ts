/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'

// Token storage keys
const TOKEN_STORAGE_KEY = 'legal_portal_access_token'
const REFRESH_TOKEN_STORAGE_KEY = 'legal_portal_refresh_token'

/**
 * Get access token from storage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Set access token in storage
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Get refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Set refresh token in storage
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
}

/**
 * Clear all tokens from storage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Create axios instance with default config
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
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
              setAccessToken(accessToken)
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
