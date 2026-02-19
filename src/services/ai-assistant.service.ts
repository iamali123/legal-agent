/**
 * AI Assistant Service
 * API functions for AI Legal Assistant endpoints
 * 
 * Backend endpoints:
 * - POST /ai/chat/conversations - Create conversation
 * - GET /ai/chat/conversations - List conversations
 * - GET /ai/chat/conversations/:id - Get conversation with messages
 * - POST /ai/chat/conversations/:id/messages - Send message
 * - POST /ai/jobs - Create AI job (for analysis/draft generation)
 * - GET /ai/jobs/:id - Get job status
 */

import { apiClient } from '@/lib/api/client'
import type {
  ApiSuccessResponse,
} from '@/types/api.types'
import type {
  ChatMessageRequest,
  ChatResponse,
  ChatHistory,
  Conversation,
  CreateConversationRequest,
  SendMessageRequest,
  AnalyzeDocumentRequest,
  AIJobResponse,
  AnalysisResult,
  ChatHistoryParams,
} from '@/types/ai-assistant.types'

/**
 * Create a new conversation
 * POST /ai/chat/conversations
 * Body: { title?: string, context?: Record<string, unknown> }
 */
export const createConversation = async (
  data: CreateConversationRequest
): Promise<ApiSuccessResponse<Conversation>> => {
  const response = await apiClient.post<ApiSuccessResponse<Conversation>>(
    '/ai/chat/conversations',
    data
  )
  return response.data
}

/**
 * Get all conversations for the current user
 * GET /ai/chat/conversations
 */
export const getConversations = async (): Promise<ApiSuccessResponse<Conversation[]>> => {
  const response = await apiClient.get<ApiSuccessResponse<Conversation[]>>(
    '/ai/chat/conversations'
  )
  return response.data
}

/**
 * Get conversation with messages
 * GET /ai/chat/conversations/:conversationId
 */
export const getConversation = async (
  conversationId: string
): Promise<ApiSuccessResponse<ChatHistory>> => {
  const response = await apiClient.get<ApiSuccessResponse<ChatHistory>>(
    `/ai/chat/conversations/${conversationId}`
  )
  return response.data
}

/**
 * Send message to a conversation
 * POST /ai/chat/conversations/:conversationId/messages
 * Body: { content: string }
 */
export const sendMessage = async (
  conversationId: string,
  data: SendMessageRequest
): Promise<ApiSuccessResponse<ChatResponse>> => {
  const response = await apiClient.post<ApiSuccessResponse<ChatResponse>>(
    `/ai/chat/conversations/${conversationId}/messages`,
    data
  )
  return response.data
}

/**
 * Create AI job (for document analysis or draft generation)
 */
export const createAIJob = async (
  data: {
    jobType: 'analyze' | 'generate_draft'
    entityType: 'Contract' | 'Agreement' | 'Legislation'
    entityId?: string
    input?: Record<string, any>
  }
): Promise<ApiSuccessResponse<AIJobResponse>> => {
  const response = await apiClient.post<ApiSuccessResponse<AIJobResponse>>(
    '/ai/jobs',
    data
  )
  return response.data
}

/**
 * Get AI job status and result
 */
export const getAIJob = async (
  jobId: string
): Promise<ApiSuccessResponse<AnalysisResult>> => {
  const response = await apiClient.get<ApiSuccessResponse<AnalysisResult>>(
    `/ai/jobs/${jobId}`
  )
  return response.data
}

/**
 * @deprecated Use createConversation and sendMessage instead
 * Send chat message (legacy method - use createConversation + sendMessage)
 * Maintained for backward compatibility with existing components
 */
export const sendChatMessage = async (
  data: ChatMessageRequest
): Promise<ApiSuccessResponse<ChatResponse>> => {
  // If conversationId is provided, send message to existing conversation
  if (data.conversationId) {
    return sendMessage(data.conversationId, { content: data.message })
  }
  
  // Otherwise create a new conversation and send the first message
  const conversation = await createConversation({
    title: data.context ? `Chat - ${data.context}` : 'New Conversation',
    context: data.context ? { topic: data.context } : undefined,
  })
  return sendMessage(conversation.data.id, { content: data.message })
}

/**
 * @deprecated Use getConversation instead
 * Get chat history (legacy method - use getConversation)
 */
export const getChatHistory = async (
  conversationId: string,
  params?: ChatHistoryParams
): Promise<ApiSuccessResponse<ChatHistory>> => {
  return getConversation(conversationId)
}

/**
 * @deprecated Use createAIJob instead
 * Analyze document (legacy method - use createAIJob with jobType: 'analyze')
 */
export const analyzeDocument = async (
  data: AnalyzeDocumentRequest
): Promise<ApiSuccessResponse<AIJobResponse>> => {
  return createAIJob({
    jobType: 'analyze',
    entityType: data.context === 'contracts' ? 'Contract' : 'Legislation',
    entityId: data.fileId,
    input: {
      analysisType: data.analysisType || 'summarize',
    },
  })
}

/**
 * @deprecated Use getAIJob instead
 * Get analysis result (legacy method - use getAIJob)
 */
export const getAnalysisResult = async (
  jobId: string
): Promise<ApiSuccessResponse<AnalysisResult>> => {
  return getAIJob(jobId)
}
