import { Sparkles, X, Check, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DocumentSection {
  label: string
  isNewOrModified?: boolean
}

export interface ApprovalViewDialogData {
  title: string
  type: string
  submittedBy: string
  date: string
  priority: string
  aiSummary: string
  status?: string
  aiRecommendation?: string
  confidence?: number
  documentSections?: DocumentSection[]
}

const DEFAULT_SECTIONS: DocumentSection[] = [
  { label: 'Section 1: Parties to the Agreement' },
  { label: 'Section 2: Purpose and Scope' },
  { label: 'Section 3: Terms and Conditions' },
  { label: 'Payment Terms (Modified)', isNewOrModified: true },
  { label: 'Section 4: Duration and Termination' },
]

interface ApprovalViewDialogProps {
  open: boolean
  data: ApprovalViewDialogData | null
  onClose: () => void
  onRequestChanges?: (data: ApprovalViewDialogData) => void
  onReject?: (data: ApprovalViewDialogData) => void
  onApprove?: (data: ApprovalViewDialogData) => void
}

export function ApprovalViewDialog({
  open,
  data,
  onClose,
  onRequestChanges,
  onReject,
  onApprove,
}: ApprovalViewDialogProps) {
  const sections = data?.documentSections ?? DEFAULT_SECTIONS
  const isOpen = open && !!data

  if (!isOpen) return null
  
  // Extract confidence and recommendation from aiSummary if not provided directly
  const confidence = data?.confidence ?? 94
  const recommendation = data?.aiRecommendation ?? 'Approve'
  const status = data?.status ?? 'Pending'
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
      {data && (
        <>
        {/* Header - Title with close button */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {data.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Metadata cards - 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Type</p>
              <p className="text-sm font-medium text-white">{data.type}</p>
            </div>
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Status</p>
              <p className="text-sm font-medium text-white">{status}</p>
            </div>
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Requested By</p>
              <p className="text-sm font-medium text-white">{data.submittedBy}</p>
            </div>
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Due Date</p>
              <p className="text-sm font-medium text-white">{data.date}</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation - full width */}
        <div className="px-6 pb-4 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll">
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide">AI Recommendation</p>
              <div className="text-right">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide">CONFIDENCE</p>
                <p className="text-base font-bold text-[#00BFFF]">{confidence}%</p>
              </div>
            </div>
            <p className="text-sm font-medium text-white">{recommendation}</p>
          </div>
        </div>

        {/* Action Buttons - only show when caller provides handlers (e.g. Admin) */}
        {(onApprove ?? onReject ?? onRequestChanges) && (
          <div className="p-6 pt-2 flex items-center gap-3 shrink-0">
            {onApprove && (
              <button
                type="button"
                onClick={() => onApprove(data)}
                className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                aria-label="Approve"
              >
                <Check className="w-5 h-5 text-green-500" />
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={() => onReject(data)}
                className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                aria-label="Reject"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>
        )}
        </>
      )}
      </div>
    </div>
  )
}
