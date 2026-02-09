import { BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ViewDocumentDialogData {
  id: string
  title: string
  description: string
  authority: string
  category: string
  status: string
  effectiveDate: string
  aiSummary: string
}

interface ViewDocumentDialogProps {
  open: boolean
  data: ViewDocumentDialogData | null
  onClose: () => void
}

const gradientTitle = 'linear-gradient(180deg, #00D9FF 0%, #00A8B5 100%)'

export function ViewDocumentDialog({
  open,
  data,
  onClose,
}: ViewDocumentDialogProps) {
  if (!open || !data) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: icon + title (gradient) + subtitle */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-accent-dark/20 border border-brand-accent-dark/30 shrink-0">
              <BookOpen className="w-6 h-6 text-brand-accent-dark" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="text-xl font-bold mb-1 text-white"
              >
                {data.title}
              </h2>
              <p className="text-sm text-brand-muted-text-dark">
                {data.description}
              </p>
            </div>
          </div>
        </div>

        {/* Information grid: 2x2 dark cards */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Authority
            </p>
            <p className="text-sm font-medium text-white">{data.authority}</p>
          </div>
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Status
            </p>
            <p className="text-sm font-medium text-white">{data.status}</p>
          </div>
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Effective Date
            </p>
            <p className="text-sm font-medium text-white">{data.effectiveDate}</p>
          </div>
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Category
            </p>
            <p className="text-sm font-medium text-white">{data.category}</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="px-6 pb-4">
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 p-4">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-2 flex items-center gap-1.5">
              AI Summary
            </p>
            <p className="text-sm text-white/70 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-brand-accent-dark" />
              {data.aiSummary}
            </p>
          </div>
        </div>

        {/* Close button - centered, gradient */}
        <div className="p-6 pt-2 flex">
          <Button
            type="button"
            onClick={onClose}
            className="min-w-[120px]"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
