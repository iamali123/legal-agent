import { FileText, Sparkles, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useLegislation } from '@/hooks/api'

interface ViewLegislationDialogProps {
  open: boolean
  legislationId: string | null
  onClose: () => void
}

export function ViewLegislationDialog({
  open,
  legislationId,
  onClose,
}: ViewLegislationDialogProps) {
  const { data, isLoading, error } = useLegislation(legislationId ?? '')

  const legislation = data?.data

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: icon + title + subtitle */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-accent-dark/20 border border-brand-accent-dark/30 shrink-0">
              <FileText className="w-6 h-6 text-brand-accent-dark" />
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <>
                  <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
                </>
              ) : error || !legislation ? (
                <p className="text-sm text-red-400">Failed to load legislation details.</p>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-1 text-white">
                    {legislation.title}
                  </h2>
                  {'description' in legislation && legislation.description && (
                    <p className="text-sm text-brand-muted-text-dark">
                      {legislation.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {legislation && (
          <>
            {/* Information grid: 2x2 dark cards */}
            <div className="px-6 pb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
                  Jurisdiction
                </p>
                <p className="text-sm font-medium text-white">{legislation.jurisdiction}</p>
              </div>
              <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
                  Status
                </p>
                <div>
                  <Badge
                    variant={
                      legislation.status === 'draft'
                        ? 'draft'
                        : legislation.status === 'active'
                        ? 'active'
                        : 'clean'
                    }
                  >
                    {(legislation.status as string).charAt(0).toUpperCase() +
                      (legislation.status as string).slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Last Updated
                </p>
                <p className="text-sm font-medium text-white">
                  {formatDate(
                    (legislation as { lastUpdated?: string; updatedAt?: string }).lastUpdated ??
                      (legislation as { updatedAt?: string }).updatedAt
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created
                </p>
                <p className="text-sm font-medium text-white">
                  {formatDate(legislation.createdAt)}
                </p>
              </div>
            </div>

            {/* Created by / Creator */}
            {((legislation as { createdBy?: { name: string } }).createdBy ||
              (legislation as { creator?: { name: string; email?: string } }).creator) && (
              <div className="px-6 pb-4">
                <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                  <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Created By
                  </p>
                  <p className="text-sm font-medium text-white">
                    {(legislation as { createdBy?: { name: string } }).createdBy?.name ??
                      (legislation as { creator?: { name: string } }).creator?.name ??
                      '—'}
                  </p>
                </div>
              </div>
            )}

            {/* AI Flags */}
            {legislation.aiFlags && (
              <div className="px-6 pb-4">
                <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                  <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Flags
                  </p>
                  <div className="flex items-center gap-2">
                    {legislation.aiFlags.type === 'clean' ? (
                      <span className="text-sm text-green-500">No issues detected</span>
                    ) : (
                      <span className="text-sm text-amber-500">
                        {legislation.aiFlags.count != null
                          ? `${legislation.aiFlags.count} flag(s)`
                          : 'Review recommended'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content (full text) */}
            {'content' in legislation && legislation.content && (
              <div className="px-6 pb-4 flex-1 min-h-0 overflow-hidden flex flex-col">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-2">
                  Content
                </p>
                <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 p-4 overflow-y-auto flex-1 min-h-0">
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {legislation.content}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Close button */}
        <div className="p-6 pt-2 flex shrink-0">
          <Button type="button" onClick={onClose} className="min-w-[120px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
