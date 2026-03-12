import { useRef, useState } from 'react'
import { BookOpen, Calendar, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatDate } from '@/lib/utils'
import { CornerAccents } from '@/components/CornerAccents'
import { ViewDocumentDialog, type ViewDocumentDialogData } from '@/components/ViewDocumentDialog'
import { useLawsPolicies, useLawsPoliciesStats, useAiDocs, useAiDocChunks, useCreateLawPolicy } from '@/hooks/api'
import type { LawPolicy } from '@/types/law-policy.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadLawPolicyDocument } from '@/services/law-policy.service'
import { getAiDocChunks } from '@/services/ai-docs.service'

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
  const [viewLawSummary, setViewLawSummary] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formAuthority, setFormAuthority] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formEffectiveDate, setFormEffectiveDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAiDocId, setSelectedAiDocId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: listData, isLoading: listLoading, error: listError } = useLawsPolicies()
  const { data: statsData, isLoading: statsLoading } = useLawsPoliciesStats()
  const { data: aiDocsData, isLoading: _aiDocsLoading } = useAiDocs({
    entityType: 'LawPolicy',
  })
  const {
    data: selectedAiDocChunks,
    isLoading: selectedAiDocLoading,
  } = useAiDocChunks(selectedAiDocId || undefined)
  const createLawPolicyMutation = useCreateLawPolicy()

  const items = listData?.data?.items ?? []
  const stats = statsData?.data ?? {
    total: items.length,
    active: 0,
    amended: 0,
    categories: 0,
  }

  const isLoading = listLoading
  const error = listError

  const handleUploadClick = () => {
    setUploadMessage(null)
    setShowUploadDialog(true)
  }
  const handleViewLaw = async (law: LawPolicy) => {
    setViewDocumentLaw(law)
    setViewLawSummary(law.aiSummary)

    const aiDocForLaw = aiDocsData?.docs.find(
      (doc) => doc.entity_id === law.id && doc.status === 'processed'
    )
    if (!aiDocForLaw) return

    try {
      const chunks = await getAiDocChunks(aiDocForLaw.id)
      if (chunks.sections_metadata && chunks.sections_metadata.length > 0) {
        const largest = [...chunks.sections_metadata].sort(
          (a, b) =>
            (b.char_end - b.char_start) - (a.char_end - a.char_start)
        )[0]
        const sectionSummary = largest?.metadata?.summary
        if (sectionSummary) {
          setViewLawSummary(sectionSummary)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }


  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleSubmitUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedFile || !formTitle || !formDescription || !formAuthority || !formCategory) {
      setUploadMessage('Please fill in all fields and select a file.')
      return
    }

    setUploading(true)
    setUploadMessage(null)

    try {
      const effectiveDateIso = formEffectiveDate
        ? new Date(formEffectiveDate).toISOString()
        : new Date().toISOString()

      // 1) Create Law/Policy record
      const created = await createLawPolicyMutation.mutateAsync({
        title: formTitle,
        description: formDescription,
        authority: formAuthority,
        category: formCategory,
        status: 'Active',
        publicationDate: effectiveDateIso,
        effectiveDate: effectiveDateIso,
        content: '',
      })

      const lawId = created.data.id

      // 2) Upload document to AI backend, linked to this law
      const result = await uploadLawPolicyDocument(selectedFile, {
        entityType: 'LawPolicy',
        entityId: lawId,
      })

      const docId =
        (result as any)?.data?.id ??
        (result as any)?.id ??
        null

      setUploadMessage(
        docId
          ? `Document uploaded. Processing started (doc ID: ${docId}).`
          : 'Document uploaded. Processing has started.'
      )

      // Reset form and close dialog
      setShowUploadDialog(false)
      setFormTitle('')
      setFormDescription('')
      setFormAuthority('')
      setFormCategory('')
      setFormEffectiveDate('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error(err)
      setUploadMessage('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              Laws & Policies
            </h2>
            <span className="text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 mr-1 inline-block" /> Read-Only Access
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload & Analyze Document'}
            </Button>
          </div>
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
            items.map((law) => {
              const aiDocForLaw = aiDocsData?.docs.find((doc) => doc.entity_id === law.id)
              return (
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

                  {aiDocForLaw && (
                    <p className="text-xs text-brand-muted-text-dark mb-3">
                      AI Status:{' '}
                      <span className="text-brand-accent-dark">
                        {aiDocForLaw.status.charAt(0).toUpperCase() + aiDocForLaw.status.slice(1)}
                      </span>
                      {typeof aiDocForLaw.section_count === 'number' &&
                        aiDocForLaw.section_count > 0 && (
                          <> · Sections: {aiDocForLaw.section_count}</>
                        )}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-sm text-white mb-5">
                    <Calendar className="w-4 h-4 text-brand-accent-dark shrink-0" />
                    <span className="mt-1">{formatDate(law.publicationDate)}</span>
                  </div>

                  <div className="flex justify-center pt-2 border-t border-brand-accent-dark/20">
                    <button
                      type="button"
                      onClick={() => handleViewLaw(law)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-accent-dark hover:text-brand-accent-dark/90 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Document
                    </button>
                  </div>
                </CardContent>
              </Card>
            )})
          )}
        </div>
      </div>

      <ViewDocumentDialog
        open={!!viewDocumentLaw}
        data={
          viewDocumentLaw
            ? {
                ...lawToDialogData(viewDocumentLaw),
                aiSummary:
                  viewLawSummary || lawToDialogData(viewDocumentLaw).aiSummary,
              }
            : null
        }
        onClose={() => {
          setViewDocumentLaw(null)
          setViewLawSummary('')
        }}
      />

      {/* AI Document Content Dialog */}
      {selectedAiDocId && selectedAiDocChunks && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedAiDocId(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-3 border-b border-brand-accent-dark/20 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {selectedAiDocChunks.filename}
                </h2>
                <p className="text-xs text-brand-muted-text-dark mt-1">
                  AI-processed sections for this document
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs border',
                  selectedAiDocChunks.status === 'processed' &&
                    'bg-emerald-500/20 border-emerald-600/80 text-emerald-400',
                  selectedAiDocChunks.status === 'processing' &&
                    'bg-amber-500/20 border-amber-600/80 text-amber-400',
                  selectedAiDocChunks.status === 'pending' &&
                    'bg-sky-500/10 border-sky-500/60 text-sky-300',
                  selectedAiDocChunks.status === 'error' &&
                    'bg-red-500/20 border-red-600/80 text-red-400'
                )}
              >
                {selectedAiDocChunks.status.charAt(0).toUpperCase() +
                  selectedAiDocChunks.status.slice(1)}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 sidebar-nav-scroll">
              {selectedAiDocLoading ? (
                <p className="text-sm text-brand-muted-text-dark">Loading content…</p>
              ) : selectedAiDocChunks.sections_metadata.length === 0 ? (
                <p className="text-sm text-brand-muted-text-dark">
                  No processed sections available for this document yet.
                </p>
              ) : (
                selectedAiDocChunks.sections_metadata.map((section) => (
                  <div
                    key={section.chunk_id}
                    className="rounded-xl bg-[#0A162880] border border-brand-accent-dark/20 p-4"
                  >
                    <p className="text-xs text-brand-accent-dark uppercase tracking-wide mb-1">
                      {section.metadata?.section_label || section.boundary_label || 'Section'}
                    </p>
                    {section.metadata?.summary && (
                      <p className="text-sm text-white/80 leading-relaxed">
                        {section.metadata.summary}
                      </p>
                    )}
                    {typeof section.metadata?.clause_count === 'number' &&
                      section.metadata.clause_count > 0 && (
                        <p className="mt-2 text-xs text-brand-muted-text-dark">
                          Clauses: {section.metadata.clause_count}
                        </p>
                      )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-brand-accent-dark/20 flex justify-end">
              <Button type="button" size="sm" onClick={() => setSelectedAiDocId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload metadata + file dialog */}
      {showUploadDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !uploading && setShowUploadDialog(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-4 border-b border-brand-accent-dark/20">
              <h2 className="text-lg font-semibold text-white">
                Upload Law / Policy Document
              </h2>
              <p className="text-xs text-brand-muted-text-dark mt-1">
                Enter the details that will appear on the card and attach the source document.
              </p>
            </div>
            <form onSubmit={handleSubmitUpload} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 sidebar-nav-scroll">
              <div className="space-y-1">
                <Label htmlFor="law-title">Title</Label>
                <Input
                  id="law-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Data Protection Policy"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="law-description">Summary</Label>
                <Input
                  id="law-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Policy regarding handling of personal data."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="law-authority">Authority</Label>
                <Input
                  id="law-authority"
                  value={formAuthority}
                  onChange={(e) => setFormAuthority(e.target.value)}
                  placeholder="Federal Data Bureau"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="law-category">Category</Label>
                <Input
                  id="law-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Privacy"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="law-effective-date">Effective Date</Label>
                <Input
                  id="law-effective-date"
                  type="date"
                  value={formEffectiveDate}
                  onChange={(e) => setFormEffectiveDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="law-file">Document File</Label>
                <Input
                  id="law-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </div>
              {uploadMessage && (
                <p className="text-xs text-brand-accent-dark/80">
                  {uploadMessage}
                </p>
              )}
            </form>
            <div className="p-4 border-t border-brand-accent-dark/20 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={uploading} onClick={handleSubmitUpload}>
                {uploading ? 'Uploading…' : 'Save & Analyze'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
