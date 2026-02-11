/**
 * Contract Types
 */

export type ContractStatus = 'active' | 'expiring' | 'inReview' | 'expired' | 'terminated'
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

export interface CreateContractRequest {
  title: string
  contractType: ContractType
  counterparty: string
  value: string
  currency?: string
  durationMonths: string
  keyTerms: string
}

export interface UpdateContractRequest {
  title?: string
  status?: ContractStatus
  keyTerms?: string
  content?: string
}

export interface ContractStats {
  active: number
  expiringSoon: number
  inReview: number
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
