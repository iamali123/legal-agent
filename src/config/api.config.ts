/**
 * API Configuration
 * Centralized configuration for API base URL and other settings
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.legal-portal.com/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
} as const

export const getApiBaseURL = () => API_CONFIG.baseURL

export const setApiBaseURL = (url: string) => {
  // This can be used to dynamically change the base URL if needed
  // For now, we'll use environment variables
  console.warn('setApiBaseURL: Use VITE_API_BASE_URL environment variable instead')
}
