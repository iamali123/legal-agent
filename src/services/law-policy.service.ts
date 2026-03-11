/**
 * Law & Policy Service
 * API functions for laws and policies endpoints (read-only)
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api.types'
import type {
  LawPolicy,
  LawPolicyDetail,
  LawPolicyStats,
  LawPolicyListParams,
} from '@/types/law-policy.types'

/**
 * Get list of laws and policies
 */
export const getLawsPolicies = async (
  params?: LawPolicyListParams
): Promise<ApiSuccessResponse<PaginatedResponse<LawPolicy>>> => {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<LawPolicy>>>(
    '/laws-policies',
    { params }
  )
  return response.data
}

/**
 * Get laws and policies statistics
 */
export const getLawsPoliciesStats = async (): Promise<
  ApiSuccessResponse<LawPolicyStats>
> => {
  const response = await apiClient.get<ApiSuccessResponse<LawPolicyStats>>(
    '/laws-policies/stats'
  )
  return response.data
}

/**
 * Get single law/policy by ID
 */
export const getLawPolicy = async (
  id: string
): Promise<ApiSuccessResponse<LawPolicyDetail>> => {
  const response = await apiClient.get<ApiSuccessResponse<LawPolicyDetail>>(
    `/laws-policies/${id}`
  )
  return response.data
}

/**
 * Create a new law/policy entry
 */
export const createLawPolicy = async (
  payload: {
    title: string
    description: string
    authority: string
    category: string
    status?: string
    publicationDate?: string
    effectiveDate?: string
    content?: string
  }
): Promise<ApiSuccessResponse<LawPolicyDetail>> => {
  const response = await apiClient.post<ApiSuccessResponse<LawPolicyDetail>>(
    '/laws-policies',
    payload
  )
  return response.data
}

/**
 * Upload a law/policy document to the AI backend for processing.
 * This proxies through the Node backend to the Python ai_backend.
 */
export const uploadLawPolicyDocument = async (
  file: File,
  options?: { entityType?: string; entityId?: string }
): Promise<unknown> => {
  const formData = new FormData()
  formData.append('file', file)

  const params = new URLSearchParams()
  if (options?.entityType) params.append('entityType', options.entityType)
  if (options?.entityId) params.append('entityId', options.entityId)

  const queryString = params.toString()
  const url = `/ai/docs/upsert${queryString ? `?${queryString}` : ''}`

  const response = await apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
