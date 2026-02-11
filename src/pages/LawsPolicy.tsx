import { useState } from 'react'
import { BookOpen, Calendar, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { CornerAccents } from '@/components/CornerAccents'
import { ViewDocumentDialog, type ViewDocumentDialogData } from '@/components/ViewDocumentDialog'
import { useLawsPolicies, useLawsPoliciesStats } from '@/hooks/api'
import type { LawPolicy } from '@/types/law-policy.types'

const summaryCardConfig = [
  { key: 'total' as const, label: 'Total Laws', color: 'text-brand-accent-dark' },
  { key: 'active' as const, label: 'Active', color: 'text-orange-500' },
  { key: 'amended' as const, label: 'Amended', color: 'text-orange-500' },
  { key: 'categories' as const, label: 'Categories', color: 'text-orange-500' },
]

function lawToDialogData(law: LawPolicy): ViewDocumentDialogData {
  return {
    id: law.id,
    title: law.title,
    description: law.description,
    authority: law.authority,
    category: law.category,
    status: law.status,
    effectiveDate: law.effectiveDate,
    aiSummary: law.aiSummary,
  }
}

export function LawsPolicy() {
  const [viewDocumentLaw, setViewDocumentLaw] = useState<LawPolicy | null>(null)

  const { data: listData, isLoading: listLoading, error: listError } = useLawsPolicies()
  const { data: statsData, isLoading: statsLoading } = useLawsPoliciesStats()

  const items = listData?.data?.items ?? []
  const stats = statsData?.data ?? {
    total: items.length,
    active: 0,
    amended: 0,
    categories: 0,
  }

  const isLoading = listLoading
  const error = listError

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Laws & Policies"
        subtitle="Search, view, and analyze existing laws and policies"
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
                {statsLoading && !statsData ? '—' : stats[key]}
              </p>
              <hr className="border-0 h-px bg-hr-glow mt-2 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xl font-semibold text-brand-accent-dark">
            Laws & Policies
          </h2>
          <span className="text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 mr-1 inline-block" /> Read-Only Access
          </span>
        </div>

        {error && (
          <p className="text-red-400 text-sm py-4">Failed to load laws and policies. Please try again.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <p className="text-brand-muted-text-dark col-span-2 py-8">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-brand-muted-text-dark col-span-2 py-8">No laws or policies found.</p>
          ) : (
            items.map((law) => (
              <Card
                key={law.id}
                className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
              >
                <CardContent className="p-6 relative">
                  <CornerAccents />

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white leading-tight pr-2">
                      {law.title}
                    </h4>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-xs border',
                        law.status === 'Amended' &&
                          'bg-amber-500/20 border-amber-600/80 text-amber-500',
                        law.status === 'Active' &&
                          'bg-emerald-500/20 border-emerald-600/80 text-emerald-500',
                        law.status === 'Repealed' &&
                          'bg-gray-500/20 border-gray-600/80 text-gray-500'
                      )}
                    >
                      {law.status}
                    </span>
                  </div>

                  <p className="text-sm text-[#99A1AF] mb-4">
                    {law.description}
                  </p>

                  <div className="space-y-1.5 mb-3">
                    <p className="text-sm">
                      <span className="text-brand-accent-dark/60 mr-2">Authority: </span>
                      <span className="text-white">{law.authority}</span>
                    </p>
                    <p className="text-sm flex flex-wrap items-center gap-1.5">
                      <span className="text-brand-accent-dark/60 mr-2">Category: </span>
                      <span className="inline-flex items-center rounded border border-brand-accent-dark bg-brand-accent-dark/10 px-2 py-0.5 text-xs font-medium text-brand-accent-dark">
                        {law.category}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-white mb-5">
                    <Calendar className="w-4 h-4 text-brand-accent-dark shrink-0" />
                    <span className="mt-1">{law.publicationDate}</span>
                  </div>

                  <div className="flex justify-center pt-2 border-t border-brand-accent-dark/20">
                    <button
                      type="button"
                      onClick={() => setViewDocumentLaw(law)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-accent-dark hover:text-brand-accent-dark/90 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Document
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ViewDocumentDialog
        open={!!viewDocumentLaw}
        data={viewDocumentLaw ? lawToDialogData(viewDocumentLaw) : null}
        onClose={() => setViewDocumentLaw(null)}
      />
    </div>
  )
}
