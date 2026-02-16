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
 * Format contract value from numeric and currency
 */
function formatContractValue(valueNumeric: string | number, currency: string): string {
  const num = typeof valueNumeric === 'string' ? parseFloat(valueNumeric) : valueNumeric
  if (isNaN(num)) return `${currency} 0`
  // Format with commas for thousands
  const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${currency} ${formatted}`
}

/**
 * Map API contract type to ContractType
 */
function mapContractType(apiType: string): Contract['type'] {
  const typeMap: Record<string, Contract['type']> = {
    Service: 'Service Agreement',
    Lease: 'Lease',
    License: 'License',
    NDA: 'NDA',
    'Service Agreement': 'Service Agreement',
  }
  return typeMap[apiType] || 'Other'
}

/**
 * Get list of contracts
 */
export const getContracts = async (
  params?: ContractListParams
): Promise<ApiSuccessResponse<PaginatedResponse<Contract>>> => {
  const response = await apiClient.get<ApiSuccessResponse<Contract[] | PaginatedResponse<Contract>>>(
    '/contracts',
    { params }
  )
  
  // Normalize response: API may return direct array or paginated response
  const responseData = response.data
  
  // If data is a direct array, wrap it in paginated format
  if (Array.isArray(responseData.data)) {
    const items: Contract[] = responseData.data.map((item: {
      id: string
      title: string
      counterparty: string
      type: string
      valueNumeric: string | number
      currency: string
      startDate: string
      endDate: string
      durationMonths?: number | null
      status: string
      updatedAt?: string
      createdAt: string
      aiFlags?: number | null
    }) => ({
      id: item.id,
      title: item.title,
      counterparty: item.counterparty,
      type: mapContractType(item.type),
      value: formatContractValue(item.valueNumeric, item.currency),
      valueNumeric: typeof item.valueNumeric === 'string' ? parseFloat(item.valueNumeric) : item.valueNumeric,
      currency: item.currency,
      startDate: item.startDate,
      endDate: item.endDate,
      durationMonths: item.durationMonths ?? null,
      status: item.status as Contract['status'],
      aiFlags: item.aiFlags ?? null,
      createdAt: item.createdAt,
      lastUpdated: item.updatedAt || item.createdAt,
    }))
    
    return {
      ...responseData,
      data: {
        items,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || items.length,
          total: items.length,
          totalPages: 1,
        },
      },
    }
  }
  
  // If already paginated, normalize items
  if (responseData.data && 'items' in responseData.data) {
    const normalizedItems: Contract[] = responseData.data.items.map((item: {
      id: string
      title: string
      counterparty: string
      type: string
      valueNumeric?: string | number
      currency?: string
      value?: string
      startDate: string
      endDate: string
      durationMonths?: number | null
      status: string
      updatedAt?: string
      createdAt: string
      aiFlags?: number | null
    }) => ({
      id: item.id,
      title: item.title,
      counterparty: item.counterparty,
      type: mapContractType(item.type),
      value: item.value || (item.valueNumeric && item.currency 
        ? formatContractValue(item.valueNumeric, item.currency)
        : '—'),
      valueNumeric: item.valueNumeric 
        ? (typeof item.valueNumeric === 'string' ? parseFloat(item.valueNumeric) : item.valueNumeric)
        : 0,
      currency: item.currency || '',
      startDate: item.startDate,
      endDate: item.endDate,
      durationMonths: item.durationMonths ?? null,
      status: item.status as Contract['status'],
      aiFlags: item.aiFlags ?? null,
      createdAt: item.createdAt,
      lastUpdated: item.updatedAt || item.createdAt,
    }))
    
    return {
      ...responseData,
      data: {
        ...responseData.data,
        items: normalizedItems,
      },
    }
  }
  
  return response.data as ApiSuccessResponse<PaginatedResponse<Contract>>
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
