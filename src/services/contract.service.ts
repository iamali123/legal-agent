/**
 * Contract Service
 * API functions for contract endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api.types'
import type {
  Contract,
  ContractDetail,
  CreateContractRequest,
  UpdateContractRequest,
  ContractStats,
  ContractListParams,
} from '@/types/contract.types'

/**
 * Get list of contracts
 */
export const getContracts = async (
  params?: ContractListParams
): Promise<ApiSuccessResponse<PaginatedResponse<Contract>>> => {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Contract>>>(
    '/contracts',
    { params }
  )
  return response.data
}

/**
 * Get contract statistics
 * @deprecated Backend doesn't implement this endpoint yet
 * Calculate stats client-side from the contracts list
 */
export const getContractStats = async (): Promise<
  ApiSuccessResponse<ContractStats>
> => {
  // TODO: Backend doesn't have this endpoint yet
  // Calculate stats from getContracts() client-side
  throw new Error('Contract stats endpoint not implemented in backend')
}

/**
 * Get single contract by ID
 */
export const getContract = async (
  id: string
): Promise<ApiSuccessResponse<ContractDetail>> => {
  const response = await apiClient.get<ApiSuccessResponse<ContractDetail>>(
    `/contracts/${id}`
  )
  return response.data
}

/**
 * Create new contract draft
 */
export const createContract = async (
  data: CreateContractRequest
): Promise<ApiSuccessResponse<Contract>> => {
  const response = await apiClient.post<ApiSuccessResponse<Contract>>(
    '/contracts',
    data
  )
  return response.data
}

/**
 * Update contract
 * @deprecated Backend doesn't implement PUT endpoint yet
 */
export const updateContract = async (
  id: string,
  data: UpdateContractRequest
): Promise<ApiSuccessResponse<Contract>> => {
  // TODO: Backend doesn't have PUT endpoint yet
  throw new Error('Update contract endpoint not implemented in backend')
}

/**
 * Delete contract
 * @deprecated Backend doesn't implement DELETE endpoint yet
 */
export const deleteContract = async (
  id: string
): Promise<ApiSuccessResponse<null>> => {
  // TODO: Backend doesn't have DELETE endpoint yet
  throw new Error('Delete contract endpoint not implemented in backend')
}

/**
 * Generate AI draft for contract
 * Uses the AI jobs endpoint instead of dedicated generate-draft endpoint
 */
export const generateContractDraft = async (
  id: string,
  data: CreateContractRequest
): Promise<ApiSuccessResponse<{ jobId: string; status: string; estimatedTime: number; contractId: string }>> => {
  // Import AI service to use createAIJob
  const { createAIJob } = await import('./ai-assistant.service')
  const job = await createAIJob({
    jobType: 'generate_draft',
    entityType: 'Contract',
    entityId: id,
    input: data,
  })
  
  return {
    success: true,
    message: 'AI draft generation started',
    data: {
      jobId: job.data.id,
      status: job.data.status,
      estimatedTime: job.data.estimatedTime || 30,
      contractId: id,
    },
  }
}
