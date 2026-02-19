/**
 * API Types
 * Shared types and interfaces for API requests and responses
 */

/**
 * Standard API Success Response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data: T
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Pagination response
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

/**
 * User role (backend enum Users.role)
 */
export type UserRole = 'Admin' | 'Legal Officer' | 'Reviewer'

/**
 * User type
 */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string | null
  department?: string | null
  createdAt: string
  lastLogin?: string | null
}

/**
 * Authentication response
 */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * UAE Pass login request
 * POST /auth/uae-pass body
 */
export interface UAEPassLoginRequest {
  uaePassId: string
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Logout request
 */
export interface LogoutRequest {
  refreshToken: string
}

/**
 * User list item (GET /users)
 */
export interface UserListItem {
  id: string
  name: string
  email: string
  role: UserRole
  department: string | null
  avatar: string | null
  uaePassId: string | null
  lastLogin: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/**
 * Create user request (POST /users)
 */
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: UserRole
  department: string
}
