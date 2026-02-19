/**
 * Approval Types
 * Status and priority align with backend enums Approvals.status and Approvals.priority
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changesRequested'
export type ApprovalPriority = 'Low' | 'Medium' | 'High'
export type ApprovalType = 'Legislation' | 'Contract' | 'Agreement' | 'Policy'

export interface Approval {
  id: string
  title: string
  type: ApprovalType
  entityId: string
  entityType: string
  assigneeId?: string
  submittedById?: string
  assignee?: {
    name: string
  }
  submitter?: {
    name: string
  }
  dueDate: string
  priority: ApprovalPriority
  status: ApprovalStatus
  aiRecommendation: string
  confidence: number
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  approvedAt?: string | null
}

export interface ApprovalDetail extends Approval {
  entity: unknown
  aiSummary: string
  documentSections: Array<{
    label: string
    isNewOrModified?: boolean
  }>
  history: unknown[]
}

export interface ApproveRequest {
  comments?: string
}

export interface RejectRequest {
  reason: string
  comments?: string
}

export interface RequestChangesRequest {
  changes: Array<{
    section: string
    description: string
  }>
  comments?: string
}

export interface ApprovalStats {
  pending: number
  approvedToday: number
  urgent: number
  inReview: number
}

export interface ApprovalListParams {
  page?: number
  limit?: number
  status?: ApprovalStatus
  priority?: ApprovalPriority
  type?: ApprovalType
  assignee?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
