/**
 * Agreement Service
 * API functions for agreement endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api.types'
import type {
  Agreement,
  AgreementDetail,
  CreateAgreementRequest,
  UpdateAgreementRequest,
  AgreementStats,
  AgreementListParams,
} from '@/types/agreement.types'

/**
 * Map API agreement type to AgreementType
 */
function mapAgreementType(apiType: string): Agreement['type'] {
  const typeMap: Record<string, Agreement['type']> = {
    'Memorandum of Understanding': 'Memorandum of Understanding',
    NDA: 'NDA',
    SLA: 'SLA',
    'Joint Venture': 'Joint Venture',
    Partnership: 'Partnership',
  }
  return typeMap[apiType] || 'Other'
}

/**
 * Format parties array to string
 */
function formatParties(parties: string[] | string): string {
  if (Array.isArray(parties)) {
    return parties.join(', ')
  }
  return parties
}

/**
 * Get list of agreements
 */
export const getAgreements = async (
  params?: AgreementListParams
): Promise<ApiSuccessResponse<PaginatedResponse<Agreement>>> => {
  const response = await apiClient.get<ApiSuccessResponse<Agreement[] | PaginatedResponse<Agreement>>>(
    '/agreements',
    { params }
  )
  
  // Normalize response: API may return direct array or paginated response
  const responseData = response.data
  
  // If data is a direct array, wrap it in paginated format
  if (Array.isArray(responseData.data)) {
    const items: Agreement[] = responseData.data.map((item: {
      id: string
      title: string
      parties: string[] | string
      type: string
      date: string
      status: string
      updatedAt?: string
      createdAt: string
      aiSuggestions?: number | null
    }) => ({
      id: item.id,
      title: item.title,
      parties: formatParties(item.parties),
      type: mapAgreementType(item.type),
      date: item.date,
      status: item.status as Agreement['status'],
      aiSuggestions: item.aiSuggestions ?? null,
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
    const normalizedItems: Agreement[] = responseData.data.items.map((item: {
      id: string
      title: string
      parties: string[] | string
      type: string
      date: string
      status: string
      updatedAt?: string
      createdAt: string
      aiSuggestions?: number | null
    }) => ({
      id: item.id,
      title: item.title,
      parties: formatParties(item.parties),
      type: mapAgreementType(item.type),
      date: item.date,
      status: item.status as Agreement['status'],
      aiSuggestions: item.aiSuggestions ?? null,
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
  
  return response.data as ApiSuccessResponse<PaginatedResponse<Agreement>>
}

/**
 * Get agreement statistics
 * @deprecated Backend doesn't implement this endpoint yet
 * Calculate stats client-side from the agreements list
 */
export const getAgreementStats = async (): Promise<
  ApiSuccessResponse<AgreementStats>
> => {
  // TODO: Backend doesn't have this endpoint yet
  // Calculate stats from getAgreements() client-side
  throw new Error('Agreement stats endpoint not implemented in backend')
}

/**
 * Get single agreement by ID
 */
export const getAgreement = async (
  id: string
): Promise<ApiSuccessResponse<AgreementDetail>> => {
  const response = await apiClient.get<ApiSuccessResponse<AgreementDetail>>(
    `/agreements/${id}`
  )
  return response.data
}

/**
 * Create new agreement draft
 */
export const createAgreement = async (
  data: CreateAgreementRequest
): Promise<ApiSuccessResponse<Agreement>> => {
  const response = await apiClient.post<ApiSuccessResponse<Agreement>>(
    '/agreements',
    data
  )
  return response.data
}

/**
 * Update agreement
 * @deprecated Backend doesn't implement PUT endpoint yet
 */
export const updateAgreement = async (
  id: string,
  data: UpdateAgreementRequest
): Promise<ApiSuccessResponse<Agreement>> => {
  // TODO: Backend doesn't have PUT endpoint yet
  throw new Error('Update agreement endpoint not implemented in backend')
}

/**
 * Delete agreement
 * @deprecated Backend doesn't implement DELETE endpoint yet
 */
export const deleteAgreement = async (
  id: string
): Promise<ApiSuccessResponse<null>> => {
  // TODO: Backend doesn't have DELETE endpoint yet
  throw new Error('Delete agreement endpoint not implemented in backend')
}

/**
 * Generate AI draft for agreement
 * Uses the AI jobs endpoint instead of dedicated generate-draft endpoint
 */
export const generateAgreementDraft = async (
  id: string,
  data: CreateAgreementRequest
): Promise<ApiSuccessResponse<{ jobId: string; status: string; estimatedTime: number; agreementId: string }>> => {
  // Import AI service to use createAIJob
  const { createAIJob } = await import('./ai-assistant.service')
  const job = await createAIJob({
    jobType: 'generate_draft',
    entityType: 'Agreement',
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
      agreementId: id,
    },
  }
}
