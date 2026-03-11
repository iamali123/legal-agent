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
  CreateConversationRequest,
  SendMessageRequest,
} from '@/types/ai-assistant.types'

/**
 * Query keys for AI Assistant
 */
export const aiAssistantKeys = {
  all: ['ai-assistant'] as const,
  conversations: () => [...aiAssistantKeys.all, 'conversations'] as const,
  conversation: (conversationId: string, params?: ChatHistoryParams) =>
    [...aiAssistantKeys.all, 'conversation', conversationId, params] as const,
  chat: (conversationId: string, params?: ChatHistoryParams) =>
    [...aiAssistantKeys.all, 'chat', conversationId, params] as const,
  analysis: (jobId: string) =>
    [...aiAssistantKeys.all, 'analysis', jobId] as const,
}

/**
 * Get all conversations
 */
export const useConversations = () => {
  return useQuery({
    queryKey: aiAssistantKeys.conversations(),
    queryFn: () => aiAssistantService.getConversations(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Create conversation mutation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      aiAssistantService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.conversations(),
      })
    },
  })
}

/**
 * Get conversation with messages
 */
export const useConversation = (
  conversationId: string,
  params?: ChatHistoryParams
) => {
  return useQuery({
    queryKey: aiAssistantKeys.conversation(conversationId, params),
    queryFn: () => aiAssistantService.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Send message to conversation mutation
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string
      data: SendMessageRequest
    }) => aiAssistantService.sendMessage(conversationId, data),
    onSuccess: (_, variables) => {
      // Invalidate conversation and chat history
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.conversation(variables.conversationId),
      })
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.chat(variables.conversationId),
      })
    },
  })
}

/**
 * Send message with streaming response (token-by-token)
 */
export const useSendMessageStream = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
      onToken,
    }: {
      conversationId: string
      data: SendMessageRequest
      onToken: (token: string) => void
    }) => aiAssistantService.sendMessageStream(conversationId, data, onToken),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.conversation(variables.conversationId),
      })
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.chat(variables.conversationId),
      })
    },
  })
}

/**
 * Send chat message mutation (legacy - maintained for backward compatibility)
 * @deprecated Use useCreateConversation + useSendMessage instead
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
        queryClient.invalidateQueries({
          queryKey: aiAssistantKeys.conversation(response.data.conversationId),
        })
      }
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.conversations(),
      })
    },
  })
}

/**
 * Get chat history (legacy - maintained for backward compatibility)
 * @deprecated Use useConversation instead
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
 * Inject a message into a conversation (for panel results)
 */
export const useInjectMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      aiAssistantService.injectMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.conversation(variables.conversationId),
      })
      queryClient.invalidateQueries({
        queryKey: aiAssistantKeys.chat(variables.conversationId),
      })
    },
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
