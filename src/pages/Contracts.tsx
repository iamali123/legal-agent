import { useState } from 'react'
import { Eye, Pencil, Plus, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateContractDialog } from '@/components/CreateContractDialog'
import { ViewContractDialog, type ViewContractDialogData } from '@/components/ViewContractDialog'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'
import {
  useContracts,
  useCreateContract,
  useGenerateContractDraft,
} from '@/hooks/api'
import type { Contract } from '@/types/contract.types'

function deriveContractStats(items: Contract[]) {
  return {
    active: items.filter((i) => i.status === 'active').length,
    expiringSoon: items.filter((i) => i.status === 'expiring').length,
    inReview: items.filter((i) => i.status === 'inReview').length,
    aiRiskFlags: items.filter((i) => (i.aiFlags ?? 0) > 0).length,
  }
}

const summaryCardConfig = [
  { key: 'active' as const, label: 'Active Contracts', color: 'text-green-400' },
  { key: 'expiringSoon' as const, label: 'Expiring Soon', color: 'text-orange-400' },
  { key: 'inReview' as const, label: 'In Review', color: 'text-blue-400' },
  { key: 'aiRiskFlags' as const, label: 'AI Risk Flags', color: 'text-red-400' },
]

function contractToViewData(c: Contract): ViewContractDialogData {
  const statusLabel =
    c.status === 'active'
      ? 'Active'
      : c.status === 'inReview'
      ? 'In Review'
      : c.status === 'expiring'
      ? 'Expiring'
      : c.status === 'expired'
      ? 'Expired'
      : 'Terminated'
  return {
    id: c.id,
    title: c.title,
    counterparty: c.counterparty,
    type: c.type,
    value: c.value,
    status: statusLabel,
  }
}

export function Contracts() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewContract, setViewContract] = useState<Contract | null>(null)

  const { data: listData, isLoading, error } = useContracts()
  const createMutation = useCreateContract()
  const generateDraftMutation = useGenerateContractDraft()

  const items = listData?.data?.items ?? []
  const stats = deriveContractStats(items)

  const handleGenerateDraft = (data: {
    title: string
    contractType: string
    counterparty: string
    value: string
    durationMonths: string
    keyTerms: string
  }) => {
    createMutation.mutate(
      {
        title: data.title,
        contractType: data.contractType as Contract['type'],
        counterparty: data.counterparty,
        value: data.value,
        durationMonths: data.durationMonths,
        keyTerms: data.keyTerms,
      },
      {
        onSuccess: (res) => {
          const id = res.data?.id
          if (id) {
            generateDraftMutation.mutate({
              id,
              data: {
                title: data.title,
                contractType: data.contractType as Contract['type'],
                counterparty: data.counterparty,
                value: data.value,
                durationMonths: data.durationMonths,
                keyTerms: data.keyTerms,
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
        title="Contracts"
        subtitle="Manage and track your contracts with AI assistance"
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

      {/* Contracts Cards Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              All Contracts
            </h2>
            <Button
              className="bg-brand-accent-dark hover:bg-brand-accent-dark/90"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Contract
            </Button>
          </div>

          <CreateContractDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onGenerateDraft={handleGenerateDraft}
          />

          {error && (
            <p className="text-red-400 text-sm py-4">Failed to load contracts. Please try again.</p>
          )}

          {/* Contract cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <p className="text-brand-muted-text-dark col-span-2 py-8">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-brand-muted-text-dark col-span-2 py-8">No contracts found.</p>
            ) : (
              items.map((contract) => (
                <Card
                  key={contract.id}
                  className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
                >
                  <CardContent className="p-6 relative">
                    <CornerAccents />

                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-lg font-semibold text-white leading-tight pr-2">
                        {contract.title}
                      </h4>
                      {contract.aiFlags != null && contract.aiFlags > 0 && (
                        <div
                          className="flex items-center gap-1 shrink-0 text-red-500"
                          title={`${contract.aiFlags} AI risk flag(s)`}
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium">{contract.aiFlags}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-brand-muted-text-dark mb-4">
                      {contract.counterparty}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-brand-accent-dark/60">Type:</span>
                        <span className="text-brand-muted-text-dark">{contract.type}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-brand-accent-dark/60">Value:</span>
                        <span className="text-[#05DF72] font-medium">{contract.value}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-brand-accent-dark/60">Duration:</span>
                        <span className="text-brand-muted-text-dark">
                          {contract.startDate} → {contract.endDate}
                        </span>
                      </div>
                    </div>

                    <hr className="border-0 h-px bg-brand-accent-dark/20 mb-4" />

                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium border',
                          contract.status === 'active' &&
                            'bg-emerald-500/20 border-emerald-500/80 text-emerald-400',
                          contract.status === 'inReview' &&
                            'bg-blue-500/20 border-blue-500/80 text-blue-400',
                          contract.status === 'expiring' &&
                            'bg-orange-500/20 border-orange-500/80 text-orange-400',
                          (contract.status === 'expired' || contract.status === 'terminated') &&
                            'bg-gray-500/20 border-gray-500/80 text-gray-400'
                        )}
                      >
                        {contract.status === 'active'
                          ? 'Active'
                          : contract.status === 'inReview'
                          ? 'In Review'
                          : contract.status === 'expiring'
                          ? 'Expiring'
                          : contract.status === 'expired'
                          ? 'Expired'
                          : 'Terminated'}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setViewContract(contract)}
                          className="text-brand-muted-text-dark hover:text-brand-accent-dark/80 transition-colors"
                          aria-label="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
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
                          aria-label="AI details"
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <ViewContractDialog
        open={!!viewContract}
        data={viewContract ? contractToViewData(viewContract) : null}
        onClose={() => setViewContract(null)}
      />
    </div>
  )
}
