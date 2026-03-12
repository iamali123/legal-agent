import { useState, useRef } from 'react'
import { FileText, FileCheck, Scale, Upload, ArrowLeft, Loader2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useContracts, useAgreements, useAiDocs } from '@/hooks/api'
import type { Contract } from '@/types/contract.types'
import type { Agreement } from '@/types/agreement.types'

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceType = 'agreement' | 'contract' | 'law_policy' | 'upload'

interface SummaryData {
  title: string
  document_type: string
  executive_summary: string
  key_points: string[]
  sections: { heading: string; summary: string }[]
  word_count: number
}

interface AiDoc {
  id: string
  filename?: string
  original_filename?: string
  status: string
  entity_type?: string
}

// ── Source config ─────────────────────────────────────────────────────────────

const SOURCES = [
  { type: 'agreement' as const,   label: 'Agreements',   icon: FileCheck, desc: 'Summarize a saved agreement' },
  { type: 'contract'  as const,   label: 'Contracts',    icon: FileText,  desc: 'Summarize a saved contract'  },
  { type: 'law_policy' as const,  label: 'Laws / Policy', icon: Scale,     desc: 'Summarize a processed law or policy doc' },
  { type: 'upload'    as const,   label: 'Upload File',  icon: Upload,    desc: 'Upload a document to summarize'       },
]

// ── API helpers ───────────────────────────────────────────────────────────────

async function summarizeEntity(sourceType: SourceType, entityId: string): Promise<SummaryData> {
  const res = await apiClient.post<{ success: boolean; data: { data: SummaryData } }>('/ai/summarize', {
    source_type: sourceType,
    entity_id:   entityId,
  })
  return res.data.data.data
}

async function summarizeFile(file: File): Promise<SummaryData> {
  const form = new FormData()
  form.append('file', file)
  const res = await apiClient.post<{ success: boolean; data: { data: SummaryData } }>(
    '/ai/summarize/upload',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data.data.data
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: { heading: string; summary: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-brand-accent-dark/20 bg-[#0A162880] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-brand-accent-dark hover:bg-white/5 transition-colors"
      >
        <span>{section.heading}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-white/70">
          {section.summary}
        </div>
      )}
    </div>
  )
}

// ── Format summary as chat-ready text ─────────────────────────────────────────

function formatSummaryForChat(s: SummaryData): string {
  const lines: string[] = [
    `📄 **Document Summary: ${s.title}**`,
    `*${s.document_type} · ~${s.word_count?.toLocaleString()} words*`,
    '',
    '**Executive Summary**',
    s.executive_summary,
  ]
  if (s.key_points?.length) {
    lines.push('', '**Key Points**')
    s.key_points.forEach((p) => lines.push(`• ${p}`))
  }
  if (s.sections?.length) {
    lines.push('', '**Sections**')
    s.sections.forEach((sec) => lines.push(`**${sec.heading}**: ${sec.summary}`))
  }
  lines.push('', '*You can now ask me questions about this document.*')
  return lines.join('\n')
}

// ── Main component ────────────────────────────────────────────────────────────

interface SummarizePanelProps {
  onClose: (resultText?: string) => void
}

