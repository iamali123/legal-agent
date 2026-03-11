/**
 * Contract Types
 * Status aligns with backend ENUM: draft, pending_approval, approved, active, expired, terminated
 */

export type ContractStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'expired'
  | 'terminated'
export type ContractType = 'Service Agreement' | 'Lease' | 'License' | 'NDA' | 'Other'

export interface Contract {
  id: string
  title: string
  counterparty: string
  type: ContractType
  value: string
  valueNumeric: number
  currency: string
  startDate: string
  endDate: string
  durationMonths?: number | null
  status: ContractStatus
  aiFlags: number | null
  content?: string
  createdAt: string
  lastUpdated: string
}

export interface ContractDetail extends Contract {
  keyTerms: string
  content: string
  aiAnalysis: {
    riskLevel: 'low' | 'medium' | 'high'
    complianceScore: number
    recommendations: string[]
  }
  createdBy: {
    id: string
    name: string
  }
  attachments: File[]
}

/** Request body for POST /contracts - matches backend API exactly */
export interface CreateContractRequest {
  title: string
  counterparty: string
  type: ContractType
  valueNumeric: number
  currency: string
  startDate: string
  endDate: string
  durationMonths: number
  status: ContractStatus
  keyTerms: Record<string, unknown> | string
  content?: string
}

export interface UpdateContractRequest {
  title?: string
  status?: ContractStatus
  keyTerms?: string
  content?: string
}

export interface ContractStats {
  draft: number
  pending_approval: number
  approved: number
  active: number
  expired: number
  terminated: number
  aiRiskFlags: number
}

export interface ContractListParams {
  page?: number
  limit?: number
  search?: string
  status?: ContractStatus
  type?: ContractType
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
