import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Sparkles, Calendar } from 'lucide-react'

export interface ViewContractDialogData {
  id: string
  title: string
  counterparty: string
  type: string
  value: string
  status: string
  startDate?: string
  endDate?: string
  content?: string
}

interface ViewContractDialogProps {
  open: boolean
  data: ViewContractDialogData | null
  onClose: () => void
}

export function ViewContractDialog({
  open,
  data,
  onClose,
}: ViewContractDialogProps) {
  if (!open || !data) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 shrink-0 border-b border-brand-accent-dark/10">
          <h2 className="text-xl font-bold text-white mb-1">{data.title}</h2>
          <p className="text-xs text-brand-accent-dark/60 uppercase">{data.type}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll space-y-4">

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Counterparty</p>
              <p className="text-sm font-medium text-white">{data.counterparty}</p>
            </div>
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Status</p>
              <p className="text-sm font-medium text-white">{data.status}</p>
            </div>
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Value</p>
              <p className="text-sm font-medium text-[#05DF72]">{data.value}</p>
            </div>
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
              <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">Duration</p>
              <p className="text-sm font-medium text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                {data.startDate && data.endDate
                  ? `${formatDate(data.startDate)} → ${formatDate(data.endDate)}`
                  : '—'}
              </p>
            </div>
          </div>

          {/* AI-generated draft */}
          {data.content ? (
            <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-accent-dark/10">
                <Sparkles className="w-4 h-4 text-brand-accent-dark" />
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide font-semibold">
                  Contract Draft
                </p>
              </div>
              <div className="px-4 py-4">
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                  {data.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-accent-dark/20 px-4 py-6 text-center text-white/40 text-sm">
              <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No AI draft yet. Click "Generate Draft" when creating a contract to generate one.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex shrink-0 border-t border-brand-accent-dark/10">
          <Button type="button" onClick={onClose} className="min-w-[120px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
