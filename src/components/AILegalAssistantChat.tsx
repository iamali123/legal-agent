import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  PenLine,
  Paperclip,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  useSendChatMessage,
  useChatHistory,
  useCreateConversation,
  useSendMessage,
  useConversation,
} from '@/hooks/api'

const SUGGESTED_ACTIONS = [
  { label: 'Summarize', icon: FileText },
  { label: 'Analyze Risks', icon: AlertTriangle },
  { label: 'Check Compliance', icon: CheckCircle2 },
  { label: 'Draft Document', icon: PenLine },
] as const

const WELCOME_MESSAGE = "Hi! I'm your AI Legal Assistant. How can I help you today? You can ask me to summarize documents, analyze risks, check compliance, or draft legal text."

interface AILegalAssistantChatProps {
  isOpen?: boolean
  onClose?: () => void
  isExpanded?: boolean
  onExpandToggle?: () => void
  /** Context label shown in header, e.g. "AGREEMENTS", "DASHBOARD" */
  context?: string
  /** When true, render as full-width page content (no overlay, no close) */
  embedded?: boolean
}

export function AILegalAssistantChat({
  isOpen = true,
  onClose = () => {},
  isExpanded = false,
  onExpandToggle = () => {},
  context = 'DASHBOARD',
  embedded = false,
}: AILegalAssistantChatProps) {
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Use new API hooks when conversationId exists, fallback to legacy for backward compatibility
  const createConversationMutation = useCreateConversation()
  const sendMessageMutation = useSendMessage()
  const { data: conversationData, isLoading: conversationLoading } = useConversation(
    conversationId ?? ''
  )
  
  // Legacy hooks for backward compatibility
  const sendMutation = useSendChatMessage()
  const { data: historyData, isLoading: historyLoading } = useChatHistory(conversationId ?? '')
  
  // Prefer new API data if available, fallback to legacy
  // Handle both response structures: ChatHistory with id or conversationId
  const messages =
    conversationData?.data?.messages ?? historyData?.data?.messages ?? []
  const isLoadingMessages = conversationLoading || historyLoading
  
  // Update conversationId from response if available (only once)
  useEffect(() => {
    if (!conversationId) {
      if (conversationData?.data?.id) {
        setConversationId(conversationData.data.id)
      } else if (historyData?.data?.conversationId) {
        setConversationId(historyData.data.conversationId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationData?.data?.id, historyData?.data?.conversationId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || (sendMutation.isPending && sendMessageMutation.isPending)) return

    setInput('')

    // If we have a conversationId, use the new API structure
    if (conversationId) {
      sendMessageMutation.mutate(
        {
          conversationId,
          data: { content: text },
        },
        {
          onSuccess: () => {
            // Conversation will be refetched automatically via query invalidation
          },
        }
      )
      return
    }

    // Otherwise, create a new conversation first, then send the message
    try {
      const conversation = await createConversationMutation.mutateAsync({
        title: text.length > 50 ? `${text.substring(0, 50)}...` : text,
        context: context ? { topic: context } : undefined,
      })

      if (conversation.data.id) {
        setConversationId(conversation.data.id)
        // Send the first message
        sendMessageMutation.mutate({
          conversationId: conversation.data.id,
          data: { content: text },
        })
      }
    } catch (error) {
      // Fallback to legacy method if new API fails
      sendMutation.mutate(
        {
          message: text,
          context,
          conversationId: conversationId ?? undefined,
        },
        {
          onSuccess: (res) => {
            if (res?.data?.conversationId && !conversationId) {
              setConversationId(res.data.conversationId)
            }
          },
        }
      )
    }
  }

  const handleSuggestedAction = (label: string) => {
    setInput((prev) => (prev ? `${prev} ${label}` : label))
  }

  const showWelcome =
    !conversationId &&
    messages.length === 0 &&
    !sendMutation.isPending &&
    !sendMessageMutation.isPending &&
    !createConversationMutation.isPending

  const messageList = (
    <div className="flex flex-col gap-4">
      {showWelcome && (
        <div className="flex gap-2">
          <div className="flex items-start gap-2 max-w-[85%]">
            <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-brand-accent-dark mb-1">AI Assistant</p>
              <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-foreground">
                {WELCOME_MESSAGE}
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoadingMessages && conversationId && (
        <div className="flex gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5" />
          <p className="text-sm text-brand-muted-text-dark">Loading conversation...</p>
        </div>
      )}
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <div key={msg.id} className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="rounded-xl rounded-tr-sm bg-[#0f2744] px-4 py-3 text-sm text-white">
                {msg.content}
              </div>
            </div>
          </div>
        ) : (
          <div key={msg.id} className="flex gap-2">
            <div className="flex items-start gap-2 max-w-[85%]">
              <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-brand-accent-dark mb-1">AI Assistant</p>
                <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {(sendMutation.isPending || sendMessageMutation.isPending || createConversationMutation.isPending) && (
        <div className="flex gap-2">
          <div className="flex items-start gap-2 max-w-[85%]">
            <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5 animate-pulse" />
            <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-brand-muted-text-dark">
              Thinking...
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const chatContent = (
    <div
      className={cn(
        'flex flex-col bg-gradient-to-b from-[#0A1628] to-[#020817] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden',
        !embedded && 'rounded-xl',
        !embedded && !isExpanded && 'w-[380px] h-[540px]',
        !embedded && isExpanded && 'w-full max-w-3xl h-[85vh] max-h-[700px]',
        embedded && 'w-full h-full min-h-0 flex-1'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-[rgba(0,217,255,0.2)] to-[rgba(0,168,181,0.2)] border-b border-[#00D9FF4D] shrink-0',
          !embedded && 'rounded-t-xl'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="w-5 h-5 text-brand-accent-dark" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-base">AI Legal Assistant</h2>
              {embedded && (
                <div className="w-2 h-2 rounded-full bg-green-400" />
              )}
            </div>
            <p className="text-xs text-brand-accent-dark/60 truncate uppercase">{context}</p>
          </div>
        </div>
        {!embedded && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onExpandToggle}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
        <div
          ref={scrollRef}
          className={cn(
            'flex-1 overflow-y-auto',
            embedded ? 'p-6' : 'p-4'
          )}
        >
          {embedded ? (
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {messageList}
            </div>
          ) : (
            messageList
          )}
        </div>

        {embedded && (
          <div className="px-6 py-4 border-t border-brand-accent-dark/20 shrink-0">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_ACTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSuggestedAction(label)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-brand-accent-dark border border-brand-accent-dark/20 text-sm hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-brand-accent-dark" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!embedded && (
          <div className="px-4 py-2 border-t border-brand-accent-dark/20 shrink-0">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_ACTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSuggestedAction(label)}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-xl bg-white/10 text-brand-accent-dark border border-brand-accent-dark/20 text-xs hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-brand-accent-dark" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          'border-t border-border bg-card shrink-0',
          embedded ? 'p-4' : 'p-3'
        )}
      >
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Attach file"
            className="text-brand-accent-dark border border-brand-accent-dark/20 rounded-xl p-2 hover:bg-brand-accent-dark/20 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 rounded-xl border-border bg-background"
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            aria-label="Send"
            onClick={handleSend}
            disabled={
              !input.trim() ||
              sendMutation.isPending ||
              sendMessageMutation.isPending ||
              createConversationMutation.isPending
            }
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div className="flex flex-col w-full h-full min-h-0">
        {chatContent}
      </div>
    )
  }

  if (isExpanded) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div
              className="flex items-center justify-center w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {chatContent}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-4 right-8 z-40" style={{ marginRight: 0 }}>
          {chatContent}
        </div>
      )}
    </>
  )
}
