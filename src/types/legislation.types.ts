/**
 * Legislation Types
 */

export type LegislationStatus = 'draft' | 'active' | 'published' | 'amended'
export type LegislationJurisdiction = 'Federal' | 'Emirate' | 'Local'

export interface AIFlags {
  type: 'clean' | 'warning'
  count?: number | null
  issues?: Array<{
    type: string
    description: string
  }> | null
}

export interface Legislation {
  id: string
  title: string
  jurisdiction: LegislationJurisdiction
  status: LegislationStatus
  lastUpdated: string
  createdAt: string
  aiFlags: AIFlags
}

export interface LegislationDetail extends Legislation {
  description: string
  content: string
  createdBy: {
    id: string
    name: string
  }
  sections: unknown[]
  relatedDocuments: unknown[]
}

export interface CreateLegislationRequest {
  title: string
  jurisdiction: LegislationJurisdiction
  description: string
}

export interface UpdateLegislationRequest {
  title?: string
  description?: string
  content?: string
  status?: LegislationStatus
}

export interface LegislationStats {
  total: number
  draft: number
  published: number
  amendmentsPending: number
  aiFlaggedRisks: number
}

export interface LegislationListParams {
  page?: number
  limit?: number
  search?: string
  status?: LegislationStatus
  jurisdiction?: LegislationJurisdiction
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
