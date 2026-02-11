/**
 * Approval Hooks
 * React Query hooks for approvals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as approvalService from '@/services/approval.service'
import type {
  ApprovalListParams,
  ApproveRequest,
  RejectRequest,
  RequestChangesRequest,
} from '@/types/approval.types'

/**
 * Query keys for approvals
 */
export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  list: (params?: ApprovalListParams) =>
    [...approvalKeys.lists(), params] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (id: string) => [...approvalKeys.details(), id] as const,
  stats: () => [...approvalKeys.all, 'stats'] as const,
}

/**
 * Get list of approvals
 */
export const useApprovals = (params?: ApprovalListParams) => {
  return useQuery({
    queryKey: approvalKeys.list(params),
    queryFn: () => approvalService.getApprovals(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Get approval statistics
 */
export const useApprovalStats = () => {
  return useQuery({
    queryKey: approvalKeys.stats(),
    queryFn: () => approvalService.getApprovalStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get single approval
 */
export const useApproval = (id: string) => {
  return useQuery({
    queryKey: approvalKeys.detail(id),
    queryFn: () => approvalService.getApproval(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Approve request mutation
 */
export const useApproveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveRequest }) =>
      approvalService.approveRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      // Also invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

/**
 * Reject request mutation
 */
export const useRejectRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectRequest }) =>
      approvalService.rejectRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

/**
 * Request changes mutation
 */
export const useRequestChanges = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RequestChangesRequest }) =>
      approvalService.requestChanges(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
    },
  })
}
