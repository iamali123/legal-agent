import { useState } from 'react'
import { FileText, Sparkles, User, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useLegislation, useCreateLegislationSection, useIsAdmin } from '@/hooks/api'
import { AddLegislationSectionDialog } from '@/components/AddLegislationSectionDialog'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const { data, isLoading, error } = useLegislation(legislationId ?? '')
  const createSectionMutation = useCreateLegislationSection()
  const isAdmin = useIsAdmin()

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
                <p className="text-sm text-red-400">{t('viewLegislation.failedToLoad')}</p>
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
          <div className="flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll">
            {/* Information grid: 2x2 dark cards */}
            <div className="px-6 pb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
                  {t('viewLegislation.jurisdiction')}
                </p>
                <p className="text-sm font-medium text-white">{legislation.jurisdiction}</p>
              </div>
              <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
                  {t('viewLegislation.status')}
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
                  {t('viewLegislation.lastUpdated')}
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
                  {t('viewLegislation.created')}
                </p>
                <p className="text-sm font-medium text-white">
                  {formatDate(legislation.createdAt)}
                </p>
              </div>
            </div>

            {/* Created by / Creator */}
            {(legislation as { creator?: { name: string; email?: string } }).creator && (
              <div className="px-6 pb-4">
                <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 px-4 py-3">
                  <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {t('viewLegislation.createdBy')}
                  </p>
                  <p className="text-sm font-medium text-white">
                    {(legislation as { creator?: { name: string } }).creator?.name ?? '—'}
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
                    {t('viewLegislation.aiFlags')}
                  </p>
                  <div className="flex items-center gap-2">
                    {legislation.aiFlags.type === 'clean' ? (
                      <span className="text-sm text-green-500">{t('viewLegislation.noIssuesDetected')}</span>
                    ) : (
                      <span className="text-sm text-amber-500">
                        {legislation.aiFlags.count != null
                          ? t('viewLegislation.flagsCount', { count: legislation.aiFlags.count })
                          : t('viewLegislation.reviewRecommended')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sections (when available) - ready for future list */}
            {Array.isArray(legislation.sections) && legislation.sections.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-brand-accent-dark uppercase tracking-wide">
                    {t('viewLegislation.sections')}
                  </p>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddSectionOpen(true)}
                      className="border-brand-accent-dark/30 text-brand-accent-dark hover:bg-brand-accent-dark/10 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      {t('viewLegislation.addSection')}
                    </Button>
                  )}
                </div>
                <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 divide-y divide-brand-accent-dark/10 max-h-48 overflow-y-auto">
                  {legislation.sections
                    .slice()
                    .sort(
                      (a: { order?: number }, b: { order?: number }) =>
                        (a.order ?? 0) - (b.order ?? 0)
                    )
                    .map((sec: { id?: string; title?: string; order?: number }) => (
                      <div
                        key={(sec as { id: string }).id ?? sec.order}
                        className="px-4 py-3"
                      >
                        <p className="text-sm font-medium text-white">
                          {sec.title ?? t('viewLegislation.sectionTitle', { order: String(sec.order ?? '—') })}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Add section (Admin) - show when no sections or when sections exist and admin */}
            {isAdmin && legislationId && (
              <>
                {(!Array.isArray(legislation.sections) || legislation.sections.length === 0) && (
                  <div className="px-6 pb-4">
                    <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-2">
                      {t('viewLegislation.sections')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddSectionOpen(true)}
                      className="w-full border-brand-accent-dark/30 text-brand-accent-dark hover:bg-brand-accent-dark/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('viewLegislation.addSection')}
                    </Button>
                  </div>
                )}
                <AddLegislationSectionDialog
                  open={addSectionOpen}
                  legislationId={legislationId}
                  legislationTitle={legislation.title}
                  onClose={() => {
                    setAddSectionOpen(false)
                    createSectionMutation.reset()
                  }}
                  onSubmit={(data) =>
                    createSectionMutation.mutate(
                      { legislationId, data },
                      {
                        onSuccess: () => {
                          setAddSectionOpen(false)
                          createSectionMutation.reset()
                        },
                      }
                    )
                  }
                  isPending={createSectionMutation.isPending}
                  error={
                    createSectionMutation.isError
                      ? (createSectionMutation.error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
                        (createSectionMutation.error as Error)?.message ??
                        t('viewLegislation.failedToAddSection')
                      : null
                  }
                />
              </>
            )}

            {/* Content (full text) */}
            {'content' in legislation && legislation.content && (
              <div className="px-6 pb-4">
                <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-2">
                  {t('viewLegislation.content')}
                </p>
                <div className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 p-4">
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {legislation.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Close button */}
        <div className="p-6 pt-2 flex shrink-0">
          <Button type="button" onClick={onClose} className="min-w-[120px]">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  )
}
