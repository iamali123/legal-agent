import { useState } from 'react'
import { Sparkles, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const AGREEMENT_TYPE_OPTIONS = [
  'Memorandum of Understanding',
  'NDA',
  'SLA',
  'Joint Venture',
  'Partnership',
  'Other',
]

export interface CreateAgreementFormData {
  title: string
  agreementType: string
  partiesInvolved: string
  purposeAndObjectives: string
}

interface CreateAgreementDialogProps {
  open: boolean
  onClose: () => void
  onGenerateDraft?: (data: CreateAgreementFormData) => void
}

export function CreateAgreementDialog({
  open,
  onClose,
  onGenerateDraft,
}: CreateAgreementDialogProps) {
  const [title, setTitle] = useState('')
  const [agreementType, setAgreementType] = useState('')
  const [partiesInvolved, setPartiesInvolved] = useState('')
  const [purposeAndObjectives, setPurposeAndObjectives] = useState('')

  const handleClose = () => {
    setTitle('')
    setAgreementType('')
    setPartiesInvolved('')
    setPurposeAndObjectives('')
    onClose()
  }

  const handleGenerateDraft = () => {
    onGenerateDraft?.({
      title,
      agreementType,
      partiesInvolved,
      purposeAndObjectives,
    })
    handleClose()
  }

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-xl border border-brand-accent-dark/30 bg-[#0A1628] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - icon + title + subtitle, same as CreateContractDialog */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3244DD]/10 shrink-0">
                <Sparkles className="w-5 h-5 text-brand-accent-dark shrink-0" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Create Agreement
                </h2>
                <p className="text-sm text-brand-muted-text-dark">
                  Create a new agreement with AI assistance
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-brand-muted-text-dark hover:text-foreground transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - labels/inputs styled like CreateContractDialog */}
        <div className="px-6 pb-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="agreement-title" className="text-brand-accent-dark">
              Agreement Title
            </Label>
            <Input
              id="agreement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Partnership MOU"
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-type" className="text-brand-accent-dark">
              Agreement Type
            </Label>
            <div className="relative">
              <select
                id="agreement-type"
                value={agreementType}
                onChange={(e) => setAgreementType(e.target.value)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                <option value="">Select type</option>
                {AGREEMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-parties" className="text-brand-accent-dark">
              Parties Involved
            </Label>
            <Input
              id="agreement-parties"
              value={partiesInvolved}
              onChange={(e) => setPartiesInvolved(e.target.value)}
              placeholder="e.g., MBRHE & Partner Organization"
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-purpose" className="text-brand-accent-dark">
              Purpose & Objectives
            </Label>
            <textarea
              id="agreement-purpose"
              value={purposeAndObjectives}
              onChange={(e) => setPurposeAndObjectives(e.target.value)}
              placeholder="Describe the purpose and key objectives of this agreement..."
              rows={4}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'resize-y min-h-[80px]'
              )}
            />
          </div>
        </div>

        {/* Actions - Cancel (outline) + Generate Draft (gradient with Sparkles) */}
        <div className="grid grid-cols-2 gap-3 p-6 pt-2">
          <Button variant="outline" onClick={handleClose} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleGenerateDraft}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Draft
          </Button>
        </div>
      </div>
    </div>
  )
}
