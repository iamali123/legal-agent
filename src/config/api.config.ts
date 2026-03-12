/**
 * API Configuration
 * Centralized configuration for API base URL and other settings
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://139.59.237.197:8080/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
} as const

/** UAE Pass: authorization URL to redirect users for sign-in. Callback returns to /auth/callback?uaePassId=... */
export const UAE_PASS_AUTH_URL =
  import.meta.env.VITE_UAE_PASS_AUTH_URL || ''

export const getApiBaseURL = () => API_CONFIG.baseURL

export const setApiBaseURL = (_url: string) => {
  // This can be used to dynamically change the base URL if needed
  // For now, we'll use environment variables
  console.warn('setApiBaseURL: Use VITE_API_BASE_URL environment variable instead')
}
