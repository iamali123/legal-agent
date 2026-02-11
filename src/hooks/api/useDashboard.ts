/**
 * Dashboard Hooks
 * React Query hooks for dashboard data
 */

import { useQuery } from '@tanstack/react-query'
import * as dashboardService from '@/services/dashboard.service'
import type {
  AIHighlightsParams,
  RecentActivityParams,
} from '@/types/dashboard.types'

/**
 * Query keys for dashboard
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  aiHighlights: (params?: AIHighlightsParams) =>
    [...dashboardKeys.all, 'ai-highlights', params] as const,
  recentActivity: (params?: RecentActivityParams) =>
    [...dashboardKeys.all, 'recent-activity', params] as const,
}

/**
 * Get dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get AI highlights
 */
export const useAIHighlights = (params?: AIHighlightsParams) => {
  return useQuery({
    queryKey: dashboardKeys.aiHighlights(params),
    queryFn: () => dashboardService.getAIHighlights(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get recent activity
 */
export const useRecentActivity = (params?: RecentActivityParams) => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(params),
    queryFn: () => dashboardService.getRecentActivity(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
