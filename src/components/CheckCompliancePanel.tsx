/**
 * CheckCompliancePanel
 *
 * Workflow:
 *  Step 1 – Chat:    AI gathers company name + auditor name only.
 *  Step 2 – Docs:    Upload company documents for audit (then auto-attach once processed).
 *  Step 3 – Law:     Pick a law/policy from already-processed ai-docs (radio list).
 *  Step 4 – Run:     Trigger audit; poll for completion.
 *  Step 5 – Results: Display findings (Major NC, Minor NC, OFI, Pass, Strength).
 */

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  ArrowLeft,
  FileCheck2,
  UploadCloud,
  Scale,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  FileText,
  Trash2,
  MessageSquare,
  FileSignature,
  ScrollText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  useCreateComplianceSession,
  useSendComplianceMessage,
  useComplianceSession,
  useAttachComplianceDocs,
  useSetComplianceLaw,
  useRunComplianceAudit,
} from '@/hooks/api/useCompliance'
import { useAiDocs } from '@/hooks/api/useAIDocs'
import { useAgreements } from '@/hooks/api/useAgreements'
import { useContracts } from '@/hooks/api/useContracts'
import { uploadLawPolicyDocument } from '@/services/law-policy.service'
import * as agreementService from '@/services/agreement.service'
import * as contractService from '@/services/contract.service'
import type { ComplianceFinding } from '@/types/compliance.types'
import type { AiDoc } from '@/types/ai-doc.types'
import type { Agreement } from '@/types/agreement.types'
import type { Contract } from '@/types/contract.types'

type Step = 'chat' | 'docs' | 'law' | 'run' | 'results'

const STEP_LABELS: Record<Step, string> = {
  chat: 'Gather Info',
  docs: 'Upload Documents',
  law: 'Select Law / Policy',
  run: 'Run Audit',
  results: 'Results',
}

const CLASSIFICATION_META: Record<
  ComplianceFinding['classification'],
  { color: string; icon: React.FC<{ className?: string }>; badge: string }
