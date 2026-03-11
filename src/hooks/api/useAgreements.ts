/**
 * Agreement Hooks
 * React Query hooks for agreements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as agreementService from '@/services/agreement.service'
import type {
  AgreementListParams,
  CreateAgreementRequest,
  UpdateAgreementRequest,
} from '@/types/agreement.types'

/**
 * Query keys for agreements
 */
export const agreementKeys = {
  all: ['agreements'] as const,
  lists: () => [...agreementKeys.all, 'list'] as const,
  list: (params?: AgreementListParams) =>
    [...agreementKeys.lists(), params] as const,
  details: () => [...agreementKeys.all, 'detail'] as const,
  detail: (id: string) => [...agreementKeys.details(), id] as const,
  stats: () => [...agreementKeys.all, 'stats'] as const,
}

/**
 * Get list of agreements
 */
export const useAgreements = (params?: AgreementListParams) => {
  return useQuery({
    queryKey: agreementKeys.list(params),
    queryFn: () => agreementService.getAgreements(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get agreement statistics
 */
export const useAgreementStats = () => {
  return useQuery({
    queryKey: agreementKeys.stats(),
    queryFn: () => agreementService.getAgreementStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single agreement
 */
export const useAgreement = (id: string) => {
  return useQuery({
    queryKey: agreementKeys.detail(id),
    queryFn: () => agreementService.getAgreement(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create agreement mutation
 */
export const useCreateAgreement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementRequest) =>
      agreementService.createAgreement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agreementKeys.stats() })
    },
  })
}

/**
 * Update agreement mutation
 */
export const useUpdateAgreement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgreementRequest }) =>
      agreementService.updateAgreement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agreementKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: agreementKeys.stats() })
    },
  })
}

/**
 * Delete agreement mutation
 */
export const useDeleteAgreement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementService.deleteAgreement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agreementKeys.stats() })
    },
  })
}

/**
 * Generate AI draft mutation.
 * Calls POST /agreements/:id/generate-draft — Python generates the draft,
 * Node saves it to agreement.content, returns updated agreement + draft text.
 */
export const useGenerateAgreementDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => agreementService.generateAgreementDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() })
    },
  })
}