export function SummarizePanel({ onClose }: SummarizePanelProps) {
  const [step, setStep]               = useState<'source' | 'pick' | 'result'>('source')
  const [sourceType, setSourceType]   = useState<SourceType | null>(null)
  const [uploadFile, setUploadFile]   = useState<File | null>(null)
  const [dragOver, setDragOver]       = useState(false)
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  // Lists
  const { data: contractsData } = useContracts()
  const { data: agreementsData } = useAgreements()
  const { data: aiDocsData }    = useAiDocs({ entityType: 'LawPolicy' })

  const contracts:  Contract[]  = contractsData?.data?.items ?? []
  const agreements: Agreement[] = agreementsData?.data?.items ?? []
  const aiDocs: AiDoc[]         = (aiDocsData?.docs ?? []) as AiDoc[]
  const lawDocs                 = aiDocs.filter((d) => d.status === 'processed')


  // Mutation
  const summarizeMutation = useMutation({
    mutationFn: async ({ type, entityId, file }: { type: SourceType; entityId?: string; file?: File }) => {
      if (type === 'upload' && file) return summarizeFile(file)
      if (entityId) return summarizeEntity(type, entityId)
      throw new Error('No entity selected')
    },
    onSuccess: () => setStep('result'),
  })

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSourceSelect = (type: SourceType) => {
    setSourceType(type)
    setStep('pick')
  }

  const handleEntitySelect = (entityId: string) => {
    summarizeMutation.mutate({ type: sourceType!, entityId })
    setStep('result')
  }

  const handleFileChange = (file: File) => {
    setUploadFile(file)
  }

  const handleSummarizeFile = () => {
    if (!uploadFile) return
    summarizeMutation.mutate({ type: 'upload', file: uploadFile })
    setStep('result')
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }

  // ── Step: Source selection ──────────────────────────────────────────────────

  const stepSource = (
    <div className="flex-1 overflow-y-auto sidebar-nav-scroll p-6 space-y-3">
      <p className="text-sm text-white/60 mb-4">Choose what type of document you want to summarize:</p>
      {SOURCES.map(({ type, label, icon: Icon, desc }) => (
        <button
          key={type}
          type="button"
          onClick={() => handleSourceSelect(type)}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 hover:border-brand-accent-dark/60 hover:bg-white/5 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-accent-dark/10 flex items-center justify-center shrink-0 group-hover:bg-brand-accent-dark/20 transition-colors">
            <Icon className="w-5 h-5 text-brand-accent-dark" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/50">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  )

  // ── Step: Pick document / Upload ────────────────────────────────────────────

  const docList = (() => {
    if (sourceType === 'agreement') return agreements.map((a) => ({ id: a.id, label: a.title, sub: a.type }))
    if (sourceType === 'contract')  return contracts.map((c) => ({ id: c.id, label: c.title, sub: c.type }))
    if (sourceType === 'law_policy') return lawDocs.map((d) => ({ id: d.id, label: d.original_filename || d.filename || d.id, sub: 'Processed' }))
    return []
  })()

  const stepPick = (
    <div className="flex-1 overflow-y-auto sidebar-nav-scroll p-6 space-y-3">
      {sourceType !== 'upload' ? (
        <>
          <p className="text-sm text-white/60 mb-4">
            Select a document to summarize:
          </p>
          {docList.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">No documents found.</p>
          ) : (
            docList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleEntitySelect(item.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 hover:border-brand-accent-dark/60 hover:bg-white/5 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-white/50">{item.sub}</p>
                </div>
                <FileText className="w-4 h-4 text-brand-accent-dark/60 shrink-0" />
              </button>
            ))
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-white/60 mb-4">Upload a document to summarize (PDF, DOCX, TXT):</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors',
              dragOver
                ? 'border-brand-accent-dark bg-brand-accent-dark/10'
                : 'border-brand-accent-dark/30 hover:border-brand-accent-dark/60 hover:bg-white/5'
            )}
          >
            <Upload className={cn('w-8 h-8', dragOver ? 'text-brand-accent-dark' : 'text-brand-accent-dark/60')} />
            {uploadFile ? (
              <div className="text-center">
                <p className="text-sm font-medium text-brand-accent-dark">{uploadFile.name}</p>
                <p className="text-xs text-white/50">{(uploadFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-white/60">Click to upload or drag & drop</p>
                <p className="text-xs text-white/40">PDF, DOCX, TXT supported</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileChange(f)
            }}
          />
          {uploadFile && (
            <Button
              onClick={handleSummarizeFile}
              disabled={summarizeMutation.isPending}
              className="w-full mt-2"
            >
              Summarize
            </Button>
          )}
        </>
      )}
    </div>
  )

  // ── Step: Result ─────────────────────────────────────────────────────────────

  const summary = summarizeMutation.data as SummaryData | undefined

  const stepResult = (
    <div className="flex-1 overflow-y-auto sidebar-nav-scroll p-6 space-y-4">
      {summarizeMutation.isPending && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="w-8 h-8 text-brand-accent-dark animate-spin" />
          <p className="text-sm text-white/60">Generating summary…</p>
        </div>
      )}

      {summarizeMutation.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to summarize: {(summarizeMutation.error as Error)?.message ?? 'Unknown error'}
        </div>
      )}

      {summary && (
        <>
          {/* Title */}
          <div>
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">{summary.document_type}</p>
            <h3 className="text-base font-bold text-white">{summary.title}</h3>
            <p className="text-xs text-white/40 mt-0.5">~{summary.word_count?.toLocaleString()} words</p>
          </div>

          {/* Executive summary */}
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-4">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-2">Executive Summary</p>
            <p className="text-sm text-white/80 leading-relaxed">{summary.executive_summary}</p>
          </div>

          {/* Key points */}
          {summary.key_points?.length > 0 && (
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-4">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-3">Key Points</p>
              <ul className="space-y-2">
                {summary.key_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent-dark shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          {summary.sections?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide">Sections</p>
              {summary.sections.map((sec, i) => (
                <SectionCard key={i} section={sec} />
              ))}
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => { summarizeMutation.reset(); setStep('source'); setSourceType(null); setUploadFile(null) }}
            className="w-full border-brand-accent-dark/30 text-brand-accent-dark hover:bg-brand-accent-dark/10"
          >
            Summarize Another Document
          </Button>

          <Button
            onClick={() => onClose(formatSummaryForChat(summary))}
            className="w-full flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Continue in Chat
          </Button>
        </>
      )}
    </div>
  )

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-accent-dark/20 shrink-0">
        <button
          type="button"
          onClick={() => onClose()}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-sm font-semibold text-white">Document Summarizer</p>
          <p className="text-xs text-white/40">
            {step === 'source' ? 'Select document type' : step === 'pick' ? 'Choose a document' : 'Summary'}
          </p>
        </div>
      </div>

      {/* Back breadcrumb when in pick step */}
      {step === 'pick' && (
        <div className="px-6 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => { setStep('source'); setUploadFile(null) }}
            className="inline-flex items-center gap-1.5 text-xs text-brand-accent-dark hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to source selection
          </button>
        </div>
      )}

      {/* Step content */}
      {step === 'source' && stepSource}
      {step === 'pick'   && stepPick}
      {step === 'result' && stepResult}
    </div>
  )
}
