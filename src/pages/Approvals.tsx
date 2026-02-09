import { useState } from 'react'
import { Eye, Check, X, Clock, FileText, User, Calendar, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ApprovalViewDialog, type ApprovalViewDialogData } from '@/components/ApprovalViewDialog'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { CornerAccents } from '@/components/CornerAccents'

const summaryCards = [
  { label: 'Pending Approvals', value: '18', color: 'text-orange-400' },
  { label: 'Approved Today', value: '7', color: 'text-green-400' },
  { label: 'Urgent', value: '5', color: 'text-red-400' },
  { label: 'In Review', value: '9', color: 'text-blue-400' },
]

type ApprovalPriority = 'Medium' | 'High'
type ApprovalStatus = 'pending' | 'approved'

interface Approval {
  id: string
  title: string
  type: string
  assignee: string
  dueDate: string
  priority: ApprovalPriority
  status: ApprovalStatus
  aiRecommendation: string
  confidence: number
}

const approvals: Approval[] = [
  {
    id: '1',
    title: 'New Legislation Draft - Data Privacy',
    type: 'Legislation',
    assignee: 'Michael Chen',
    dueDate: '2024-01-25',
    priority: 'Medium',
    status: 'pending',
    aiRecommendation: 'Review Required',
    confidence: 78,
  },
  {
    id: '2',
    title: 'Partnership Agreement Renewal',
    type: 'Agreement',
    assignee: 'Emma Wilson',
    dueDate: '2024-01-20',
    priority: 'High',
    status: 'approved',
    aiRecommendation: 'Approve',
    confidence: 96,
  },
  {
    id: '3',
    title: 'IT Services Agreement - Tech Solutions LLC',
    type: 'Contract',
    assignee: 'Sarah Ahmed',
    dueDate: '2024-01-22',
    priority: 'High',
    status: 'pending',
    aiRecommendation: 'Review Required',
    confidence: 82,
  },
  {
    id: '4',
    title: 'Office Lease Amendment - Real Estate Holdings',
    type: 'Contract',
    assignee: 'Fatima Hassan',
    dueDate: '2024-01-18',
    priority: 'Medium',
    status: 'pending',
    aiRecommendation: 'Approve',
    confidence: 91,
  },
]

function approvalToViewData(approval: Approval): ApprovalViewDialogData {
  return {
    title: approval.title,
    type: approval.type,
    submittedBy: approval.assignee,
    date: approval.dueDate,
    priority: approval.priority,
    status: approval.status === 'pending' ? 'Pending' : 'Approved',
    aiRecommendation: approval.aiRecommendation,
    confidence: approval.confidence,
    aiSummary: `AI Recommendation: ${approval.aiRecommendation} (${approval.confidence}% confidence)`,
  }
}

export function Approvals() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewData, setViewData] = useState<ApprovalViewDialogData | null>(null)

  const openView = (approval: (typeof approvals)[0]) => {
    setViewData(approvalToViewData(approval))
    setViewDialogOpen(true)
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Approvals"
        subtitle="Review and approve pending items"
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

      {/* Approvals Cards Section */}
      <div className="px-8 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              Approval Queue
            </h2>
          </div>

          {/* Approval cards */}
          <div className="grid grid-cols-1 gap-4">
            {approvals.map((approval) => (
              <Card
                key={approval.id}
                className="rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30 relative overflow-hidden hover:border-brand-accent-dark/50 transition-colors"
              >
                <CardContent className="p-6 relative">
                  <CornerAccents />

                  {/* Title row: title (left) + priority tag (middle) + status tag (right) */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2"> 
                    <h4 className="text-lg font-semibold text-white leading-tight pr-2 flex-1">
                      {approval.title}
                    </h4>
                      {/* Priority tag */}
                      <span
                        className={cn(
                          'rounded px-2.5 py-1 text-xs font-medium border',
                          approval.priority === 'Medium' &&
                            'bg-orange-600/20 border border-orange-600/80 text-orange-400',
                          approval.priority === 'High' &&
                            'bg-red-600/20 border border-red-600/80 text-red-400'
                        )}
                      >
                        {approval.priority}
                      </span>
                    </div>
                      {/* Status tag */}
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium border',
                          approval.status === 'pending' &&
                            'bg-yellow-700/20 border border-yellow-700/80 text-yellow-400',
                          approval.status === 'approved' &&
                            'bg-green-600/20 border border-green-600/80 text-green-400'
                        )}
                      >
                        {approval.status === 'pending' ? 'Pending' : 'Approved'}
                      </span>
                  </div>

                  {/* Metadata section: Type, Assignee, Due Date */}
                  <div className="space-y-1.5 mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-brand-muted-text-dark">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>{approval.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-brand-muted-text-dark">
                      <User className="w-4 h-4 shrink-0" />
                      <span>{approval.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-brand-muted-text-dark">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Due: {approval.dueDate}</span>
                    </div>
                  </div>

                  {/* AI Recommendation section */}
                  <div className="mb-4 border bg-[#0A162880] border-brand-accent-dark/20 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-accent-dark/20 border border-brand-accent-dark/30 shrink-0">
              <Info className="w-5 h-5 text-brand-accent-dark shrink-0" />
              </div>
                        <div>
                      <p className=" text-brand-accent-dark/60 uppercase tracking-wide">
                        AI RECOMMENDATION
                      </p>
                      <p className="text-sm font-medium text-white">
                        {approval.aiRecommendation}
                      </p>
                      </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base text-brand-accent-dark/60 uppercase tracking-wide">
                          CONFIDENCE
                        </p>
                        
                        <p className="text-lg font-bold text-[#00BFFF]">
                          {approval.confidence}%
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-[#00BFFF] transition-all"
                        style={{ width: `${approval.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons - only show for pending */}
                  {approval.status === 'pending' && (
                    <div className="flex items-center gap-3">
                                           <button
                        type="button"
                        className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                        aria-label="Approve"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        aria-label="Reject"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openView(approval)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                        aria-label="Review"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Review</span>
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <ApprovalViewDialog
        open={viewDialogOpen}
        data={viewData}
        onClose={() => {
          setViewDialogOpen(false)
          setViewData(null)
        }}
        onRequestChanges={(data) => console.log('Request changes:', data)}
        onReject={(data) => console.log('Reject:', data)}
        onApprove={(data) => console.log('Approve:', data)}
      />
    </div>
  )
}
