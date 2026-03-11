import { useState } from 'react'
import { Eye, Pencil, Plus, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateContractDialog } from '@/components/CreateContractDialog'
import { ViewContractDialog, type ViewContractDialogData } from '@/components/ViewContractDialog'
import { cn, formatDate } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'
import {
  useContracts,
  useCreateContract,
  useGenerateContractDraft,
  useIsAdmin,
} from '@/hooks/api'
import type { Contract, ContractStatus } from '@/types/contract.types'

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  active: 'Active',
  expired: 'Expired',
  terminated: 'Terminated',
}

function deriveContractStats(items: Contract[]) {
  return {
    draft: items.filter((i) => i.status === 'draft').length,
    pending_approval: items.filter((i) => i.status === 'pending_approval').length,
    approved: items.filter((i) => i.status === 'approved').length,
    active: items.filter((i) => i.status === 'active').length,
    expired: items.filter((i) => i.status === 'expired').length,
    terminated: items.filter((i) => i.status === 'terminated').length,
  }
}

const summaryCardConfig = [
  { key: 'draft' as const, label: 'Draft', color: 'text-gray-400' },
  { key: 'pending_approval' as const, label: 'Pending Approval', color: 'text-orange-400' },
  { key: 'active' as const, label: 'Active', color: 'text-green-400' },
  { key: 'expired' as const, label: 'Expired', color: 'text-red-400' },
]

function contractToViewData(c: Contract): ViewContractDialogData {
  return {
    id: c.id,
    title: c.title,
    counterparty: c.counterparty,
    type: c.type,
    value: c.value,
    status: CONTRACT_STATUS_LABELS[c.status],
    startDate: c.startDate,
    endDate: c.endDate,
    content: c.content,
  }
}

export function Contracts() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewContract, setViewContract] = useState<Contract | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const isAdmin = useIsAdmin()

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
    currency: string
    startDate: string
    endDate: string
    durationMonths: string
    status: string
    keyTerms: string
    content?: string
  }) => {
    const valueNumeric = parseFloat(data.value) || 0
    const durationMonthsNum = parseInt(data.durationMonths, 10) || 0

    const createRequest = {
      title: data.title,
      counterparty: data.counterparty,
      type: data.contractType as Contract['type'],
      valueNumeric,
      currency: data.currency,
      startDate: data.startDate,
      endDate: data.endDate,
      durationMonths: durationMonthsNum,
      status: data.status as Contract['status'],
      keyTerms: data.keyTerms,
      ...(data.content && { content: data.content }),
    }

    createMutation.mutate(createRequest, {
      onSuccess: (res) => {
        const id = res.data?.id
        setCreateDialogOpen(false)
        if (id) {
          setGeneratingId(id)
          generateDraftMutation.mutate(id, {
            onSettled: () => setGeneratingId(null),
          })
        }
      },
    })
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
            {isAdmin && (
              <Button
                className="bg-brand-accent-dark hover:bg-brand-accent-dark/90"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
            )}
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
                          {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                        </span>
                      </div>
                    </div>

                    <hr className="border-0 h-px bg-brand-accent-dark/20 mb-4" />

                    {generatingId === contract.id && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-brand-accent-dark animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        Generating AI draft…
                      </div>
                    )}
                    {contract.content && generatingId !== contract.id && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Draft Ready
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium border',
                          contract.status === 'active' &&
                            'bg-emerald-500/20 border-emerald-500/80 text-emerald-400',
                          contract.status === 'pending_approval' &&
                            'bg-blue-500/20 border-blue-500/80 text-blue-400',
                          contract.status === 'approved' &&
                            'bg-cyan-500/20 border-cyan-500/80 text-cyan-400',
                          contract.status === 'draft' &&
                            'bg-gray-500/20 border-gray-500/80 text-gray-400',
                          (contract.status === 'expired' || contract.status === 'terminated') &&
                            'bg-gray-500/20 border-gray-500/80 text-gray-400'
                        )}
                      >
                        {CONTRACT_STATUS_LABELS[contract.status]}
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
                        {isAdmin && (
                          <button
                            type="button"
                            className="text-brand-muted-text-dark hover:text-brand-accent-dark/80 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
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

      <ViewContractDialog
        open={!!viewContract}
        data={viewContract ? contractToViewData(viewContract) : null}
        onClose={() => setViewContract(null)}
      />
    </div>
  )
}
