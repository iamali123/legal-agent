/**
 * Legislation Service
 * API functions for legislation endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api.types'
import type {
  Legislation,
  LegislationDetail,
  CreateLegislationRequest,
  UpdateLegislationRequest,
  LegislationStats,
  LegislationListParams,
} from '@/types/legislation.types'

/**
 * Get list of legislations
 */
export const getLegislations = async (
  params?: LegislationListParams
): Promise<ApiSuccessResponse<PaginatedResponse<Legislation>>> => {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Legislation>>>(
    '/legislations',
    { params }
  )
  return response.data
}

/**
 * Get legislation statistics
 * @deprecated Backend doesn't implement this endpoint yet
 * Calculate stats client-side from the legislations list
 */
export const getLegislationStats = async (): Promise<
  ApiSuccessResponse<LegislationStats>
> => {
  // TODO: Backend doesn't have this endpoint yet
  // Calculate stats from getLegislations() client-side
  throw new Error('Legislation stats endpoint not implemented in backend')
}

/**
 * Get single legislation by ID
 */
export const getLegislation = async (
  id: string
): Promise<ApiSuccessResponse<LegislationDetail>> => {
  const response = await apiClient.get<ApiSuccessResponse<LegislationDetail>>(
    `/legislations/${id}`
  )
  return response.data
}

/**
 * Create new legislation draft
 */
export const createLegislation = async (
  data: CreateLegislationRequest
): Promise<ApiSuccessResponse<Legislation>> => {
  const response = await apiClient.post<ApiSuccessResponse<Legislation>>(
    '/legislations',
    data
  )
  return response.data
}

/**
 * Update legislation
 * @deprecated Backend doesn't implement PUT endpoint yet
 * Use updateLegislationStatus for status updates only
 */
export const updateLegislation = async (
  id: string,
  data: UpdateLegislationRequest
): Promise<ApiSuccessResponse<Legislation>> => {
  // TODO: Backend doesn't have PUT endpoint yet
  // For now, only status updates are supported via PATCH /legislations/:id/status
  throw new Error('Update legislation endpoint not implemented in backend. Use updateLegislationStatus for status updates.')
}

/**
 * Update legislation status
 */
export const updateLegislationStatus = async (
  id: string,
  status: string
): Promise<ApiSuccessResponse<Legislation>> => {
  const response = await apiClient.patch<ApiSuccessResponse<Legislation>>(
    `/legislations/${id}/status`,
    { status }
  )
  return response.data
}

/**
 * Delete legislation
 * @deprecated Backend doesn't implement DELETE endpoint yet
 */
export const deleteLegislation = async (
  id: string
): Promise<ApiSuccessResponse<null>> => {
  // TODO: Backend doesn't have DELETE endpoint yet
  throw new Error('Delete legislation endpoint not implemented in backend')
}

/**
 * Generate AI draft for legislation
 * Uses the AI jobs endpoint instead of dedicated generate-draft endpoint
 */
export const generateLegislationDraft = async (
  id: string,
  data: CreateLegislationRequest
): Promise<ApiSuccessResponse<{ jobId: string; status: string; estimatedTime: number; legislationId: string }>> => {
  // Import AI service to use createAIJob
  const { createAIJob } = await import('./ai-assistant.service')
  const job = await createAIJob({
    jobType: 'generate_draft',
    entityType: 'Legislation',
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
      legislationId: id,
    },
  }
}
