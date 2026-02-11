/**
 * AI Assistant Types
 */

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
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  attachments?: Array<{
    fileId: string
    fileName: string
  }> | null
}

export interface ChatHistory {
  conversationId: string
  messages: ChatMessage[]
}

export interface AnalyzeDocumentRequest {
  fileId: string
  analysisType: AnalysisType
  context?: string
}

export interface AIJobResponse {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  estimatedTime: number
  legislationId?: string | null
  contractId?: string | null
  agreementId?: string | null
}

export interface AnalysisResult {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
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
