/**
 * AI Assistant Hooks
 * React Query hooks for AI Legal Assistant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as aiAssistantService from '@/services/ai-assistant.service'
import type {
  ChatMessageRequest,
  AnalyzeDocumentRequest,
  ChatHistoryParams,
} from '@/types/ai-assistant.types'

/**
 * Query keys for AI Assistant
 */
export const aiAssistantKeys = {
  all: ['ai-assistant'] as const,
  chat: (conversationId: string, params?: ChatHistoryParams) =>
    [...aiAssistantKeys.all, 'chat', conversationId, params] as const,
  analysis: (jobId: string) =>
    [...aiAssistantKeys.all, 'analysis', jobId] as const,
}

/**
 * Send chat message mutation
 */
export const useSendChatMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChatMessageRequest) =>
      aiAssistantService.sendChatMessage(data),
    onSuccess: (response) => {
      // Invalidate chat history if conversationId exists
      if (response.data.conversationId) {
        queryClient.invalidateQueries({
          queryKey: aiAssistantKeys.chat(response.data.conversationId),
        })
      }
    },
  })
}

/**
 * Get chat history
 */
export const useChatHistory = (
  conversationId: string,
  params?: ChatHistoryParams
) => {
  return useQuery({
    queryKey: aiAssistantKeys.chat(conversationId, params),
    queryFn: () => aiAssistantService.getChatHistory(conversationId, params),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Analyze document mutation
 */
export const useAnalyzeDocument = () => {
  return useMutation({
    mutationFn: (data: AnalyzeDocumentRequest) =>
      aiAssistantService.analyzeDocument(data),
  })
}

/**
 * Get analysis result
 */
export const useAnalysisResult = (jobId: string) => {
  return useQuery({
    queryKey: aiAssistantKeys.analysis(jobId),
    queryFn: () => aiAssistantService.getAnalysisResult(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if status is processing
      const data = query.state.data?.data
      return data?.status === 'processing' ? 2000 : false
    },
  })
}
