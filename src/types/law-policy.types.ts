/**
 * Law & Policy Types
 */

export type LawPolicyStatus = 'Active' | 'Amended' | 'Repealed'

export interface LawPolicy {
  id: string
  title: string
  description: string
  authority: string
  category: string
  status: LawPolicyStatus
  publicationDate: string
  effectiveDate: string
  aiSummary: string
}

export interface LawPolicyDetail extends LawPolicy {
  content: string
  amendments: Array<{
    id: string
    date: string
    description: string
  }>
  relatedLaws: unknown[]
  attachments: File[]
}

export interface LawPolicyStats {
  total: number
  active: number
  amended: number
  categories: number
}

export interface LawPolicyListParams {
  page?: number
  limit?: number
  search?: string
  status?: LawPolicyStatus
  authority?: string
  category?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
