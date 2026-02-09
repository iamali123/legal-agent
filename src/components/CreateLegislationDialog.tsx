import { useState } from 'react'
import { Sparkles, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const JURISDICTION_OPTIONS = ['Federal', 'Emirate', 'Local']

const AI_BENEFITS = [
  'Suggested title and structure',
  'Relevant legal references',
  'Standard clauses and provisions',
  'Cross-law validation',
  'Compliance checks',
]

interface CreateLegislationDialogProps {
  open: boolean
  onClose: () => void
  onSave?: (data: { title: string; jurisdiction: string; description: string }) => void
  onGenerateDraft?: (data: { title: string; jurisdiction: string; description: string }) => void
}

export function CreateLegislationDialog({
  open,
  onClose,
  onSave,
  onGenerateDraft,
}: CreateLegislationDialogProps) {
  const [title, setTitle] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setTitle('')
    setJurisdiction('')
    setDescription('')
    onClose()
  }

  const handleCancel = () => {
    handleClose()
  }

  const handleGenerateDraft = () => {
    onGenerateDraft?.({ title, jurisdiction, description })
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
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3244DD]/10 shrink-0">
              <Sparkles className="w-5 h-5 text-brand-accent-dark shrink-0" />
              </div>
              <div>
              <h2 className="text-xl font-semibold text-white">
                Create Legislation
              </h2>
              <p className="text-sm text-brand-muted-text-dark">
              Let AI assist you in creating a new legislation.
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

        {/* Form */}
        <div className="px-6 pb-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="legislation-title" className='text-brand-accent-dark'>Legislation Title</Label>
            <Input
              id="legislation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Data Protection Act 2024"
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="legislation-jurisdiction" className='text-brand-accent-dark'>Jurisdiction</Label>
            <div className="relative">
              <select
                id="legislation-jurisdiction"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                <option value="">Select jurisdiction</option>
                {JURISDICTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="legislation-description" className='text-brand-accent-dark'>Brief Description</Label>
            <textarea
              id="legislation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose and scope of this legislation..."
              rows={4}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
              )}
            />
          </div>

          {/* AI Will Provide */}
          <div className="rounded-lg border border-brand-accent-dark/30 bg-brand-accent-dark/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0" />
              <h3 className="font-semibold text-white text-sm">
                AI Will Provide:
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-brand-muted-text-dark list-disc list-inside">
              {AI_BENEFITS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 p-6 pt-2">
          <Button variant="outline" onClick={handleCancel} className='bg-transparent' >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateDraft}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Draft
          </Button>
        </div>
      </div>
    </div>
  )
}
