import { useState } from 'react'
import { Sparkles, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const CONTRACT_TYPE_OPTIONS = ['Service Agreement', 'Lease', 'License', 'NDA', 'Other']

export interface CreateContractFormData {
  title: string
  contractType: string
  counterparty: string
  value: string
  durationMonths: string
  keyTerms: string
}

interface CreateContractDialogProps {
  open: boolean
  onClose: () => void
  onGenerateDraft?: (data: CreateContractFormData) => void
}

export function CreateContractDialog({
  open,
  onClose,
  onGenerateDraft,
}: CreateContractDialogProps) {
  const [title, setTitle] = useState('')
  const [contractType, setContractType] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [value, setValue] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [keyTerms, setKeyTerms] = useState('')

  const handleClose = () => {
    setTitle('')
    setContractType('')
    setCounterparty('')
    setValue('')
    setDurationMonths('')
    setKeyTerms('')
    onClose()
  }

  const handleGenerateDraft = () => {
    onGenerateDraft?.({
      title,
      contractType,
      counterparty,
      value,
      durationMonths,
      keyTerms,
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
        {/* Header - icon + title + subtitle, same as CreateLegislationDialog */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3244DD]/10 shrink-0">
                <Sparkles className="w-5 h-5 text-brand-accent-dark shrink-0" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Create Contract
                </h2>
                <p className="text-sm text-brand-muted-text-dark">
                  Create a new contract with AI assistance
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

        {/* Form - labels/inputs styled like CreateLegislationDialog */}
        <div className="px-6 pb-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="contract-title" className="text-brand-accent-dark">
              Contract Title
            </Label>
            <Input
              id="contract-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., IT Services Agreement"
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contract-type" className="text-brand-accent-dark">
              Contract Type
            </Label>
            <div className="relative">
              <select
                id="contract-type"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                <option value="">Select type</option>
                {CONTRACT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contract-counterparty" className="text-brand-accent-dark">
              Counterparty
            </Label>
            <Input
              id="contract-counterparty"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="Company/Individual name"
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="contract-value" className="text-brand-accent-dark">
                Contract Value (AED)
              </Label>
              <Input
                id="contract-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g., 500,000"
                className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contract-duration" className="text-brand-accent-dark">
                Duration (months)
              </Label>
              <Input
                id="contract-duration"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="12"
                className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contract-key-terms" className="text-brand-accent-dark">
              Key Terms & Requirements
            </Label>
            <textarea
              id="contract-key-terms"
              value={keyTerms}
              onChange={(e) => setKeyTerms(e.target.value)}
              placeholder="Describe the main terms, deliverables, and requirements..."
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
