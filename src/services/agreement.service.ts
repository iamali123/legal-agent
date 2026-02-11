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
 * Get list of agreements
 */
export const getAgreements = async (
  params?: AgreementListParams
): Promise<ApiSuccessResponse<PaginatedResponse<Agreement>>> => {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Agreement>>>(
    '/agreements',
    { params }
  )
  return response.data
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
