/**
 * User Service
 * API functions for user profile endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
} from '@/types/api.types'
import type {
  User,
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
