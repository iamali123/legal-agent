/**
 * Agreement Types
 * Status aligns with backend ENUM: draft, active, terminated
 */

export type AgreementStatus = 'draft' | 'active' | 'terminated'
export type AgreementType =
  | 'Memorandum of Understanding'
  | 'NDA'
  | 'SLA'
  | 'Joint Venture'
  | 'Partnership'
  | 'Other'

export interface Agreement {
  id: string
  title: string
  parties: string // Formatted from array for display
  type: AgreementType
  date: string
  status: AgreementStatus
  aiSuggestions?: number | null
  content?: string | null
  purposeAndObjectives?: string | null
  createdAt: string
  lastUpdated: string
  createdBy?: string
  creator?: {
    name: string
  }
  updatedAt?: string
  deletedAt?: string | null
}

export interface AgreementDetail extends Agreement {
  purposeAndObjectives: string
  content: string
  aiAnalysis?: {
    suggestions: string[]
    complianceScore: number
  }
  createdBy: string
  creator?: {
    name: string
  }
  attachments?: File[]
}

export interface CreateAgreementRequest {
  title: string
  parties: string[] // Array of party names
  type: AgreementType
  purposeAndObjectives: string
  status: AgreementStatus
  content?: string
  date: string // Format: YYYY-MM-DD
}

export interface UpdateAgreementRequest {
  title?: string
  status?: AgreementStatus
  purposeAndObjectives?: string
  content?: string
}

export interface AgreementStats {
  draft: number
  active: number
  terminated: number
}

export interface AgreementListParams {
  page?: number
  limit?: number
  search?: string
  status?: AgreementStatus
  type?: AgreementType
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
