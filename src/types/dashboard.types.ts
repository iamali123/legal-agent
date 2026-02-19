/**
 * Dashboard Types
 */

export interface DashboardStats {
  users: {
    total: number
  }
  legislations: {
    total: number
    byStatus: Array<{
      status: string
      count: string | number
    }>
  }
  contracts: {
    total: number
    totalValue: number
  }
  approvals: {
    pending: number
  }
  ai: {
    processedJobs: number
  }
}

export type AIHighlightType = 'warning' | 'info' | 'success' | 'error'

export interface AIHighlight {
  id: string
  type: AIHighlightType
  title: string
  description: string
  timestamp: string
  relatedEntity?: {
    type: string
    id?: string
    ids?: string[]
  } | null
}

export type ActivityType = 'legislation' | 'contract' | 'agreement' | 'approval' | 'policy'

export interface Activity {
  id: string
  type: ActivityType
  action: string
  title: string
  description: string
  user: {
    id: string
    name: string
  }
  timestamp: string
  entityId: string
}

export interface AIHighlightsParams {
  limit?: number
}

export interface RecentActivityParams {
  limit?: number
  type?: ActivityType
}
