/**
 * User Hooks
 * React Query hooks for user profile and admin user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as userService from '@/services/user.service'
import type { User, CreateUserRequest, UserRole } from '@/types/api.types'

/** Role that can perform create/edit/delete and approve actions (backend enum Users.role) */
export const ADMIN_ROLE: UserRole = 'Admin'

/**
 * Query keys for user
 */
export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  list: () => [...userKeys.all, 'list'] as const,
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
 * True when current user has Admin role (for gating create/edit/delete/approve)
 */
export const useIsAdmin = () => {
  const { data } = useCurrentUser()
  const role = data?.data?.role
  return role === ADMIN_ROLE
}

/**
 * Get all users (admin only)
 */
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => userService.getUsers(),
    staleTime: 60 * 1000,
  })
}

/**
 * Create user mutation (admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
    },
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
