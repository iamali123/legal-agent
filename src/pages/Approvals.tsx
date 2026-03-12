import { useState } from 'react'
import { Eye, Check, X, FileText, User, Calendar, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  ApprovalViewDialog,
  type ApprovalViewDialogData,
} from '@/components/ApprovalViewDialog'
import { cn, formatDate } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'
import {
  useApprovals,
  useApproveRequest,
  useRejectRequest,
  useRequestChanges,
  useIsAdmin,
} from '@/hooks/api'
import type { Approval } from '@/types/approval.types'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

function deriveApprovalStats(items: Approval[]) {
  const now = new Date().toISOString().slice(0, 10)
  return {
    pending: items.filter((i) => i.status === 'pending').length,
    approvedToday: items.filter(
      (i) => i.status === 'approved' && (i.approvedAt?.slice(0, 10) === now || true)
    ).length,
    urgent: items.filter((i) => i.priority === 'High' && i.status === 'pending').length,
    inReview: items.filter((i) => i.status === 'pending').length,
  }
}

const summaryCardConfig = [
  { key: 'pending' as const, labelKey: 'approvals.pendingApprovals', color: 'text-orange-400' },
  { key: 'approvedToday' as const, labelKey: 'approvals.approvedToday', color: 'text-green-400' },
  { key: 'urgent' as const, labelKey: 'approvals.urgent', color: 'text-red-400' },
  { key: 'inReview' as const, labelKey: 'approvals.inReview', color: 'text-blue-400' },
]

function approvalToViewData(approval: Approval, t: TFunction): ApprovalViewDialogData {
  const statusLabel =
    approval.status === 'pending'
      ? t('approvals.pending')
      : approval.status === 'approved'
      ? t('approvals.approved')
      : approval.status === 'rejected'
      ? t('approvals.rejected')
      : t('approvals.changesRequested')
  return {
    title: approval.title,
    type: approval.type,
    submittedBy: approval.submitter?.name ?? approval.assignee?.name ?? '—',
    date: approval.dueDate,
    priority: approval.priority,
    aiSummary: t('approvals.aiRecommendationLabel', { recommendation: approval.aiRecommendation, confidence: approval.confidence }),
    status: statusLabel,
    aiRecommendation: approval.aiRecommendation,
    confidence: approval.confidence,
  }
}

