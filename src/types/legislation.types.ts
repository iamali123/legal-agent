/**
 * Legislation Types
 * Status aligns with backend enum Legislations.status
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
  description?: string
  jurisdiction: LegislationJurisdiction
  status: LegislationStatus
  version?: string
  lastUpdated: string
  createdAt: string
  aiFlags: AIFlags
}

/** Section of a legislation (for list/edit when API supports GET/PATCH/DELETE) */
export interface LegislationSection {
  id: string
  legislationId: string
  title: string
  content: string
  order: number
  createdAt?: string
  updatedAt?: string
}

/** Request body for POST /legislations/:id/sections */
export interface CreateLegislationSectionRequest {
  title: string
  content: string
  order: number
}

export interface LegislationDetail extends Legislation {
  description: string
  content: string
  version: string
  createdBy: string
  creator?: {
    name: string
    email: string
  }
  updatedAt?: string
  deletedAt?: string | null
  /** Populated when API returns sections; ready for GET /legislations/:id/sections */
  sections?: LegislationSection[]
  relatedDocuments?: unknown[]
}

export interface CreateLegislationRequest {
  title: string
  description: string
  jurisdiction: LegislationJurisdiction
  status: LegislationStatus
  content?: string
  version: string
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
