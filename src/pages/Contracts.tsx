import { useState } from 'react'
import { Eye, Pencil, Plus, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateContractDialog } from '@/components/CreateContractDialog'
import { ViewContractDialog, type ViewContractDialogData } from '@/components/ViewContractDialog'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'

const summaryCards = [
  { label: 'Active Contracts', value: '142', color: 'text-green-400' },
  { label: 'Expiring Soon', value: '8', color: 'text-orange-400' },
  { label: 'In Review', value: '15', color: 'text-blue-400' },
  { label: 'AI Risk Flags', value: '6', color: 'text-red-400' },
]

type ContractStatus = 'active' | 'expiring' | 'inReview'

interface Contract {
  id: string
  title: string
  counterparty: string
  type: string
  value: string
  startDate: string
  endDate: string
  status: ContractStatus
  aiFlags: number | null
}

const contracts: Contract[] = [
  {
    id: '1',
    title: 'IT Services Agreement',
    counterparty: 'Tech Solutions LLC',
    type: 'Service Agreement',
    value: 'AED 500,000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    aiFlags: null,
  },
  {
    id: '2',
    title: 'Consulting Services Contract',
    counterparty: 'Advisory Partners',
    type: 'Professional Services',
    value: 'AED 300,000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'inReview',
    aiFlags: 2,
  },
  {
    id: '3',
    title: 'Office Lease Contract',
    counterparty: 'Real Estate Holdings',
    type: 'Lease',
    value: 'AED 1,200,000',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    status: 'expiring',
    aiFlags: 2,
  },
  {
    id: '4',
    title: 'Consulting Framework Agreement',
    counterparty: 'Advisory Partners',
    type: 'Service Agreement',
    value: 'AED 280,000',
    startDate: '2024-03-01',
    endDate: '2025-03-15',
    status: 'active',
    aiFlags: null,
  },
  {
    id: '5',
    title: 'Software License Agreement',
    counterparty: 'CloudTech Inc',
    type: 'License',
    value: 'AED 150,000',
    startDate: '2024-01-01',
    endDate: '2024-08-20',
    status: 'expiring',
    aiFlags: 1,
  },
]

function contractToViewData(contract: Contract): ViewContractDialogData {
  return {
    id: contract.id,
    title: contract.title,
    counterparty: contract.counterparty,
    type: contract.type,
    value: contract.value,
    status:
      contract.status === 'active'
        ? 'Active'
        : contract.status === 'inReview'
        ? 'In Review'
        : 'Expiring',
  }
}

export function Contracts() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewContract, setViewContract] = useState<Contract | null>(null)

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Contracts"
        subtitle="Manage and track your contracts with AI assistance"
      />
      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="px-4 py-5 text-center bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 overflow-hidden relative"
            >
              <CornerAccents />
              <p className="text-xs text-brand-accent-dark mb-2 uppercase tracking-wide">
                {card.label}
              </p>
              <p className={cn('text-3xl font-bold', card.color)}>
                {card.value}
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
            onGenerateDraft={(data) => {
              console.log('Generate contract draft:', data)
            }}
          />

          {/* Contract cards - Law/Policy style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => (
              <Card
                key={contract.id}
                className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
              >
                <CardContent className="p-6 relative">
                  <CornerAccents />

                  {/* Title row: title (left) + optional warning (right) */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-lg font-semibold text-white leading-tight pr-2">
                      {contract.title}
                    </h4>
                    {contract.aiFlags != null && contract.aiFlags > 0 && (
                      <div className="flex items-center gap-1 shrink-0 text-red-500" title={`${contract.aiFlags} AI risk flag(s)`}>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">{contract.aiFlags}</span>
                      </div>
                    )}
                  </div>

                  {/* Subtitle - counterparty */}
                  <p className="text-sm text-brand-muted-text-dark mb-4">
                    {contract.counterparty}
                  </p>

                  {/* Key-value: Type, Value, Duration */}
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

                  {/* Separator */}
                  <hr className="border-0 h-px bg-brand-accent-dark/20 mb-4" />

                  {/* Bottom: status badge (left) + action icons (right) */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium border',
                        contract.status === 'active' &&
                          'bg-emerald-500/20 border-emerald-500/80 text-emerald-400',
                        contract.status === 'inReview' &&
                          'bg-blue-500/20 border-blue-500/80 text-blue-400',
                        contract.status === 'expiring' &&
                          'bg-orange-500/20 border-orange-500/80 text-orange-400'
                      )}
                    >
                      {contract.status === 'active'
                        ? 'Active'
                        : contract.status === 'inReview'
                        ? 'In Review'
                        : 'Expiring'}
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
            ))}
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
