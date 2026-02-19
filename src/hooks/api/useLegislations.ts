/**
 * Legislation Hooks
 * React Query hooks for legislations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as legislationService from '@/services/legislation.service'
import type {
  LegislationListParams,
  CreateLegislationRequest,
  CreateLegislationSectionRequest,
  UpdateLegislationRequest,
} from '@/types/legislation.types'

/**
 * Query keys for legislations
 */
export const legislationKeys = {
  all: ['legislations'] as const,
  lists: () => [...legislationKeys.all, 'list'] as const,
  list: (params?: LegislationListParams) =>
    [...legislationKeys.lists(), params] as const,
  details: () => [...legislationKeys.all, 'detail'] as const,
  detail: (id: string) => [...legislationKeys.details(), id] as const,
  /** For future GET /legislations/:id/sections */
  sections: (id: string) => [...legislationKeys.detail(id), 'sections'] as const,
  stats: () => [...legislationKeys.all, 'stats'] as const,
}

/**
 * Get list of legislations
 */
export const useLegislations = (params?: LegislationListParams) => {
  return useQuery({
    queryKey: legislationKeys.list(params),
    queryFn: () => legislationService.getLegislations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get legislation statistics
 */
export const useLegislationStats = () => {
  return useQuery({
    queryKey: legislationKeys.stats(),
    queryFn: () => legislationService.getLegislationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single legislation
 */
export const useLegislation = (id: string) => {
  return useQuery({
    queryKey: legislationKeys.detail(id),
    queryFn: () => legislationService.getLegislation(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create legislation mutation
 */
export const useCreateLegislation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLegislationRequest) =>
      legislationService.createLegislation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legislationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: legislationKeys.stats() })
    },
  })
}

/**
 * Update legislation mutation
 */
export const useUpdateLegislation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLegislationRequest }) =>
      legislationService.updateLegislation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: legislationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: legislationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: legislationKeys.stats() })
    },
  })
}

/**
 * Update legislation status mutation
 * PATCH /legislations/:id/status { status }
 */
export const useUpdateLegislationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      legislationService.updateLegislationStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: legislationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: legislationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: legislationKeys.stats() })
    },
  })
}

/**
 * Delete legislation mutation
 */
export const useDeleteLegislation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => legislationService.deleteLegislation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legislationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: legislationKeys.stats() })
    },
  })
}

/**
 * Generate AI draft mutation
 */
export const useGenerateLegislationDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLegislationRequest }) =>
      legislationService.generateLegislationDraft(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: legislationKeys.detail(variables.id) })
    },
  })
}

/**
 * Create legislation section mutation
 * POST /legislations/:id/sections
 */
export const useCreateLegislationSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      legislationId,
      data,
    }: {
      legislationId: string
      data: CreateLegislationSectionRequest
    }) => legislationService.createLegislationSection(legislationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: legislationKeys.detail(variables.legislationId),
      })
      queryClient.invalidateQueries({
        queryKey: legislationKeys.sections(variables.legislationId),
      })
    },
  })
}
