/**
 * Contract Hooks
 * React Query hooks for contracts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as contractService from '@/services/contract.service'
import type {
  ContractListParams,
  CreateContractRequest,
  UpdateContractRequest,
} from '@/types/contract.types'
// CreateContractRequest kept for useCreateContract; UpdateContractRequest for useUpdateContract

/**
 * Query keys for contracts
 */
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (params?: ContractListParams) =>
    [...contractKeys.lists(), params] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  stats: () => [...contractKeys.all, 'stats'] as const,
}

/**
 * Get list of contracts
 */
export const useContracts = (params?: ContractListParams) => {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => contractService.getContracts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get contract statistics
 */
export const useContractStats = () => {
  return useQuery({
    queryKey: contractKeys.stats(),
    queryFn: () => contractService.getContractStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single contract
 */
export const useContract = (id: string) => {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractService.getContract(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create contract mutation
 */
export const useCreateContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractRequest) =>
      contractService.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contractKeys.stats() })
    },
  })
}

/**
 * Update contract mutation
 */
export const useUpdateContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractRequest }) =>
      contractService.updateContract(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: contractKeys.stats() })
    },
  })
}

/**
 * Delete contract mutation
 */
export const useDeleteContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractService.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contractKeys.stats() })
    },
  })
}

/**
 * Generate AI draft mutation
 */
export const useGenerateContractDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractService.generateContractDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
    },
  })
}