export function Approvals() {
  const { t } = useTranslation()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewData, setViewData] = useState<ApprovalViewDialogData | null>(null)
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null)
  const isAdmin = useIsAdmin()

  const { data: listData, isLoading, error } = useApprovals()
  const approveMutation = useApproveRequest()
  const rejectMutation = useRejectRequest()
  const requestChangesMutation = useRequestChanges()

  const items = listData?.data?.items ?? []
  const stats = deriveApprovalStats(items)

  const openView = (approval: Approval) => {
    setViewData(approvalToViewData(approval, t))
    setSelectedApprovalId(approval.id)
    setViewDialogOpen(true)
  }

  const closeView = () => {
    setViewDialogOpen(false)
    setViewData(null)
    setSelectedApprovalId(null)
  }

  const handleApprove = () => {
    if (selectedApprovalId) {
      approveMutation.mutate(
        { id: selectedApprovalId, data: undefined },
        { onSuccess: closeView }
      )
    }
  }

  const handleReject = () => {
    if (selectedApprovalId) {
      rejectMutation.mutate(
        { id: selectedApprovalId, data: { reason: 'Rejected from portal' } },
        { onSuccess: closeView }
      )
    }
  }

  const handleRequestChanges = () => {
    if (selectedApprovalId) {
      requestChangesMutation.mutate(
        { id: selectedApprovalId, data: { changes: [], comments: 'Changes requested' } },
        { onSuccess: closeView }
      )
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('approvals.title')}
        subtitle={t('approvals.subtitle')}
      />
      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Approvals Cards Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              {t('approvals.approvalQueue')}
            </h2>
          </div>

          {error && (
            <p className="text-red-400 text-sm py-4">{t('approvals.failedToLoad')}</p>
          )}

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <p className="text-brand-muted-text-dark py-8">{t('approvals.loading')}</p>
            ) : items.length === 0 ? (
              <p className="text-brand-muted-text-dark py-8">{t('approvals.noneFound')}</p>
            ) : (
              items.map((approval) => (
                <Card
                  key={approval.id}
                  className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
                >
                  <CardContent className="p-6 relative">
                    <CornerAccents />

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-white leading-tight pr-2 flex-1">
                          {approval.title}
                        </h4>
                        <span
                          className={cn(
                            'rounded px-2.5 py-1 text-xs font-medium border',
                            approval.priority === 'Medium' &&
                              'bg-orange-600/20 border border-orange-600/80 text-orange-400',
                            approval.priority === 'High' &&
                              'bg-red-600/20 border border-red-600/80 text-red-400',
                            approval.priority === 'Low' &&
                              'bg-gray-600/20 border border-gray-600/80 text-gray-400'
                          )}
                        >
                          {approval.priority}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium border',
                          approval.status === 'pending' &&
                            'bg-yellow-700/20 border border-yellow-700/80 text-yellow-400',
                          approval.status === 'approved' &&
                            'bg-green-600/20 border border-green-600/80 text-green-400',
                          approval.status === 'rejected' &&
                            'bg-red-600/20 border border-red-600/80 text-red-400',
                          approval.status === 'changesRequested' &&
                            'bg-orange-600/20 border border-orange-600/80 text-orange-400'
                        )}
                      >
                        {approval.status === 'pending'
                          ? t('approvals.pending')
                          : approval.status === 'approved'
                          ? t('approvals.approved')
                          : approval.status === 'rejected'
                          ? t('approvals.rejected')
                          : t('approvals.changesRequested')}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4 flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-brand-muted-text-dark">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>{approval.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-muted-text-dark">
                        <User className="w-4 h-4 shrink-0" />
                        <span>{approval.assignee?.name ?? approval.submitter?.name ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-muted-text-dark">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>{t('approvals.due')} {formatDate(approval.dueDate)}</span>
                      </div>
                    </div>

                    <div className="mb-4 border bg-[#0A162880] border-brand-accent-dark/20 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-accent-dark/20 border border-brand-accent-dark/30 shrink-0">
                            <Info className="w-5 h-5 text-brand-accent-dark shrink-0" />
                          </div>
                          <div>
                            <p className="text-brand-accent-dark/60 uppercase tracking-wide">
                              {t('approvals.aiRecommendation')}
                            </p>
                            <p className="text-sm font-medium text-white">
                              {approval.aiRecommendation}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base text-brand-accent-dark/60 uppercase tracking-wide">
                            {t('approvals.confidence')}
                          </p>
                          <p className="text-lg font-bold text-[#00BFFF]">
                            {approval.confidence}%
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#00BFFF] transition-all"
                          style={{ width: `${approval.confidence}%` }}
                        />
                      </div>
                    </div>

                    {approval.status === 'pending' && (
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveMutation.mutate({ id: approval.id, data: undefined })}
                              disabled={approveMutation.isPending}
                              className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                              aria-label={t('approvals.ariaApprove')}
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                rejectMutation.mutate({
                                  id: approval.id,
                                  data: { reason: 'Rejected from portal' },
                                })
                              }
                              disabled={rejectMutation.isPending}
                              className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                              aria-label={t('approvals.ariaReject')}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => openView(approval)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                          aria-label={t('approvals.review')}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{t('approvals.review')}</span>
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <ApprovalViewDialog
        open={viewDialogOpen}
        data={viewData}
        onClose={closeView}
        onRequestChanges={isAdmin ? () => handleRequestChanges() : undefined}
        onReject={isAdmin ? () => handleReject() : undefined}
        onApprove={isAdmin ? () => handleApprove() : undefined}
      />
    </div>
  )
}
