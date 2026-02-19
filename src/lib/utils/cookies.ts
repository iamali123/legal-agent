/**
 * Cookie Utility
 * Simple cookie management for token storage
 */

const TOKEN_COOKIE_NAME = 'legal_portal_access_token'
const REFRESH_TOKEN_COOKIE_NAME = 'legal_portal_refresh_token'

/**
 * Set a cookie
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 30
): void => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

/**
 * Get a cookie value
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

/**
 * Delete a cookie
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`
}

/**
 * Set access token in cookie
 */
export const setAccessTokenCookie = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    setCookie(TOKEN_COOKIE_NAME, token, 30) // 30 days
  }
}

/**
 * Get access token from cookie
 */
export const getAccessTokenCookie = (): string | null => {
  return getCookie(TOKEN_COOKIE_NAME)
}

/**
 * Set refresh token in cookie
 */
export const setRefreshTokenCookie = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    setCookie(REFRESH_TOKEN_COOKIE_NAME, token, 30) // 30 days
  }
}

/**
 * Get refresh token from cookie
 */
export const getRefreshTokenCookie = (): string | null => {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME)
}

/**
 * Clear all token cookies
 */
export const clearTokenCookies = (): void => {
  deleteCookie(TOKEN_COOKIE_NAME)
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME)
}
