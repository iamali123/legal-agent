/**
 * File Hooks
 * React Query hooks for file management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as fileService from '@/services/file.service'
import type {
  UploadFileRequest,
} from '@/types/file.types'

/**
 * Query keys for files
 */
export const fileKeys = {
  all: ['files'] as const,
  detail: (fileId: string) => [...fileKeys.all, fileId] as const,
}

/**
 * Upload file mutation
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UploadFileRequest) => fileService.uploadFile(data),
    onSuccess: (response) => {
      // Invalidate file detail query
      queryClient.invalidateQueries({
        queryKey: fileKeys.detail(response.data.fileId),
      })
    },
  })
}

/**
 * Get file information
 */
export const useFile = (fileId: string) => {
  return useQuery({
    queryKey: fileKeys.detail(fileId),
    queryFn: () => fileService.getFile(fileId),
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Delete file mutation
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: (_, fileId) => {
      queryClient.removeQueries({ queryKey: fileKeys.detail(fileId) })
    },
  })
}
