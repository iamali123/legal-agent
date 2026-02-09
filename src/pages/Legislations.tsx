import { useState } from 'react'
import { Eye, Pencil, AlertTriangle, CheckCircle2, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreateLegislationDialog } from '@/components/CreateLegislationDialog'
import { CornerAccents } from '@/components/CornerAccents'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'

const summaryCards = [
  { label: 'TOTAL LEGISLATIONS', value: '247', color: 'text-brand-accent-dark' },
  { label: 'DRAFT', value: '23', color: 'text-orange-500' },
  { label: 'PUBLISHED', value: '198', color: 'text-green-500' },
  { label: 'AMENDMENTS PENDING', value: '12', color: 'text-purple-500' },
  { label: 'AI-FLAGGED RISKS', value: '8', color: 'text-red-500' },
]

const legislations = [
  {
    title: 'Data Protection Act 2024',
    jurisdiction: 'Federal',
    status: 'draft',
    lastUpdated: '2024-01-15',
    aiFlags: { type: 'warning', count: 2 },
  },
  {
    title: 'Environmental Compliance Law',
    jurisdiction: 'Emirate',
    status: 'active',
    lastUpdated: '2024-01-10',
    aiFlags: { type: 'clean' },
  },
  {
    title: 'Labor Rights Amendment',
    jurisdiction: 'Federal',
    status: 'active',
    lastUpdated: '2024-01-08',
    aiFlags: { type: 'warning', count: 1 },
  },
  {
    title: 'Corporate Governance Framework',
    jurisdiction: 'Emirate',
    status: 'draft',
    lastUpdated: '2024-01-05',
    aiFlags: { type: 'warning', count: 3 },
  },
]

export function Legislations() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Legislations"
        subtitle="Manage and draft legislations with AI assistance"
      />
      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Legislation Table Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              All Legislations
            </h2>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Legislation
            </Button>
          </div>

          <CreateLegislationDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onSave={(data) => {
              // Optional: persist draft
              console.log('Save draft:', data)
            }}
            onGenerateDraft={(data) => {
              // Optional: trigger AI draft generation
              console.log('Generate draft:', data)
            }}
          />

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
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      Jurisdiction
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      AI Flags
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent-dark uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {legislations.map((legislation, index) => (
                    <tr
                      key={index}
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
                        <Badge
                          variant={
                            legislation.status === 'draft'
                              ? 'draft'
                              : legislation.status === 'active'
                              ? 'active'
                              : 'clean'
                          }
                        >
                          {legislation.status.charAt(0).toUpperCase() +
                            legislation.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-muted-text-dark">
                          {legislation.lastUpdated}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {legislation.aiFlags.type === 'clean' ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500">Clean</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-500">
                              A{legislation.aiFlags.count}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button className="text-brand-muted-text-dark hover:text-brand-accent-dark transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-brand-muted-text-dark hover:text-brand-accent-dark transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button className="text-brand-muted-text-dark hover:text-brand-accent-dark transition-colors">
                          <Sparkles className="w-5 h-5 text-brand-accent-dark" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
