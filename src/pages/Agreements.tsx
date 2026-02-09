import { useState } from 'react'
import { Eye, Pencil, Plus, Sparkles, Calendar, Users, CircleCheckBig } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateAgreementDialog } from '@/components/CreateAgreementDialog'
import { ViewAgreementDialog, type ViewAgreementDialogData } from '@/components/ViewAgreementDialog'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'

const summaryCards = [
  { label: 'Active Agreements', value: '89', color: 'text-blue-400' },
  { label: 'Pending Signature', value: '67', color: 'text-green-400' },
  { label: 'In Negotiation', value: '12', color: 'text-orange-400' },
  { label: 'Renewed This Month', value: '5', color: 'text-purple-400' },
]

type AgreementStatus = 'active' | 'pending' | 'inNegotiation'

interface Agreement {
  id: string
  title: string
  parties: string
  type: string
  date: string
  status: AgreementStatus
  aiSuggestions: number | null
}

const agreements: Agreement[] = [
  {
    id: '1',
    title: 'Partnership MOU',
    parties: 'MBRHE & Tech Innovation Hub',
    type: 'Memorandum of Understanding',
    date: '2024-01-10',
    status: 'active',
    aiSuggestions: null,
  },
  {
    id: '2',
    title: 'Non-Disclosure Agreement',
    parties: 'MBRHE & Consulting Partners',
    type: 'NDA',
    date: '2024-01-05',
    status: 'active',
    aiSuggestions: 1,
  },
  {
    id: '3',
    title: 'Service Level Agreement',
    parties: 'MBRHE & Cloud Services Ltd',
    type: 'SLA',
    date: '2024-01-15',
    status: 'active',
    aiSuggestions: null,
  },
  {
    id: '4',
    title: 'Joint Venture Framework',
    parties: 'MBRHE & Regional Partners',
    type: 'Memorandum of Understanding',
    date: '2024-01-08',
    status: 'active',
    aiSuggestions: 2,
  },
]

function agreementToViewData(agreement: Agreement): ViewAgreementDialogData {
  return {
    id: agreement.id,
    title: agreement.title,
    parties: agreement.parties,
    type: agreement.type,
    date: agreement.date,
    status:
      agreement.status === 'active'
        ? 'Active'
        : agreement.status === 'pending'
        ? 'Pending Signature'
        : 'In Negotiation',
  }
}

export function Agreements() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewAgreement, setViewAgreement] = useState<Agreement | null>(null)

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Agreements"
        subtitle="Manage agreements and collaborate with AI suggestions"
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

      {/* Agreements Cards Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              All Agreements
            </h2>
            <Button
              className="bg-brand-accent-dark hover:bg-brand-accent-dark/90"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </div>

          <CreateAgreementDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onGenerateDraft={(data) => {
              console.log('Generate agreement draft:', data)
            }}
          />

          {/* Agreement cards - Contracts style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agreements.map((agreement) => (
              <Card
                key={agreement.id}
                className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
              >
                <CardContent className="p-6 relative">
                  <CornerAccents />

                  {/* Title row: title (left) + optional warning (right) */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-lg font-semibold text-white leading-tight pr-2">
                      {agreement.title}
                    </h4>
                    {agreement.aiSuggestions != null && agreement.aiSuggestions > 0 && (
                      <div className="flex items-center gap-1 shrink-0 text-green-500" title={`${agreement.aiSuggestions} AI suggestion(s)`}>
                        <CircleCheckBig className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">{agreement.aiSuggestions}%</span>
                      </div>
                    )}
                  </div>

                  {/* Subtitle - parties */}
                  <p className="text-sm text-brand-muted-text-dark mb-4">
                  <Users className="w-4 h-4 text-brand-muted-text-dark shrink-0 inline-block -mt-1" /> 2 Parties
                  </p>

                  {/* Key-value: Type, Date */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-brand-accent-dark/60">Type:</span>
                      <span
                      className="inline-flex items-center rounded border border-brand-accent-dark bg-brand-accent-dark/10 px-2 py-0.5 text-xs font-medium text-brand-accent-dark"
                    >
                      {agreement.type}
                    </span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-brand-accent-dark/60">Parties:</span>
                      <span className="text-brand-muted-text-dark">{agreement.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-brand-muted-text-dark mb-5">
                  <Calendar className="w-4 h-4 text-brand-accent-dark shrink-0" />
                  <span className='mt-1'>{agreement.date}</span>
                </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-0 h-px bg-brand-accent-dark/20 mb-4" />

                  {/* Bottom: status badge (left) + action icons (right) */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium border',
                        agreement.status === 'active' &&
                          'bg-emerald-500/20 border-emerald-500/80 text-emerald-400',
                        agreement.status === 'pending' &&
                          'bg-blue-500/20 border-blue-500/80 text-blue-400',
                        agreement.status === 'inNegotiation' &&
                          'bg-orange-500/20 border-orange-500/80 text-orange-400'
                      )}
                    >
                      {agreement.status === 'active'
                        ? 'Active'
                        : agreement.status === 'pending'
                        ? 'Pending Signature'
                        : 'In Negotiation'}
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
