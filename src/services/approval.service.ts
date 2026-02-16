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
 * Map entityType to ApprovalType (capitalize first letter)
 */
function mapEntityTypeToApprovalType(entityType: string): Approval['type'] {
  const typeMap: Record<string, Approval['type']> = {
    legislation: 'Legislation',
    contract: 'Contract',
    agreement: 'Agreement',
    policy: 'Policy',
  }
  return typeMap[entityType.toLowerCase()] || 'Legislation'
}

/**
 * Convert confidence from decimal (0.95) to percentage (95)
 */
function convertConfidenceToPercentage(confidence: number): number {
  // If already > 1, assume it's already a percentage
  if (confidence > 1) return Math.round(confidence)
  // Otherwise convert from decimal (0.95 → 95)
  return Math.round(confidence * 100)
}

/** Raw approval item as returned by the API (direct array) */
interface RawApprovalItem {
  id: string
  title: string
  entityType: string
  entityId: string
  assigneeId: string
  submittedById: string
  assignee: { name: string }
  submitter: { name: string }
  dueDate: string
  priority: string
  status: string
  aiRecommendation: string
  confidence: number
  createdAt: string
  updatedAt?: string
  approvedAt?: string | null
}

/**
 * Get list of approvals
 */
export const getApprovals = async (params?: ApprovalListParams): Promise<ApiSuccessResponse<PaginatedResponse<Approval>>> => {
  const response = await apiClient.get<ApiSuccessResponse<Approval[] | PaginatedResponse<Approval>>>(
    '/approvals',
    { params }
  )
  
  // Normalize response: API may return direct array or paginated response
  const responseData = response.data
  
  // If data is a direct array, wrap it in paginated format
  if (Array.isArray(responseData.data)) {
    const rawItems = responseData.data as unknown as RawApprovalItem[]
    const items: Approval[] = rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      type: mapEntityTypeToApprovalType(item.entityType),
      entityId: item.entityId,
      entityType: item.entityType,
      assignee: {
        id: item.assigneeId,
        name: item.assignee?.name ?? '—',
      },
      submittedBy: {
        id: item.submittedById,
        name: item.submitter?.name ?? '—',
      },
      dueDate: item.dueDate,
      priority: item.priority as Approval['priority'],
      status: item.status as Approval['status'],
      aiRecommendation: item.aiRecommendation,
      confidence: convertConfidenceToPercentage(item.confidence),
      createdAt: item.createdAt,
      approvedAt: item.approvedAt ?? null,
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
    const normalizedItems: Approval[] = responseData.data.items.map((item: {
      id: string
      title: string
      entityType?: string
      type?: string
      entityId: string
      assigneeId?: string
      submittedById?: string
      assignee?: { id?: string; name: string }
      submitter?: { name: string }
      submittedBy?: { id?: string; name: string }
      dueDate: string
      priority: string
      status: string
      aiRecommendation: string
      confidence: number
      createdAt: string
      updatedAt?: string
      approvedAt?: string | null
    }) => ({
      id: item.id,
      title: item.title,
      type: item.type 
        ? (item.type as Approval['type'])
        : mapEntityTypeToApprovalType(item.entityType || 'legislation'),
      entityId: item.entityId,
      entityType: item.entityType || 'legislation',
      assignee: {
        id: item.assigneeId || item.assignee?.id || '',
        name: item.assignee?.name ?? '—',
      },
      submittedBy: {
        id: item.submittedById || item.submittedBy?.id || '',
        name: item.submitter?.name ?? item.submittedBy?.name ?? '—',
      },
      dueDate: item.dueDate,
      priority: item.priority as Approval['priority'],
      status: item.status as Approval['status'],
      aiRecommendation: item.aiRecommendation,
      confidence: convertConfidenceToPercentage(item.confidence),
      createdAt: item.createdAt,
      approvedAt: item.approvedAt ?? null,
    }))
    
    return {
      ...responseData,
      data: {
        ...responseData.data,
        items: normalizedItems,
      },
    }
  }
  
  return response.data as ApiSuccessResponse<PaginatedResponse<Approval>>
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
