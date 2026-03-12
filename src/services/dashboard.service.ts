/**
 * Dashboard Service
 * API functions for dashboard endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
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
  const response = await apiClient.get<ApiSuccessResponse<DashboardStats>>(
    '/dashboard/stats'
  )
  
  // Normalize the response data
  const apiData = response.data.data
  
  const normalizedStats: DashboardStats = {
    users: {
      total: apiData.users?.total ?? 0,
    },
    legislations: {
      total: apiData.legislations?.total ?? 0,
      byStatus: apiData.legislations?.byStatus ?? [],
    },
    contracts: {
      total: apiData.contracts?.total ?? 0,
      totalValue: apiData.contracts?.totalValue ?? 0,
    },
    approvals: {
      pending: apiData.approvals?.pending ?? 0,
    },
    ai: {
      processedJobs: apiData.ai?.processedJobs ?? 0,
    },
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
  _params?: AIHighlightsParams
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
  _params?: RecentActivityParams
): Promise<ApiSuccessResponse<{ activities: Activity[] }>> => {
  // TODO: Backend doesn't have this endpoint yet
  // Return empty activities for now
  return {
    success: true,
    message: 'Recent activity retrieved',
    data: { activities: [] },
  }
}
