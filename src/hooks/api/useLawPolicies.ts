/**
 * Law & Policy Hooks
 * React Query hooks for laws and policies (read-only)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as lawPolicyService from '@/services/law-policy.service'
import type {
  LawPolicyListParams,
} from '@/types/law-policy.types'

/**
 * Query keys for laws and policies
 */
export const lawPolicyKeys = {
  all: ['laws-policies'] as const,
  lists: () => [...lawPolicyKeys.all, 'list'] as const,
  list: (params?: LawPolicyListParams) =>
    [...lawPolicyKeys.lists(), params] as const,
  details: () => [...lawPolicyKeys.all, 'detail'] as const,
  detail: (id: string) => [...lawPolicyKeys.details(), id] as const,
  stats: () => [...lawPolicyKeys.all, 'stats'] as const,
}

/**
 * Get list of laws and policies
 */
export const useLawsPolicies = (params?: LawPolicyListParams) => {
  return useQuery({
    queryKey: lawPolicyKeys.list(params),
    queryFn: () => lawPolicyService.getLawsPolicies(params),
    staleTime: 10 * 60 * 1000, // 10 minutes (read-only data)
  })
}

/**
 * Get laws and policies statistics
 */
export const useLawsPoliciesStats = () => {
  return useQuery({
    queryKey: lawPolicyKeys.stats(),
    queryFn: () => lawPolicyService.getLawsPoliciesStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get single law/policy
 */
export const useLawPolicy = (id: string) => {
  return useQuery({
    queryKey: lawPolicyKeys.detail(id),
    queryFn: () => lawPolicyService.getLawPolicy(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Create law/policy
 */
export const useCreateLawPolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: lawPolicyService.createLawPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lawPolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: lawPolicyKeys.stats() })
    },
  })
}
