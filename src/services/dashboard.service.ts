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
  const response = await apiClient.get<ApiSuccessResponse<DashboardStats>>(
    '/dashboard/stats'
  )
  return response.data
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
