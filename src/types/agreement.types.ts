/**
 * Agreement Types
 */

export type AgreementStatus = 'active' | 'pending' | 'inNegotiation' | 'signed' | 'expired'
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
  parties: string
  type: AgreementType
  date: string
  status: AgreementStatus
  aiSuggestions: number | null
  createdAt: string
  lastUpdated: string
}

export interface AgreementDetail extends Agreement {
  purposeAndObjectives: string
  content: string
  aiAnalysis: {
    suggestions: string[]
    complianceScore: number
  }
  createdBy: {
    id: string
    name: string
  }
  attachments: File[]
}

export interface CreateAgreementRequest {
  title: string
  agreementType: AgreementType
  partiesInvolved: string
  purposeAndObjectives: string
}

export interface UpdateAgreementRequest {
  title?: string
  status?: AgreementStatus
  purposeAndObjectives?: string
  content?: string
}

export interface AgreementStats {
  active: number
  pendingSignature: number
  inNegotiation: number
  renewedThisMonth: number
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
