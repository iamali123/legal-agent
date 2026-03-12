import { useState } from 'react'
import { Eye, Pencil, AlertTriangle, CheckCircle2, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreateLegislationDialog } from '@/components/CreateLegislationDialog'
import { ViewLegislationDialog } from '@/components/ViewLegislationDialog'
import { CornerAccents } from '@/components/CornerAccents'
import { cn, formatDate } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  useLegislations,
  useCreateLegislation,
  useGenerateLegislationDraft,
  useUpdateLegislationStatus,
  useIsAdmin,
} from '@/hooks/api'
import type { LegislationJurisdiction, LegislationStatus } from '@/types/legislation.types'
import { useTranslation } from 'react-i18next'

/** Status options for PATCH /legislations/:id/status (backend enum Legislations.status) */
const LEGISLATION_STATUS_OPTIONS: { value: LegislationStatus; labelKey: string }[] = [
  { value: 'draft', labelKey: 'legislations.statusDraft' },
  { value: 'active', labelKey: 'legislations.statusActive' },
  { value: 'published', labelKey: 'legislations.statusPublished' },
  { value: 'amended', labelKey: 'legislations.statusAmended' },
]

function deriveLegislationStats(items: { status: string; aiFlags: { type: string } }[]) {
  return {
    total: items.length,
    draft: items.filter((i) => i.status === 'draft').length,
    published: items.filter((i) => i.status === 'published').length,
    amendmentsPending: items.filter((i) => i.status === 'amended').length,
    aiFlaggedRisks: items.filter((i) => i.aiFlags?.type === 'warning').length,
  }
}

const summaryCardConfig = [
  { key: 'total' as const, labelKey: 'legislations.total', color: 'text-brand-accent-dark' },
  { key: 'draft' as const, labelKey: 'legislations.draft', color: 'text-orange-500' },
  { key: 'published' as const, labelKey: 'legislations.published', color: 'text-green-500' },
  { key: 'amendmentsPending' as const, labelKey: 'legislations.amendmentsPending', color: 'text-purple-500' },
  { key: 'aiFlaggedRisks' as const, labelKey: 'legislations.aiFlaggedRisks', color: 'text-red-500' },
]

export function Legislations() {
  const { t } = useTranslation()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewLegislationId, setViewLegislationId] = useState<string | null>(null)
  const isAdmin = useIsAdmin()

  const { data: listData, isLoading, error } = useLegislations()
  const createMutation = useCreateLegislation()
  const generateDraftMutation = useGenerateLegislationDraft()
  const updateStatusMutation = useUpdateLegislationStatus()

  const items = listData?.data?.items ?? []
  const stats = deriveLegislationStats(items)

  const handleSaveDraft = (form: { 
    title: string
    jurisdiction: string
    description: string
    status: LegislationStatus
    content?: string
    version: string
  }) => {
    createMutation.mutate(
      {
        title: form.title,
        jurisdiction: form.jurisdiction as LegislationJurisdiction,
        description: form.description,
        status: form.status,
        content: form.content,
        version: form.version,
      },
      {
        onSuccess: () => setCreateDialogOpen(false),
      }
    )
  }

  const handleGenerateDraft = (form: { 
    title: string
    jurisdiction: string
    description: string
    status: LegislationStatus
    content?: string
    version: string
  }) => {
    createMutation.mutate(
      {
        title: form.title,
        jurisdiction: form.jurisdiction as LegislationJurisdiction,
        description: form.description,
        status: form.status,
        content: form.content,
        version: form.version,
      },
      {
        onSuccess: (res) => {
          const id = res.data?.id
          if (id) {
            generateDraftMutation.mutate({
              id,
              data: {
                title: form.title,
                jurisdiction: form.jurisdiction as LegislationJurisdiction,
                description: form.description,
                status: form.status,
                content: form.content,
                version: form.version,
              },
            })
          }
          setCreateDialogOpen(false)
        },
      }
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('legislations.title')}
        subtitle={t('legislations.subtitle')}
      />
      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {summaryCardConfig.map(({ key, labelKey, color }) => (
            <div
              key={labelKey}
              className="px-4 py-5 text-center bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 overflow-hidden relative"
            >
              <CornerAccents />
              <p className="text-xs text-brand-accent-dark mb-2 uppercase tracking-wide">
                {t(labelKey)}
              </p>
              <p className={cn('text-3xl font-bold', color)}>
                {isLoading ? '—' : stats[key]}
              </p>
              <hr className="border-0 h-px bg-hr-glow mt-2 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Legislation Table Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              {t('legislations.allLegislations')}
            </h2>
            {isAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('legislations.createLegislation')}
              </Button>
            )}
          </div>

          <CreateLegislationDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onSave={handleSaveDraft}
            onGenerateDraft={handleGenerateDraft}
          />

          {error && (
            <p className="text-red-400 text-sm py-4">{t('legislations.failedToLoad')}</p>
          )}

          {/* Table */}
          <div className="border border-brand-accent-dark/30 rounded-xl overflow-hidden bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className="border-b border-brand-accent-dark/30"
                  style={{
                    background: 'linear-gradient(180deg, #0A1628 0%, #0D1B2A 100%)',
                  }}
                >
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      {t('legislations.tableTitle')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      {t('legislations.tableJurisdiction')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      {t('legislations.tableStatus')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      {t('legislations.tableLastUpdated')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      {t('legislations.tableAiFlags')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      {t('legislations.tableActions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-brand-muted-text-dark">
                        {t('legislations.loading')}
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-brand-muted-text-dark">
                        {t('legislations.noneFound')}
                      </td>
                    </tr>
                  ) : (
                    items.map((legislation) => (
                      <tr
                        key={legislation.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-semibold">
                            {legislation.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-muted-text-dark">
                            {legislation.jurisdiction}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isAdmin ? (
                            <select
                              value={legislation.status}
                              onChange={(e) => {
                                const status = e.target.value
                                if (status && status !== legislation.status) {
                                  updateStatusMutation.mutate({
                                    id: legislation.id,
                                    status,
                                  })
                                }
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="rounded-md border border-brand-accent-dark/30 bg-white/5 text-white text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent-dark disabled:opacity-50"
                            >
                              {LEGISLATION_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#0A1628] text-white">
                                  {t(opt.labelKey)}
                                </option>
                              ))}
                            </select>
                          ) : (
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
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-muted-text-dark">
                            {formatDate(legislation.lastUpdated)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {legislation.aiFlags?.type === 'clean' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-500">{t('legislations.clean')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-xs text-red-500">
                                {legislation.aiFlags?.count != null ? `A${legislation.aiFlags.count}` : '—'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setViewLegislationId(legislation.id)}
                              className="text-brand-muted-text-dark hover:text-brand-accent-dark transition-colors"
                              aria-label={t('legislations.ariaViewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <>
                                <button className="text-brand-muted-text-dark hover:text-brand-accent-dark transition-colors" aria-label={t('legislations.ariaEdit')}>
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button className="text-brand-muted-text-dark hover:text-brand-accent-dark transition-colors" aria-label={t('legislations.ariaAiDraft')}>
                                  <Sparkles className="w-5 h-5 text-brand-accent-dark" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ViewLegislationDialog
        open={!!viewLegislationId}
        legislationId={viewLegislationId}
        onClose={() => setViewLegislationId(null)}
      />
    </div>
  )
}
