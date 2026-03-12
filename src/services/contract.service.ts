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
 * Backend returns "Service" but we display/store as "Service Agreement"
 */
function mapContractType(apiType: string | null): Contract['type'] {
  if (!apiType) return 'Other'
  const typeMap: Record<string, Contract['type']> = {
    Service: 'Service Agreement',
    'Service Agreement': 'Service Agreement',
    Lease: 'Lease',
    License: 'License',
    NDA: 'NDA',
  }
  return typeMap[apiType] || 'Other'
}

/**
 * Map ContractType to API type (reverse mapping)
 * Backend expects "Service Agreement" but may return "Service"
 */
function mapContractTypeToApi(type: Contract['type']): string {
  return type === 'Service Agreement' ? 'Service Agreement' : type
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
      type: string | null
      valueNumeric: string | number | null
      currency: string
      startDate: string | null
      endDate: string | null
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
      value: item.valueNumeric && item.currency
        ? formatContractValue(item.valueNumeric, item.currency)
        : '—',
      valueNumeric: item.valueNumeric
        ? (typeof item.valueNumeric === 'string' ? parseFloat(item.valueNumeric) : item.valueNumeric)
        : 0,
      currency: item.currency || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      durationMonths: item.durationMonths ?? null,
      status: item.status as Contract['status'],
      aiFlags: item.aiFlags ?? null,
      content: (item as { content?: string }).content ?? undefined,
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
      type: string | null
      valueNumeric?: string | number | null
      currency?: string
      value?: string
      startDate: string | null
      endDate: string | null
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
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      durationMonths: item.durationMonths ?? null,
      status: item.status as Contract['status'],
      aiFlags: item.aiFlags ?? null,
      content: (item as { content?: string }).content ?? undefined,
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
 * POST /contracts - transforms frontend form data to backend API format
 */
export const createContract = async (
  data: CreateContractRequest
): Promise<ApiSuccessResponse<Contract>> => {
  // Transform keyTerms: if string, parse to object or wrap; if object, use as-is
  let keyTermsObj: Record<string, unknown>
  if (typeof data.keyTerms === 'string') {
    try {
      // Try parsing as JSON first
      keyTermsObj = JSON.parse(data.keyTerms)
    } catch {
      // If not JSON, wrap in a simple object
      keyTermsObj = { description: data.keyTerms }
    }
  } else {
    keyTermsObj = data.keyTerms
  }

  const requestBody = {
    title: data.title,
    counterparty: data.counterparty,
    type: mapContractTypeToApi(data.type),
    valueNumeric: data.valueNumeric,
    currency: data.currency,
    startDate: data.startDate,
    endDate: data.endDate,
    durationMonths: data.durationMonths,
    status: data.status,
    keyTerms: keyTermsObj,
    ...(data.content && { content: data.content }),
  }

  const response = await apiClient.post<ApiSuccessResponse<Contract>>(
    '/contracts',
    requestBody
  )
  return response.data
}

/**
 * Update contract
 */
export const updateContract = async (
  id: string,
  data: UpdateContractRequest
): Promise<ApiSuccessResponse<Contract>> => {
  const response = await apiClient.put<ApiSuccessResponse<Contract>>(
    `/contracts/${id}`,
    data
  )
  return response.data
}

/**
 * Delete contract
 * @deprecated Backend doesn't implement DELETE endpoint yet
 */
export const deleteContract = async (
  _id: string
): Promise<ApiSuccessResponse<null>> => {
  // TODO: Backend doesn't have DELETE endpoint yet
  throw new Error('Delete contract endpoint not implemented in backend')
}

/**
 * Generate AI draft for contract
 * Calls the dedicated generate-draft endpoint which triggers the Python AI backend.
 */
export const generateContractDraft = async (
  id: string
): Promise<ApiSuccessResponse<{ draft_text: string; key_clauses: string[]; summary: string }>> => {
  const response = await apiClient.post<ApiSuccessResponse<{ draft_text: string; key_clauses: string[]; summary: string }>>(
    `/contracts/${id}/generate-draft`
  )
  return response.data
}
