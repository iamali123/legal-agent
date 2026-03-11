/**
 * AI Documents Hooks
 * React Query hooks for AI-processed documents
 */

import { useQuery } from '@tanstack/react-query'
import * as aiDocsService from '@/services/ai-docs.service'

export const aiDocsKeys = {
  all: ['ai-docs'] as const,
  list: (params?: { entityType?: string; entityId?: string; status?: string }) =>
    [...aiDocsKeys.all, 'list', params] as const,
  chunks: (docId: string) => [...aiDocsKeys.all, 'chunks', docId] as const,
}

export const useAiDocs = (params?: {
  entityType?: string
  entityId?: string
  status?: string
}) => {
  return useQuery({
    queryKey: aiDocsKeys.list(params),
    queryFn: () => aiDocsService.getAiDocs(params),
    refetchInterval: 3000, // poll every 3s for status updates
  })
}

export const useAiDocChunks = (docId?: string) => {
  return useQuery({
    queryKey: aiDocsKeys.chunks(docId || ''),
    queryFn: () => aiDocsService.getAiDocChunks(docId as string),
    enabled: !!docId,
  })
}

