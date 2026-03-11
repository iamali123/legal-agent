import { useState } from 'react'
import { Eye, Pencil, Plus, Sparkles, Calendar, Users, CircleCheckBig, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateAgreementDialog } from '@/components/CreateAgreementDialog'
import type { CreateAgreementFormData } from '@/components/CreateAgreementDialog'
import { ViewAgreementDialog, type ViewAgreementDialogData } from '@/components/ViewAgreementDialog'
import { cn, formatDate } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'
import {
  useAgreements,
  useCreateAgreement,
  useGenerateAgreementDraft,
  useIsAdmin,
} from '@/hooks/api'
import type { Agreement, AgreementStatus } from '@/types/agreement.types'

const AGREEMENT_STATUS_LABELS: Record<AgreementStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  terminated: 'Terminated',
}

function deriveAgreementStats(items: Agreement[]) {
  return {
    draft: items.filter((i) => i.status === 'draft').length,
    active: items.filter((i) => i.status === 'active').length,
    terminated: items.filter((i) => i.status === 'terminated').length,
  }
}

const summaryCardConfig = [
  { key: 'draft' as const, label: 'Draft', color: 'text-gray-400' },
  { key: 'active' as const, label: 'Active', color: 'text-green-400' },
  { key: 'terminated' as const, label: 'Terminated', color: 'text-red-400' },
]

function agreementToViewData(a: Agreement & { content?: string; purposeAndObjectives?: string }): ViewAgreementDialogData {
  return {
    id: a.id,
    title: a.title,
    parties: a.parties,
    type: a.type,
    date: a.date,
    status: AGREEMENT_STATUS_LABELS[a.status],
    content: a.content,
    purposeAndObjectives: a.purposeAndObjectives,
  }
}

export function Agreements() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewAgreement, setViewAgreement] = useState<Agreement | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const isAdmin = useIsAdmin()

  const { data: listData, isLoading, error } = useAgreements()
  const createMutation = useCreateAgreement()
  const generateDraftMutation = useGenerateAgreementDraft()

  const items = listData?.data?.items ?? []
  const stats = deriveAgreementStats(items)

  const handleGenerateDraft = (data: CreateAgreementFormData) => {
    setCreateDialogOpen(false)
    createMutation.mutate(
      {
        title: data.title,
        parties: data.parties,
        type: data.type,
        purposeAndObjectives: data.purposeAndObjectives,
        status: data.status,
        content: data.content,
        date: data.date,
      },
      {
        onSuccess: (res) => {
          const id = res.data?.id
          if (id) {
            setGeneratingId(id)
            generateDraftMutation.mutate(id, {
              onSettled: () => setGeneratingId(null),
            })
          }
        },
      }
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Agreements"
        subtitle="Manage agreements and collaborate with AI suggestions"
      />
      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {summaryCardConfig.map(({ key, label, color }) => (
            <div
              key={label}
              className="px-4 py-5 text-center bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 overflow-hidden relative"
            >
              <CornerAccents />
              <p className="text-xs text-brand-accent-dark mb-2 uppercase tracking-wide">
                {label}
              </p>
              <p className={cn('text-3xl font-bold', color)}>
                {isLoading ? '—' : stats[key]}
              </p>
              <hr className="border-0 h-px bg-hr-glow mt-2 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Agreements Cards Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              All Agreements
            </h2>
            {isAdmin && (
              <Button
                className="bg-brand-accent-dark hover:bg-brand-accent-dark/90"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Agreement
              </Button>
            )}
          </div>

          <CreateAgreementDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onGenerateDraft={handleGenerateDraft}
          />

          {error && (
            <p className="text-red-400 text-sm py-4">Failed to load agreements. Please try again.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <p className="text-brand-muted-text-dark col-span-2 py-8">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-brand-muted-text-dark col-span-2 py-8">No agreements found.</p>
            ) : (
              items.map((agreement) => (
                <Card
                  key={agreement.id}
                  className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
                >
                  <CardContent className="p-6 relative">
                    <CornerAccents />

                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-lg font-semibold text-white leading-tight pr-2">
                        {agreement.title}
                      </h4>
                      {generatingId === agreement.id ? (
                        <div className="flex items-center gap-1 shrink-0 text-brand-accent-dark" title="Generating AI draft…">
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span className="text-xs">Generating…</span>
                        </div>
                      ) : agreement.aiSuggestions != null && agreement.aiSuggestions > 0 ? (
                        <div
                          className="flex items-center gap-1 shrink-0 text-green-500"
                          title={`${agreement.aiSuggestions} AI clause(s)`}
                        >
                          <CircleCheckBig className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-medium">AI Draft Ready</span>
                        </div>
                      ) : null}
                    </div>

                    <p className="text-sm text-brand-muted-text-dark mb-4">
                      <Users className="w-4 h-4 text-brand-muted-text-dark shrink-0 inline-block -mt-1" />{' '}
                      {agreement.parties}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-brand-accent-dark/60">Type:</span>
                        <span className="inline-flex items-center rounded border border-brand-accent-dark bg-brand-accent-dark/10 px-2 py-0.5 text-xs font-medium text-brand-accent-dark">
                          {agreement.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-brand-accent-dark/60">Parties:</span>
                        <span className="text-brand-muted-text-dark">{agreement.parties}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-brand-muted-text-dark mb-5">
                        <Calendar className="w-4 h-4 text-brand-accent-dark shrink-0" />
                        <span className="mt-1">{formatDate(agreement.date)}</span>
                      </div>
                    </div>

                    <hr className="border-0 h-px bg-brand-accent-dark/20 mb-4" />

                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium border',
                          agreement.status === 'active' &&
                            'bg-emerald-500/20 border-emerald-500/80 text-emerald-400',
                          agreement.status === 'draft' &&
                            'bg-gray-500/20 border-gray-500/80 text-gray-400',
                          agreement.status === 'terminated' &&
                            'bg-red-500/20 border-red-500/80 text-red-400'
                        )}
                      >
                        {AGREEMENT_STATUS_LABELS[agreement.status]}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setViewAgreement(agreement)}
                          className="text-brand-muted-text-dark hover:text-brand-accent-dark/80 transition-colors"
                          aria-label="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="text-brand-muted-text-dark hover:text-brand-accent-dark/80 transition-colors"
                              aria-label="Edit"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              className="text-brand-accent-dark hover:text-brand-accent-dark/80 transition-colors"
                              aria-label="AI suggestions"
                            >
                              <Sparkles className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <ViewAgreementDialog
        open={!!viewAgreement}
        data={viewAgreement ? agreementToViewData(viewAgreement) : null}
        onClose={() => setViewAgreement(null)}
      />
    </div>
  )
}
