import { useState } from 'react'
import { BookOpen, Calendar, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { CornerAccents } from '@/components/CornerAccents'
import { ViewDocumentDialog, type ViewDocumentDialogData } from '@/components/ViewDocumentDialog'

const summaryCards = [
  { label: 'Total Laws', value: '1,247', color: 'text-brand-accent-dark' },
  { label: 'Active', value: '1,089', color: 'text-orange-500' },
  { label: 'Amended', value: '142', color: 'text-orange-500' },
  { label: 'Categories', value: '28', color: 'text-orange-500' },
]

type LawStatus = 'Active' | 'Amended'

interface LawPolicy {
  id: string
  title: string
  description: string
  authority: string
  category: string
  status: LawStatus
  publicationDate: string
  effectiveDate: string
  aiSummary: string
}

const lawsAndPolicies: LawPolicy[] = [
  {
    id: '1',
    title: 'Federal Law No. 8 of 1980',
    description: 'Regulation of Labor Relations',
    authority: 'Federal Government',
    category: 'Labor',
    status: 'Amended',
    publicationDate: '1980-05-01',
    effectiveDate: '1980-05-01',
    aiSummary:
      'This law regulates labor relations between employers and employees. Access to full text and amendments is available through the document repository.',
  },
  {
    id: '2',
    title: 'Abu Dhabi Law No. 2 of 2019',
    description: 'Commercial Companies Law',
    authority: 'Abu Dhabi Government',
    category: 'Commercial',
    status: 'Active',
    publicationDate: '2019-03-15',
    effectiveDate: '2019-03-15',
    aiSummary:
      'This law establishes the framework for commercial companies in Abu Dhabi. Access to full text and amendments is available through the document repository.',
  },
  {
    id: '3',
    title: 'Federal Decree-Law No. 45 of 2021',
    description: 'On the Protection of Personal Data',
    authority: 'Federal Government',
    category: 'Cybersecurity',
    status: 'Active',
    publicationDate: '2022-01-02',
    effectiveDate: '2022-01-02',
    aiSummary:
      'This law establishes comprehensive regulations for personal data protection. Access to full text and amendments is available through the document repository.',
  },
  {
    id: '4',
    title: 'Dubai Law No. 26 of 2015',
    description: 'Regulating the Real Estate Sector in the Emirate of Dubai',
    authority: 'Dubai Government',
    category: 'Real Estate',
    status: 'Active',
    publicationDate: '2015-09-01',
    effectiveDate: '2015-09-01',
    aiSummary:
      'This law establishes comprehensive regulations and standards for the real estate sector. Access to full text and amendments is available through the document repository.',
  },
  {
    id: '5',
    title: 'Federal Law No. 2 of 2015',
    description: 'On Commercial Companies',
    authority: 'Federal Government',
    category: 'Commercial',
    status: 'Active',
    publicationDate: '2015-07-01',
    effectiveDate: '2015-07-01',
    aiSummary:
      'This law governs the establishment and operation of commercial companies. Access to full text and amendments is available through the document repository.',
  },
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

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Laws & Policies"
        subtitle="Search, view, and analyze existing laws and policies"
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
      <div className="px-8 py-6 max-w-7xl mx-auto">
      
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xl font-semibold text-brand-accent-dark">
          Laws & Policies
            </h2>
          <span className="text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4 mr-1 inline-block" /> Read-Only Access
          </span>
        </div>

        {/* Law/Policy cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lawsAndPolicies.map((law) => (
            <Card
              key={law.id}
              className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
            >
              <CardContent className="p-6 relative">
                {/* Corner accents */}
                <CornerAccents />

                {/* Title row: title (left) + status badge (right) */}
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
                        'bg-emerald-500/20 border-emerald-600/80 text-emerald-500'
                    )}
                  >
                    {law.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#99A1AF] mb-4">
                  {law.description}
                </p>

                {/* Authority & Category - labels in cyan, values inline */}
                <div className="space-y-1.5 mb-3">
                  <p className="text-sm">
                    <span className="text-brand-accent-dark/60 mr-2">Authority: </span>
                    <span className="text-white">{law.authority}</span>
                  </p>
                  <p className="text-sm flex flex-wrap items-center gap-1.5">
                    <span className="text-brand-accent-dark/60 mr-2">Category: </span>
                    <span
                      className="inline-flex items-center rounded border border-brand-accent-dark bg-brand-accent-dark/10 px-2 py-0.5 text-xs font-medium text-brand-accent-dark"
                    >
                      {law.category}
                    </span>
                  </p>
                </div>

                {/* Publication date with calendar icon */}
                <div className="flex items-center gap-1.5 text-sm text-white mb-5">
                  <Calendar className="w-4 h-4 text-brand-accent-dark shrink-0" />
                  <span className='mt-1'>{law.publicationDate}</span>
                </div>

                {/* View Full Document - centered at bottom */}
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
          ))}
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
