import { Button } from '@/components/ui/button'

export interface ViewAgreementDialogData {
  id: string
  title: string
  parties: string
  type: string
  date: string
  status: string
}

interface ViewAgreementDialogProps {
  open: boolean
  data: ViewAgreementDialogData | null
  onClose: () => void
}

export function ViewAgreementDialog({
  open,
  data,
  onClose,
}: ViewAgreementDialogProps) {
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
        {/* Title - top-left, large bold white */}
        <div className="p-6 pb-4 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {data.title}
          </h2>
        </div>

        {/* Information grid: 2x2 dark cards - Parties, Type, Date, Status */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Type
            </p>
            <p className="text-sm font-medium text-white">{data.type}</p>
          </div>
        <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Status
            </p>
            <p className="text-sm font-medium text-white">{data.status}</p>
          </div>
          <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3 col-span-2">
            <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
              Parties
            </p>
            <p className="text-sm font-medium text-white">{data.parties}</p>
          </div>
        </div>

        {/* Close button - bottom-left, gradient */}
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
