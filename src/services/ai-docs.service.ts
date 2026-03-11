import { apiClient } from '@/lib/api/client'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { AiDoc, AiDocChunks } from '@/types/ai-doc.types'

export interface AiDocList {
  docs: AiDoc[]
  count: number
}

interface AiBackendListResponse {
  success: boolean
  data: AiDoc[]
  count: number
}

interface AiBackendChunksResponse {
  success: boolean
  data: AiDocChunks
}

export const getAiDocs = async (params?: {
  entityType?: string
  entityId?: string
  status?: string
}): Promise<AiDocList> => {
  const response = await apiClient.get<
    ApiSuccessResponse<AiBackendListResponse>
  >('/ai/docs', {
    params,
  })

  const inner = response.data.data

  return {
    docs: inner.data ?? [],
    count: inner.count ?? 0,
  }
}

export const getAiDocChunks = async (docId: string): Promise<AiDocChunks> => {
  const response = await apiClient.get<
    ApiSuccessResponse<AiBackendChunksResponse>
  >(`/ai/docs/${docId}/chunks`)

  const outer = response.data.data
  return outer.data
}

