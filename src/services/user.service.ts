/**
 * User Service
 * API functions for user profile and admin user management
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  User,
  UserListItem,
  CreateUserRequest,
} from '@/types/api.types'

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<
  ApiSuccessResponse<User>
> => {
  const response = await apiClient.get<ApiSuccessResponse<User>>(
    '/users/me'
  )
  return response.data
}

/**
 * Get all users (admin)
 */
export const getUsers = async (): Promise<
  ApiSuccessResponse<UserListItem[]>
> => {
  const response = await apiClient.get<ApiSuccessResponse<UserListItem[]>>(
    '/users'
  )
  return response.data
}

/**
 * Create user (admin)
 */
export const createUser = async (
  data: CreateUserRequest
): Promise<ApiSuccessResponse<UserListItem>> => {
  const response = await apiClient.post<ApiSuccessResponse<UserListItem>>(
    '/users',
    data
  )
  return response.data
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  data: Partial<Pick<User, 'name' | 'avatar'>>
): Promise<ApiSuccessResponse<User>> => {
  const response = await apiClient.put<ApiSuccessResponse<User>>(
    '/users/me',
    data
  )
  return response.data
}
