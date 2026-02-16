/**
 * Dashboard Service
 * API functions for dashboard endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api.types'
import type {
  DashboardStats,
  AIHighlight,
  Activity,
  AIHighlightsParams,
  RecentActivityParams,
} from '@/types/dashboard.types'

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<
  ApiSuccessResponse<DashboardStats>
> => {
  const response = await apiClient.get<ApiSuccessResponse<{
    users?: { total?: number }
    legislations?: { total?: number; byStatus?: Array<{ status: string; count: string | number }> }
    contracts?: { total?: number; totalValue?: number }
    approvals?: { pending?: number; urgent?: number }
    ai?: { processedJobs?: number }
  }>>(
    '/dashboard/stats'
  )
  
  // Transform API response to DashboardStats format
  const apiData = response.data.data
  
  const normalizedStats: DashboardStats = {
    totalLegislations: apiData.legislations?.total ?? 0,
    legislationsThisMonth: 0, // API doesn't provide month-specific data
    pendingApprovals: apiData.approvals?.pending ?? 0,
    urgentApprovals: apiData.approvals?.urgent ?? 0,
    activeContracts: apiData.contracts?.total ?? 0,
    expiringContracts: 0, // API doesn't provide this, default to 0
    recentUpdates: apiData.ai?.processedJobs ?? 0,
    recentUpdatesPeriod: 'Last 7 days', // Default value
  }
  
  return {
    ...response.data,
    data: normalizedStats,
  }
}

/**
 * Get AI highlights and insights
 * @deprecated Backend doesn't implement this endpoint yet
 * Return empty array for now
 */
export const getAIHighlights = async (
  params?: AIHighlightsParams
): Promise<ApiSuccessResponse<{ highlights: AIHighlight[] }>> => {
  // TODO: Backend doesn't have this endpoint yet
  // Return empty highlights for now
  return {
    success: true,
    message: 'AI highlights retrieved',
    data: { highlights: [] },
  }
}

/**
 * Get recent activity
 * @deprecated Backend doesn't implement this endpoint yet
 * Return empty array for now
 */
export const getRecentActivity = async (
  params?: RecentActivityParams
): Promise<ApiSuccessResponse<{ activities: Activity[] }>> => {
  // TODO: Backend doesn't have this endpoint yet
  // Return empty activities for now
  return {
    success: true,
    message: 'Recent activity retrieved',
    data: { activities: [] },
  }
}