> = {
  'Major NC': {
    color: 'text-red-400',
    icon: XCircle,
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  'Minor NC': {
    color: 'text-yellow-400',
    icon: AlertTriangle,
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  OFI: {
    color: 'text-blue-400',
    icon: AlertTriangle,
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  Strength: {
    color: 'text-green-400',
    icon: CheckCircle2,
    badge: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  Pass: {
    color: 'text-emerald-400',
    icon: CheckCircle2,
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
}

interface UploadedDoc {
  file: File
  docId: string | null   // set once upload API responds
  status: 'uploading' | 'processing' | 'processed' | 'error'
  error?: string
  sourceType?: 'agreement' | 'contract'
  sourceId?: string
}

// ── Format compliance results as chat-ready text ──────────────────────────────

function formatComplianceForChat(
  results: { findings: ComplianceFinding[]; audit_narrative?: string },
  companyName?: string
): string {
  const findings = results.findings.filter((f) => f.source_docs?.length > 0)
  const counts: Record<string, number> = {
    'Major NC': 0, 'Minor NC': 0, OFI: 0, Strength: 0, Pass: 0,
  }
  findings.forEach((f) => {
    if (f.classification in counts) counts[f.classification]++
  })

  const lines: string[] = [
    `✅ **Compliance Audit Complete${companyName ? `: ${companyName}` : ''}**`,
    '',
    `🔴 Major NC: **${counts['Major NC']}**  ·  🟡 Minor NC: **${counts['Minor NC']}**  ·  🔵 OFI: **${counts['OFI']}**  ·  💚 Strength: **${counts['Strength']}**  ·  ✅ Pass: **${counts['Pass']}**`,
  ]

  if (results.audit_narrative) {
    lines.push('', '**Audit Narrative**', results.audit_narrative)
  }

  const grouped: Record<string, ComplianceFinding[]> = {
    'Major NC': [], 'Minor NC': [], OFI: [], Strength: [], Pass: [],
  }
  findings.forEach((f) => grouped[f.classification]?.push(f))

  for (const cls of ['Major NC', 'Minor NC', 'OFI', 'Strength', 'Pass']) {
    const items = grouped[cls]
    if (!items?.length) continue
    lines.push('', `**${cls}**`)
    items.forEach((f) => lines.push(`• [${f.clause_id}] ${f.justification}`))
  }

  lines.push('', '*You can now ask me questions about these findings.*')
  return lines.join('\n')
}

interface Props {
  onClose: (resultText?: string) => void
}

export function CheckCompliancePanel({ onClose }: Props) {
  const [step, setStep] = useState<Step>('chat')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "Welcome to the Smart Compliance Audit! I'll help you run a clause-by-clause compliance check.\n\nLet's start — what is your company name?",
    },
  ])
  const [chatInput, setChatInput] = useState('')

  // ── Docs step state ───────────────────────────────────────────────────────
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Law step state ────────────────────────────────────────────────────────
  const [selectedLawDocId, setSelectedLawDocId] = useState<string | null>(null)

  // ── Results state ─────────────────────────────────────────────────────────
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const createSession   = useCreateComplianceSession()
  const sendMessage     = useSendComplianceMessage()
  const attachDocs      = useAttachComplianceDocs()
  const setLaw          = useSetComplianceLaw()
  const runAudit        = useRunComplianceAudit()

  // Poll session when running / completed
  const { data: sessionData } = useComplianceSession(sessionId)

  // All processed ai-docs — used for law/policy selection
  const { data: aiDocsData, refetch: refetchDocs } = useAiDocs({ status: 'processed' })
  const processedDocs: AiDoc[] = aiDocsData?.docs ?? []

  // Agreements and contracts for docs step
  const { data: agreementsData } = useAgreements()
  const { data: contractsData } = useContracts()
  const agreements = agreementsData?.data?.items ?? []
  const contracts = contractsData?.data?.items ?? []

  // Auto-advance to results once audit completes
  useEffect(() => {
    if (sessionData?.status === 'completed' && step === 'run') {
      setStep('results')
    }
  }, [sessionData?.status, step])

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  // Poll processing status for uploaded docs
  useEffect(() => {
    if (step !== 'docs') return
    const pending = uploadedDocs.filter((d) => d.status === 'processing' && d.docId)
    if (!pending.length) return

    const interval = setInterval(async () => {
      await refetchDocs()
      setUploadedDocs((prev) =>
        prev.map((ud) => {
          if (ud.status !== 'processing' || !ud.docId) return ud
          const found = processedDocs.find((d) => d.id === ud.docId)
          if (found?.status === 'processed') return { ...ud, status: 'processed' as const }
          if (found?.status === 'error') return { ...ud, status: 'error' as const, error: found.error_msg ?? 'Processing failed' }
          return ud
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [step, uploadedDocs, processedDocs, refetchDocs])

  // ── Chat step ─────────────────────────────────────────────────────────────

  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || sendMessage.isPending) return
    setChatInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    try {
      let sid = sessionId
      if (!sid) {
        const created = await createSession.mutateAsync({})
        sid = created.session_id
        setSessionId(sid)
      }

      const resp = await sendMessage.mutateAsync({ sessionId: sid, content: text })
      setMessages((prev) => [...prev, { role: 'assistant', content: resp.reply }])

      if (resp.info_complete) {
        setTimeout(() => setStep('docs'), 600)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${msg}` },
      ])
    }
  }

  // ── Docs step ─────────────────────────────────────────────────────────────

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    // Ensure we have a session
    let sid = sessionId
    if (!sid) {
      const created = await createSession.mutateAsync({})
      sid = created.session_id
      setSessionId(sid)
    }

    for (const file of files) {
      const placeholder: UploadedDoc = { file, docId: null, status: 'uploading' }
      setUploadedDocs((prev) => [...prev, placeholder])

      try {
        const result: any = await uploadLawPolicyDocument(file)

        const docId: string =
          result?.data?.id ??
          result?.data?.doc_id ??
          result?.id

        setUploadedDocs((prev) =>
          prev.map((d) =>
            d.file === file
              ? { ...d, docId: docId ?? null, status: docId ? 'processing' : 'error', error: docId ? undefined : 'No doc ID returned' }
              : d
          )
        )
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setUploadedDocs((prev) =>
          prev.map((d) => (d.file === file ? { ...d, status: 'error', error: msg } : d))
        )
      }
    }
  }

  const handleRemoveDoc = (file: File) => {
    setUploadedDocs((prev) => prev.filter((d) => d.file !== file))
  }

  const contentToFile = (content: string, filename: string): File => {
    const blob = new Blob([content], { type: 'text/plain' })
    return new File([blob], filename, { type: 'text/plain' })
  }

  const handleAddAgreement = async (agreement: Agreement) => {
    try {
      const res = await agreementService.getAgreement(agreement.id)
      const a = res.data
      const content = [
        `Agreement: ${a.title}`,
        `Parties: ${a.parties}`,
        `Type: ${a.type}`,
        `Date: ${a.date}`,
        a.purposeAndObjectives ? `Purpose: ${a.purposeAndObjectives}` : '',
        '',
        a.content || '(No content)',
      ]
        .filter(Boolean)
        .join('\n\n')
      const file = contentToFile(content, `agreement-${a.title.replace(/\s+/g, '-')}.txt`)
      const placeholder: UploadedDoc = {
        file,
        docId: null,
        status: 'uploading',
        sourceType: 'agreement',
        sourceId: agreement.id,
      }
      setUploadedDocs((prev) => [...prev, placeholder])
      const result: any = await uploadLawPolicyDocument(file, {
        entityType: 'Agreement',
        entityId: agreement.id,
      })
      const docId = result?.data?.id ?? result?.data?.doc_id ?? result?.id
      setUploadedDocs((prev) =>
        prev.map((d) =>
          d.sourceId === agreement.id && d.sourceType === 'agreement'
            ? { ...d, docId: docId ?? null, status: docId ? 'processing' : 'error', error: docId ? undefined : 'No doc ID returned' }
            : d
        )
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadedDocs((prev) =>
        prev.map((d) =>
          d.sourceId === agreement.id && d.sourceType === 'agreement'
            ? { ...d, status: 'error', error: msg }
            : d
        )
      )
    }
  }

  const handleAddContract = async (contract: Contract) => {
    try {
      const res = await contractService.getContract(contract.id)
      const c = res.data
      const keyTerms = typeof c.keyTerms === 'string' ? c.keyTerms : JSON.stringify(c.keyTerms || {}, null, 2)
      const content = [
        `Contract: ${c.title}`,
        `Counterparty: ${c.counterparty}`,
        `Type: ${c.type}`,
        `Value: ${c.value}`,
        `Period: ${c.startDate} – ${c.endDate}`,
        c.keyTerms ? `Key Terms: ${keyTerms}` : '',
        '',
        c.content || '(No content)',
      ]
        .filter(Boolean)
        .join('\n\n')
      const file = contentToFile(content, `contract-${c.title.replace(/\s+/g, '-')}.txt`)
      const placeholder: UploadedDoc = {
        file,
        docId: null,
        status: 'uploading',
        sourceType: 'contract',
        sourceId: contract.id,
      }
      setUploadedDocs((prev) => [...prev, placeholder])
      const result: any = await uploadLawPolicyDocument(file, {
        entityType: 'Contract',
        entityId: contract.id,
      })
      const docId = result?.data?.id ?? result?.data?.doc_id ?? result?.id
      setUploadedDocs((prev) =>
        prev.map((d) =>
          d.sourceId === contract.id && d.sourceType === 'contract'
            ? { ...d, docId: docId ?? null, status: docId ? 'processing' : 'error', error: docId ? undefined : 'No doc ID returned' }
            : d
        )
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadedDocs((prev) =>
        prev.map((d) =>
          d.sourceId === contract.id && d.sourceType === 'contract'
            ? { ...d, status: 'error', error: msg }
            : d
        )
      )
    }
  }

  const allDocsProcessed =
    uploadedDocs.length > 0 &&
    uploadedDocs.every((d) => d.status === 'processed' || d.status === 'error')

  const processedUploadedDocIds = uploadedDocs
    .filter((d) => d.status === 'processed' && d.docId)
    .map((d) => d.docId as string)

  const handleDocsConfirm = async () => {
    if (!sessionId || processedUploadedDocIds.length === 0) return
    try {
      await attachDocs.mutateAsync({ sessionId, docIds: processedUploadedDocIds })
      setStep('law')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to attach documents')
    }
  }

  // ── Law step ──────────────────────────────────────────────────────────────

  const handleLawConfirm = async () => {
    if (!sessionId || !selectedLawDocId) return
    const doc = processedDocs.find((d) => d.id === selectedLawDocId)
    try {
      await setLaw.mutateAsync({
        sessionId,
        lawPolicyDocId: selectedLawDocId,
        lawPolicyLabel: doc?.filename,
      })
      setStep('run')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to set law/policy')
    }
  }

  // ── Run step ──────────────────────────────────────────────────────────────

  const handleRunAudit = async () => {
    if (!sessionId) return
    try {
      await runAudit.mutateAsync({ sessionId })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start audit')
    }
  }

  // ── Shared rendering helpers ──────────────────────────────────────────────

  const results = sessionData?.results

  const uploadStatusIcon = (status: UploadedDoc['status']) => {
    if (status === 'uploading' || status === 'processing')
      return <Loader2 className="w-4 h-4 animate-spin text-brand-accent-dark shrink-0" />
    if (status === 'processed')
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    return <XCircle className="w-4 h-4 text-red-400 shrink-0" />
  }

  const uploadStatusLabel: Record<UploadedDoc['status'], string> = {
    uploading: 'Uploading…',
    processing: 'Processing…',
    processed: 'Ready',
    error: 'Error',
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[rgba(0,217,255,0.15)] to-[rgba(0,168,181,0.15)] border-b border-[#00D9FF4D] shrink-0">
        <button
          type="button"
          onClick={() => onClose()}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <FileCheck2 className="w-5 h-5 text-brand-accent-dark" />
        <div>
          <h2 className="font-semibold text-white text-base">Smart Compliance Audit</h2>
          <p className="text-xs text-brand-accent-dark/60 uppercase">Check Compliance</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-1 px-6 py-3 border-b border-brand-accent-dark/10 shrink-0 overflow-x-auto">
        {(Object.keys(STEP_LABELS) as Step[]).map((s, i) => {
          const steps = Object.keys(STEP_LABELS) as Step[]
          const currentIdx = steps.indexOf(step)
          const thisIdx = steps.indexOf(s)
          const done = thisIdx < currentIdx
          const active = s === step

          return (
            <div key={s} className="flex items-center gap-1 shrink-0">
              {i > 0 && <div className="w-4 h-px bg-white/10" />}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  active && 'bg-brand-accent-dark/20 text-brand-accent-dark border border-brand-accent-dark/30',
                  done && 'text-emerald-400',
                  !active && !done && 'text-white/30'
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    {thisIdx + 1}
                  </span>
                )}
                {STEP_LABELS[s]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* ── STEP: Chat ── */}
        {step === 'chat' && (
          <div className="flex flex-col h-full min-h-0">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-[#0f2744] px-4 py-3 text-sm text-white">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-2">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-brand-accent-dark mb-1">AI Auditor</p>
                        <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
              {sendMessage.isPending && (
                <div className="flex gap-2">
                  <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0 mt-0.5 animate-pulse" />
                  <div className="rounded-xl rounded-tl-sm bg-[#0A1628E5] border border-brand-accent-dark/20 px-4 py-3 text-sm text-brand-muted-text-dark">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {sessionId && (
              <div className="px-6 pb-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep('docs')}
                  className="text-xs text-brand-accent-dark/60 hover:text-brand-accent-dark underline"
                >
                  Skip →
                </button>
              </div>
            )}

            <div className="p-4 border-t border-border bg-card shrink-0">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                  placeholder="Type your answer..."
                  className="flex-1 rounded-xl border-border bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || sendMessage.isPending}
                  className="shrink-0"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: Upload Company Documents ── */}
        {step === 'docs' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Upload Company Documents</h3>
              <p className="text-xs text-white/50">
                Add documents from Agreements, Contracts, or upload files. Each will be processed by AI before the audit runs.
              </p>
            </div>

            {/* Agreements */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-brand-accent-dark" />
                <span className="text-sm font-medium text-white">Agreements</span>
              </div>
              <div className="p-3 max-h-32 overflow-y-auto">
                {agreements.length === 0 ? (
                  <p className="text-xs text-white/40">No agreements found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {agreements.map((a) => {
                      const added = uploadedDocs.some((d) => d.sourceType === 'agreement' && d.sourceId === a.id)
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => !added && handleAddAgreement(a)}
                          disabled={added}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            added
                              ? 'bg-white/10 text-white/40 cursor-not-allowed'
                              : 'bg-brand-accent-dark/20 text-brand-accent-dark hover:bg-brand-accent-dark/30'
                          )}
                        >
                          {added ? '✓ Added' : `+ ${a.title}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Contracts */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-brand-accent-dark" />
                <span className="text-sm font-medium text-white">Contracts</span>
              </div>
              <div className="p-3 max-h-32 overflow-y-auto">
                {contracts.length === 0 ? (
                  <p className="text-xs text-white/40">No contracts found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {contracts.map((c) => {
                      const added = uploadedDocs.some((d) => d.sourceType === 'contract' && d.sourceId === c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => !added && handleAddContract(c)}
                          disabled={added}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            added
                              ? 'bg-white/10 text-white/40 cursor-not-allowed'
                              : 'bg-brand-accent-dark/20 text-brand-accent-dark hover:bg-brand-accent-dark/30'
                          )}
                        >
                          {added ? '✓ Added' : `+ ${c.title}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Manual upload */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-brand-accent-dark" />
                <span className="text-sm font-medium text-white">Upload Files</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-white/10 hover:border-brand-accent-dark/40 hover:bg-white/5 transition-colors"
              >
                <UploadCloud className="w-6 h-6 text-white/30" />
                <p className="text-sm text-white/60">Click to upload PDF, DOCX, TXT</p>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Uploaded file list */}
            {uploadedDocs.length > 0 && (
              <div className="flex flex-col gap-2">
                {uploadedDocs.map((ud) => (
                  <div
                    key={ud.file.name + ud.file.size}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <FileText className="w-4 h-4 text-white/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{ud.file.name}</p>
                      <p
                        className={cn(
                          'text-xs mt-0.5',
                          ud.status === 'processed' && 'text-emerald-400',
                          ud.status === 'error' && 'text-red-400',
                          (ud.status === 'uploading' || ud.status === 'processing') && 'text-brand-accent-dark/70'
                        )}
                      >
                        {ud.error ?? uploadStatusLabel[ud.status]}
                      </p>
                    </div>
                    {uploadStatusIcon(ud.status)}
                    {(ud.status === 'processed' || ud.status === 'error') && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(ud.file)}
                        className="p-1 rounded text-white/30 hover:text-white/70 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {uploadedDocs.some((d) => d.status === 'processing') && (
              <p className="text-xs text-brand-accent-dark/60 text-center animate-pulse">
                Documents are being processed by AI… this may take a moment.
              </p>
            )}

            <Button
              onClick={handleDocsConfirm}
              disabled={
                processedUploadedDocIds.length === 0 ||
                !allDocsProcessed ||
                attachDocs.isPending
              }
              className="mt-2"
            >
              {attachDocs.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Continue with {processedUploadedDocIds.length} document
              {processedUploadedDocIds.length !== 1 ? 's' : ''} →
            </Button>
          </div>
        )}

        {/* ── STEP: Select Law / Policy ── */}
        {step === 'law' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Select Law / Policy to Audit Against
              </h3>
              <p className="text-xs text-white/50">
                Choose the processed law or policy whose clauses will be used as the compliance standard.
              </p>
            </div>

            {processedDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-white/40 text-sm">
                <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No processed law/policy documents found. Upload one on the Laws &amp; Policy page first.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {processedDocs.map((doc) => {
                  const selected = selectedLawDocId === doc.id
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedLawDocId(doc.id)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors',
                        selected
                          ? 'bg-brand-accent-dark/15 border-brand-accent-dark/40 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                          selected
                            ? 'bg-brand-accent-dark border-brand-accent-dark'
                            : 'border-white/20'
                        )}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className="text-xs opacity-50">
                          {doc.section_count ?? 0} sections · {doc.clause_count ?? 0} clauses
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <Button
              onClick={handleLawConfirm}
              disabled={!selectedLawDocId || setLaw.isPending}
              className="mt-2"
            >
              {setLaw.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Law / Policy →
            </Button>
          </div>
        )}

        {/* ── STEP: Run ── */}
        {step === 'run' && (
          <div className="p-6 flex flex-col gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-white">Audit Configuration</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <span className="text-white/40">Company docs</span>
                <span className="text-white">{processedUploadedDocIds.length} document(s)</span>
                <span className="text-white/40">Law / Policy</span>
                <span className="text-white truncate">
                  {processedDocs.find((d) => d.id === selectedLawDocId)?.filename ?? selectedLawDocId}
                </span>
                <span className="text-white/40">Company</span>
                <span className="text-white">{sessionData?.company_name ?? '—'}</span>
                <span className="text-white/40">Auditor</span>
                <span className="text-white">{sessionData?.auditor_name ?? '—'}</span>
              </div>
            </div>

            {sessionData?.status === 'running' ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 text-brand-accent-dark animate-spin" />
                <p className="text-sm text-white/60 text-center">
                  Running Phase 0 (document summarization) and Phase 1 (clause-by-clause audit)…
                  <br />
                  This may take a few minutes.
                </p>
              </div>
            ) : sessionData?.status === 'error' ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
                Error: {sessionData.error}
              </div>
            ) : (
              <Button onClick={handleRunAudit} disabled={runAudit.isPending} className="w-full" size="lg">
                {runAudit.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Compliance Audit
              </Button>
            )}
          </div>
        )}

        {/* ── STEP: Results ── */}
        {step === 'results' && results && (
          <div className="p-6 flex flex-col gap-6">
            {/* Summary counts */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Audit Summary</h3>
              <div className="grid grid-cols-5 gap-2">
                {(
                  [
                    ['Major NC', 'bg-red-500/20 text-red-400 border-red-500/30'],
                    ['Minor NC', 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'],
                    ['OFI', 'bg-blue-500/20 text-blue-400 border-blue-500/30'],
                    ['Strength', 'bg-green-500/20 text-green-400 border-green-500/30'],
                    ['Pass', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'],
                  ] as [string, string][]
                ).map(([label, cls]) => (
                  <div
                    key={label}
                    className={cn(
                      'flex flex-col items-center rounded-xl border p-3 text-center',
                      cls
                    )}
                  >
                    <span className="text-2xl font-bold">
                      {results.findings.filter(
                        (f) => f.classification === label && f.source_docs?.length > 0
                      ).length}
                    </span>
                    <span className="text-[10px] mt-0.5 opacity-80">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Narrative */}
            {results.audit_narrative && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs font-semibold text-white/40 uppercase mb-2">Audit Narrative</p>
                <p className="text-sm text-white/80 whitespace-pre-wrap">{results.audit_narrative}</p>
              </div>
            )}

            {/* Findings grouped by classification */}
            {(['Major NC', 'Minor NC', 'OFI', 'Strength', 'Pass'] as ComplianceFinding['classification'][]).map(
              (cls) => {
                const items = results.findings.filter(
                  (f) => f.classification === cls && f.source_docs?.length > 0
                )
                if (!items.length) return null
                const meta = CLASSIFICATION_META[cls]

                return (
                  <div key={cls}>
                    <h4 className={cn('text-sm font-semibold mb-2', meta.color)}>{cls}</h4>
                    <div className="flex flex-col gap-2">
                      {items.map((finding) => {
                        const key = `${cls}-${finding.clause_id}`
                        const isExpanded = expandedFinding === key
                        return (
                          <div
                            key={finding.clause_id}
                            className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                          >
                            <button
                              type="button"
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                              onClick={() => setExpandedFinding(isExpanded ? null : key)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge
                                  className={cn(
                                    'text-[10px] font-mono shrink-0 border',
                                    meta.badge
                                  )}
                                >
                                  {finding.clause_id}
                                </Badge>
                                <span className="text-sm text-white/80 truncate">
                                  {finding.clause_summary}
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5">
                                <div>
                                  <p className="text-[10px] text-white/40 uppercase mb-1">Justification</p>
                                  <p className="text-sm text-white/80">{finding.justification}</p>
                                </div>
                                {finding.evidence_found && finding.evidence_found !== 'None' && (
                                  <div>
                                    <p className="text-[10px] text-white/40 uppercase mb-1">Evidence Found</p>
                                    <p className="text-sm text-white/70">{finding.evidence_found}</p>
                                  </div>
                                )}
                                {finding.evidence_gap && finding.evidence_gap !== 'None' && (
                                  <div>
                                    <p className="text-[10px] text-white/40 uppercase mb-1">Evidence Gap</p>
                                    <p className="text-sm text-red-400/80">{finding.evidence_gap}</p>
                                  </div>
                                )}
                                {finding.systemic_note && (
                                  <div>
                                    <p className="text-[10px] text-white/40 uppercase mb-1">Systemic Note</p>
                                    <p className="text-sm text-yellow-400/80">{finding.systemic_note}</p>
                                  </div>
                                )}
                                {finding.source_docs?.length > 0 && (
                                  <div>
                                    <p className="text-[10px] text-white/40 uppercase mb-1">Source Docs</p>
                                    <div className="flex flex-wrap gap-1">
                                      {finding.source_docs.map((d) => (
                                        <span
                                          key={d}
                                          className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60"
                                        >
                                          {d}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }
            )}

            <Button
              onClick={() => onClose(formatComplianceForChat(results, sessionData?.company_name ?? undefined))}
              className="mt-2 w-full flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Finish & Continue in Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => onClose()}
              className="mt-1 w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Close Without Saving to Chat
            </Button>
          </div>
        )}

        {/* Loading / error when no results yet */}
        {step === 'results' && !results && (
          <div className="flex flex-col items-center gap-4 py-16">
            {sessionData?.status === 'error' ? (
              <p className="text-red-400 text-sm">{sessionData.error}</p>
            ) : (
              <>
                <Loader2 className="w-8 h-8 text-brand-accent-dark animate-spin" />
                <p className="text-sm text-white/50">Loading results…</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
