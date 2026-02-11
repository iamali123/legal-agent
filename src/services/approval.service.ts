/**
 * Approval Service
 * API functions for approval endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api.types'
import type {
  Approval,
  ApprovalDetail,
  ApproveRequest,
  RejectRequest,
  RequestChangesRequest,
  ApprovalStats,
  ApprovalListParams,
} from '@/types/approval.types'

/**
 * Get list of approvals
 */
export const getApprovals = async (
  params?: ApprovalListParams
): Promise<ApiSuccessResponse<PaginatedResponse<Approval>>> => {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Approval>>>(
    '/approvals',
    { params }
  )
  return response.data
}

/**
 * Get approval statistics
 * @deprecated Backend doesn't implement this endpoint yet
 * For now, calculate stats client-side from the approvals list
 */
export const getApprovalStats = async (): Promise<
  ApiSuccessResponse<ApprovalStats>
> => {
  // TODO: Backend doesn't have this endpoint yet
  // For now, return empty stats or calculate from getApprovals()
  throw new Error('Approval stats endpoint not implemented in backend')
}

/**
 * Get single approval by ID
 * @deprecated Backend doesn't implement this endpoint yet
 * Use getApprovals() and filter by ID client-side
 */
export const getApproval = async (
  id: string
): Promise<ApiSuccessResponse<ApprovalDetail>> => {
  // TODO: Backend doesn't have this endpoint yet
  // For now, get all approvals and filter client-side
  const allApprovals = await getApprovals()
  const approval = allApprovals.data.items?.find((a) => a.id === id)
  if (!approval) {
    throw new Error(`Approval with id ${id} not found`)
  }
  return {
    success: true,
    message: 'Approval retrieved',
    data: approval as ApprovalDetail,
  }
}

/**
 * Update approval status (used for approve, reject, and request changes)
 * Backend uses a single PATCH endpoint for all status updates
 */
export const updateApprovalStatus = async (
  id: string,
  status: 'approved' | 'rejected' | 'changesRequested' | 'pending',
  comments?: string
): Promise<ApiSuccessResponse<Approval>> => {
  const response = await apiClient.patch<ApiSuccessResponse<Approval>>(
    `/approvals/${id}/status`,
    { status, comments }
  )
  return response.data
}

/**
 * Approve request
 * Uses the updateApprovalStatus endpoint with status: 'approved'
 */
export const approveRequest = async (
  id: string,
  data?: ApproveRequest
): Promise<ApiSuccessResponse<Approval>> => {
  return updateApprovalStatus(id, 'approved', data?.comments)
}

/**
 * Reject request
 * Uses the updateApprovalStatus endpoint with status: 'rejected'
 */
export const rejectRequest = async (
  id: string,
  data: RejectRequest
): Promise<ApiSuccessResponse<Approval>> => {
  return updateApprovalStatus(id, 'rejected', data.reason || data.comments)
}

/**
 * Request changes
 * Uses the updateApprovalStatus endpoint with status: 'changesRequested'
 */
export const requestChanges = async (
  id: string,
  data: RequestChangesRequest
): Promise<ApiSuccessResponse<Approval>> => {
  return updateApprovalStatus(id, 'changesRequested', data.comments)
}
