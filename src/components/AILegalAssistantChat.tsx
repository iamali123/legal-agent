import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  FileText,
  CheckCircle2,
  Paperclip,
  Send,
  Plus,
  History,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  useSendChatMessage,
  useChatHistory,
  useCreateConversation,
  useSendMessageStream,
  useConversation,
  useConversations,
  useInjectMessage,
} from '@/hooks/api'
import { useQueryClient } from '@tanstack/react-query'
import { aiAssistantKeys } from '@/hooks/api/useAIAssistant'
import { CheckCompliancePanel } from '@/components/CheckCompliancePanel'
import { SummarizePanel } from '@/components/SummarizePanel'
import { useTranslation } from 'react-i18next'

const SUGGESTED_ACTIONS = [
  { labelKey: 'ai.summarize', icon: FileText },
  { labelKey: 'ai.checkCompliance', icon: CheckCircle2 },
] as const

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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<'chat' | 'check-compliance' | 'summarize'>('chat')
  const [streamingContent, setStreamingContent] = useState('')
  const [waitingForAI, setWaitingForAI] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const expectedCountWhenWaitingRef = useRef<number>(0)

  // Conversation management hooks
  const createConversationMutation = useCreateConversation()
  const sendMessageStreamMutation = useSendMessageStream()
  const injectMutation = useInjectMessage()
  const { data: conversationData, isLoading: conversationLoading } = useConversation(
    conversationId ?? ''
  )
  const { data: conversationsListData } = useConversations()
  const conversationsList = conversationsListData?.data ?? []

  // Legacy hooks for backward compatibility
  const sendMutation = useSendChatMessage()
  const { data: historyData, isLoading: historyLoading } = useChatHistory(conversationId ?? '')

  // Prefer new API data; fallback to legacy
  const messages = conversationData?.data?.messages ?? historyData?.data?.messages ?? []
  const isLoadingMessages = conversationLoading || historyLoading

  // Sync conversationId from response (first load)
  useEffect(() => {
    if (!conversationId) {
      if (conversationData?.data?.id) setConversationId(conversationData.data.id)
      else if (historyData?.data?.conversationId)
        setConversationId(historyData.data.conversationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationData?.data?.id, historyData?.data?.conversationId])

  // Auto-scroll to bottom when messages or streaming content update
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, streamingContent])

  // Poll when using legacy non-streaming path
  useEffect(() => {
    if (!waitingForAI || !conversationId) return
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: aiAssistantKeys.conversation(conversationId) })
    }, 2000)
    return () => clearInterval(interval)
  }, [waitingForAI, conversationId, queryClient])

  useEffect(() => {
    if (!waitingForAI) return
    const last = messages[messages.length - 1]
    const expected = expectedCountWhenWaitingRef.current
    if (last?.role === 'assistant' && messages.length >= expected) setWaitingForAI(false)
  }, [messages, waitingForAI])

  // Close history dropdown on outside click
  useEffect(() => {
    if (!showHistory) return
    const handleClick = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showHistory])

  // ── Ensure a conversation exists, then return its id ──────────────────────
  const ensureConversation = useCallback(
    async (title?: string): Promise<string> => {
      if (conversationId) return conversationId
      const conv = await createConversationMutation.mutateAsync({
        title: title?.slice(0, 60) || t('ai.newConversation'),
        context: context ? { topic: context } : undefined,
      })
      const id = conv.data.id
      setConversationId(id)
      return id
    },
    [conversationId, createConversationMutation, context]
  )

  // ── Send a chat message (streaming) ─────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim()
    if (!text || sendMessageStreamMutation.isPending || sendMutation.isPending) return
    setInput('')
    setStreamingContent('')

    try {
      const convId = await ensureConversation(text.length > 50 ? `${text.slice(0, 50)}…` : text)
      sendMessageStreamMutation.mutate(
        {
          conversationId: convId,
          data: { content: text },
          onToken: (token) => setStreamingContent((prev) => prev + token),
        },
        {
          onSettled: () => setStreamingContent(''),
        }
      )
    } catch {
      sendMutation.mutate(
        { message: text, context, conversationId: conversationId ?? undefined },
        {
          onSuccess: (res) => {
            if (res?.data?.conversationId && !conversationId)
              setConversationId(res.data.conversationId)
            expectedCountWhenWaitingRef.current = messages.length + 1
            setWaitingForAI(true)
          },
        }
      )
    }
  }

  // ── Panel result injection ─────────────────────────────────────────────────
  const handlePanelClose = useCallback(
    async (resultText?: string) => {
      setActiveMode('chat')
      if (!resultText) return
      try {
        const convId = await ensureConversation(
          resultText.split('\n')[0].replace(/[*_📄✅🔴🟡🔵💚]/g, '').trim().slice(0, 60) ||
            t('ai.analysisResult')
        )
        injectMutation.mutate({ conversationId: convId, content: resultText })
      } catch {
        // silent — panel still closes
      }
    },
    [ensureConversation, injectMutation]
  )

  // ── Start a new chat ───────────────────────────────────────────────────────
  const handleNewChat = () => {
    setConversationId(null)
    setActiveMode('chat')
    setStreamingContent('')
    setWaitingForAI(false)
    setShowHistory(false)
  }

  // ── Switch to a previous conversation ─────────────────────────────────────
  const handleSelectConversation = (id: string) => {
    setConversationId(id)
    setActiveMode('chat')
    setShowHistory(false)
    setStreamingContent('')
    setWaitingForAI(false)
  }

  const handleSuggestedAction = (labelKey: string) => {
    if (labelKey === t('ai.checkCompliance')) { setActiveMode('check-compliance'); return }
    if (labelKey === t('ai.summarize')) { setActiveMode('summarize'); return }
    setInput((prev) => (prev ? `${prev} ${labelKey}` : labelKey))
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  const isBusy =
    waitingForAI ||
    sendMutation.isPending ||
    sendMessageStreamMutation.isPending ||
    createConversationMutation.isPending ||
    injectMutation.isPending

  const showWelcome =
    !conversationId && messages.length === 0 && !isBusy

  const messageList = (
    <div className="flex flex-col gap-4">
      {showWelcome && (
        <div className="flex gap-2">
          <div className="flex items-start gap-2 max-w-[85%]">
            <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-brand-accent-dark mb-1">{t('app.aiAssistant')}</p>
              <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-foreground">
                {t('ai.welcomeMessage')}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoadingMessages && conversationId && (
        <div className="flex gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5" />
          <p className="text-sm text-brand-muted-text-dark">{t('ai.loadingConversation')}</p>
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
                <p className="text-xs font-medium text-brand-accent-dark mb-1">{t('app.aiAssistant')}</p>
                <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {(isBusy || streamingContent) && (
        <div className="flex gap-2">
          <div className="flex items-start gap-2 max-w-[85%]">
            <Sparkles
              className={cn(
                'w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5',
                !streamingContent && 'animate-pulse'
              )}
            />
            <div>
              <p className="text-xs font-medium text-brand-accent-dark mb-1">AI Assistant</p>
              <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                {streamingContent || t('ai.thinking')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const suggestedActionsBar = (size: 'sm' | 'base') => (
    <div className={cn('flex flex-wrap gap-2', size === 'base' ? 'px-6 py-4' : 'px-4 py-2')}>
      {SUGGESTED_ACTIONS.map(({ labelKey, icon: Icon }) => (
        <button
          key={labelKey}
          type="button"
          onClick={() => handleSuggestedAction(t(labelKey))}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-white/10 text-brand-accent-dark border border-brand-accent-dark/20 hover:bg-white/20 transition-colors',
            size === 'base' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'
          )}
        >
          <Icon className="w-4 h-4 text-brand-accent-dark" />
          {t(labelKey)}
        </button>
      ))}
    </div>
  )

  // ── Header ─────────────────────────────────────────────────────────────────
  const header = (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[rgba(0,217,255,0.2)] to-[rgba(0,168,181,0.2)] border-b border-[#00D9FF4D] shrink-0',
        !embedded && 'rounded-t-xl'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="w-5 h-5 text-brand-accent-dark shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white text-base">{t('ai.legalAssistant')}</h2>
            {embedded && <div className="w-2 h-2 rounded-full bg-green-400" />}
          </div>
          <p className="text-xs text-brand-accent-dark/60 truncate uppercase">{context}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* New chat */}
        <button
          type="button"
          onClick={handleNewChat}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={t('ai.ariaNewChat')}
          title={t('ai.ariaNewChat')}
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Conversation history dropdown */}
        <div className="relative" ref={historyRef}>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
            aria-label={t('ai.ariaChatHistory')}
            title={t('ai.ariaChatHistory')}
          >
            <History className="w-4 h-4" />
            {conversationsList.length > 0 && (
              <ChevronDown className={cn('w-3 h-3 transition-transform', showHistory && 'rotate-180')} />
            )}
          </button>

          {showHistory && conversationsList.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-[#0A1628] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 text-[10px] text-white/40 uppercase font-semibold border-b border-white/10">
                {t('ai.recentConversations')}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {conversationsList.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 transition-colors truncate',
                      conv.id === conversationId
                        ? 'text-brand-accent-dark bg-white/5'
                        : 'text-white/70'
                    )}
                  >
                    {conv.title || t('ai.untitledChat')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!embedded && (
          <>
            <button
              type="button"
              onClick={onExpandToggle}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isExpanded ? t('ai.ariaMinimize') : t('ai.ariaExpand')}
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('ai.ariaClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )

  // ── Main content ───────────────────────────────────────────────────────────
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
      {header}

      {activeMode === 'summarize' ? (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <SummarizePanel onClose={handlePanelClose} />
        </div>
      ) : activeMode === 'check-compliance' ? (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <CheckCompliancePanel onClose={handlePanelClose} />
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
            <div
              ref={scrollRef}
              className={cn('flex-1 overflow-y-auto', embedded ? 'p-6' : 'p-4')}
            >
              {embedded ? (
                <div className="flex-1 flex flex-col gap-4 min-w-0">{messageList}</div>
              ) : (
                messageList
              )}
            </div>

            <div
              className={cn(
                'border-t border-brand-accent-dark/20 shrink-0',
                embedded ? '' : ''
              )}
            >
              {suggestedActionsBar(embedded ? 'base' : 'sm')}
            </div>
          </div>

          <div className={cn('border-t border-border bg-card shrink-0', embedded ? 'p-4' : 'p-3')}>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={t('ai.ariaAttachFile')}
                className="text-brand-accent-dark border border-brand-accent-dark/20 rounded-xl p-2 hover:bg-brand-accent-dark/20 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={t('ai.askPlaceholder')}
                className="flex-1 rounded-xl border-border bg-background"
              />
              <Button
                type="button"
                size="icon"
                className="shrink-0"
                aria-label={t('ai.ariaSend')}
                onClick={handleSend}
                disabled={!input.trim() || isBusy}
              >
                <Send className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (embedded) {
    return <div className="flex flex-col w-full h-full min-h-0">{chatContent}</div>
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
