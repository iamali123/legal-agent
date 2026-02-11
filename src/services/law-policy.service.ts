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
