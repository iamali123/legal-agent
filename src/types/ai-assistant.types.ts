/**
 * AI Assistant Types
 * Aligns with backend enums where applicable.
 */

/** Backend enum ChatMessages.role */
export type ChatMessageRole = 'user' | 'assistant'

/** Backend enum AiJobs.jobType */
export type AIJobType = 'generate_draft' | 'analyze' | 'chat'

/** Backend enum AiJobs.status */
export type AIJobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export type AnalysisType = 'summarize' | 'analyze_risks' | 'check_compliance' | 'draft_document'

export interface ChatMessageRequest {
  message: string
  context?: string
  conversationId?: string
  attachments?: Array<{
    fileId: string
    fileName: string
  }>
}

export interface ChatResponse {
  conversationId: string
  messageId: string
  response: string
  suggestedActions: Array<{
    label: string
    type: string
  }>
  timestamp: string
}

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: string
  attachments?: Array<{
    fileId: string
    fileName: string
  }> | null
}

export interface Conversation {
  id: string
  title: string
  context?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export interface ChatHistory {
  id: string
  title: string
  context?: Record<string, unknown>
  messages: ChatMessage[]
  createdAt: string
  updatedAt?: string
  // Legacy field for backward compatibility
  conversationId?: string
}

export interface CreateConversationRequest {
  title?: string
  context?: Record<string, unknown>
}

export interface SendMessageRequest {
  content: string
}

export interface AnalyzeDocumentRequest {
  fileId: string
  analysisType: AnalysisType
  context?: string
}

export interface AIJobResponse {
  jobId: string
  status: AIJobStatus
  estimatedTime: number
  legislationId?: string | null
  contractId?: string | null
  agreementId?: string | null
}

export interface AnalysisResult {
  jobId: string
  status: AIJobStatus
  analysisType: AnalysisType
  result?: {
    summary: string
    keyPoints: string[]
    recommendations: string[]
  }
  completedAt?: string | null
}

export interface ChatHistoryParams {
  limit?: number
}
