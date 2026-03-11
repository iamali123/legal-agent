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
  AgreementType,
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
      createdBy?: string
      creator?: { name: string }
      aiSuggestions?: number | null
      content?: string | null
      purposeAndObjectives?: string | null
      deletedAt?: string | null
    }) => ({
      id: item.id,
      title: item.title,
      parties: formatParties(item.parties),
      type: mapAgreementType(item.type),
      date: item.date,
      status: item.status as Agreement['status'],
      aiSuggestions: item.aiSuggestions ?? null,
      content: item.content ?? null,
      purposeAndObjectives: item.purposeAndObjectives ?? null,
      createdAt: item.createdAt,
      lastUpdated: item.updatedAt || item.createdAt,
      createdBy: item.createdBy,
      creator: item.creator,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
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
      createdBy?: string
      creator?: { name: string }
      aiSuggestions?: number | null
      content?: string | null
      purposeAndObjectives?: string | null
      deletedAt?: string | null
    }) => ({
      id: item.id,
      title: item.title,
      parties: formatParties(item.parties),
      type: mapAgreementType(item.type),
      date: item.date,
      status: item.status as Agreement['status'],
      aiSuggestions: item.aiSuggestions ?? null,
      content: item.content ?? null,
      purposeAndObjectives: item.purposeAndObjectives ?? null,
      createdAt: item.createdAt,
      lastUpdated: item.updatedAt || item.createdAt,
      createdBy: item.createdBy,
      creator: item.creator,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
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
 * Map AgreementType to API format
 */
function mapAgreementTypeToApi(type: Agreement['type']): string {
  // API expects the type as-is, but ensure it matches
  return type
}

/**
 * Create new agreement draft
 */
export const createAgreement = async (
  data: CreateAgreementRequest
): Promise<ApiSuccessResponse<Agreement>> => {
  // Transform the request to match API structure
  const apiData = {
    title: data.title,
    parties: data.parties, // Already an array
    type: mapAgreementTypeToApi(data.type),
    purposeAndObjectives: data.purposeAndObjectives,
    status: data.status,
    content: data.content,
    date: data.date,
  }
  
  const response = await apiClient.post<ApiSuccessResponse<Agreement>>(
    '/agreements',
    apiData
  )
  return response.data
}

/**
 * Update agreement
 */
export const updateAgreement = async (
  id: string,
  data: UpdateAgreementRequest
): Promise<ApiSuccessResponse<Agreement>> => {
  const response = await apiClient.put<ApiSuccessResponse<Agreement>>(
    `/agreements/${id}`,
    data
  )
  return response.data
}

/**
 * Delete agreement
 * @deprecated Backend doesn't implement DELETE endpoint yet
 */
export const deleteAgreement = async (
  _id: string
): Promise<ApiSuccessResponse<null>> => {
  throw new Error('Delete agreement endpoint not implemented in backend')
}

export interface GenerateDraftResult {
  agreement: Agreement
  draft_text: string
  key_clauses: string[]
  summary: string
}

/**
 * Generate AI draft for an existing agreement.
 * Calls POST /agreements/:id/generate-draft which calls the Python AI backend,
 * generates a draft, saves it to the agreement's content field, and returns the result.
 */
export const generateAgreementDraft = async (
  id: string,
): Promise<GenerateDraftResult> => {
  const response = await apiClient.post<{ success: boolean; data: GenerateDraftResult }>(
    `/agreements/${id}/generate-draft`
  )
  return response.data.data
}
