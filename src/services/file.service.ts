/**
 * File Service
 * API functions for file upload and management endpoints
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
} from '@/types/api.types'
import type {
  File,
  UploadFileRequest,
} from '@/types/file.types'

/**
 * Upload file
 */
export const uploadFile = async (
  data: UploadFileRequest
): Promise<ApiSuccessResponse<File>> => {
  const formData = new FormData()
  formData.append('file', data.file as Blob)
  
  if (data.entityType) {
    formData.append('entityType', data.entityType)
  }
  
  if (data.entityId) {
    formData.append('entityId', data.entityId)
  }
  
  const response = await apiClient.post<ApiSuccessResponse<File>>(
    '/files/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

/**
 * Get file information
 * @deprecated Backend doesn't implement GET /files/:id endpoint yet
 * Use getFiles() with entityId filter to get file info
 */
export const getFile = async (
  fileId: string
): Promise<ApiSuccessResponse<File>> => {
  // TODO: Backend doesn't have GET /files/:id endpoint yet
  // For now, get all files and filter client-side
  const allFiles = await getFiles()
  const file = allFiles.data.items?.find((f) => f.fileId === fileId)
  if (!file) {
    throw new Error(`File with id ${fileId} not found`)
  }
  return {
    success: true,
    message: 'File retrieved',
    data: file,
  }
}

/**
 * Get files (with optional filters)
 */
export const getFiles = async (
  params?: { entityType?: string; entityId?: string }
): Promise<ApiSuccessResponse<{ items: File[] }>> => {
  const response = await apiClient.get<ApiSuccessResponse<{ items: File[] }>>(
    '/files',
    { params }
  )
  return response.data
}

/**
 * Delete file
 */
export const deleteFile = async (
  fileId: string
): Promise<ApiSuccessResponse<null>> => {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/files/${fileId}`
  )
  return response.data
}
