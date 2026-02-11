/**
 * User Hooks
 * React Query hooks for user profile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as userService from '@/services/user.service'
import type { User } from '@/types/api.types'

/**
 * Query keys for user
 */
export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
}

/**
 * Get current user profile
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Update user profile mutation
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Pick<User, 'name' | 'avatar'>>) =>
      userService.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
    },
  })
}
