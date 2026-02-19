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
  currency: string
  startDate: string
  endDate: string
  durationMonths: string
  status: string
  keyTerms: string
  content?: string
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
  const [currency, setCurrency] = useState('AED')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [status, setStatus] = useState('draft')
  const [keyTerms, setKeyTerms] = useState('')
  const [content, setContent] = useState('')

  const handleClose = () => {
    setTitle('')
    setContractType('')
    setCounterparty('')
    setValue('')
    setCurrency('AED')
    setStartDate('')
    setEndDate('')
    setDurationMonths('')
    setStatus('draft')
    setKeyTerms('')
    setContent('')
    onClose()
  }

  const handleGenerateDraft = () => {
    onGenerateDraft?.({
      title,
      contractType,
      counterparty,
      value,
      currency,
      startDate,
      endDate,
      durationMonths,
      status,
      keyTerms,
      content: content.trim() || undefined,
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
        className="w-full max-w-lg max-h-[90vh] rounded-xl shadow-xl border border-brand-accent-dark/30 bg-[#0A1628] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - icon + title + subtitle, same as CreateLegislationDialog */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 shrink-0">
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
        <div className="px-6 pb-4 space-y-3 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll">
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
                Contract Value
              </Label>
              <Input
                id="contract-value"
                type="number"
                min={0}
                step={0.01}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g., 500000"
                className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contract-currency" className="text-brand-accent-dark">
                Currency
              </Label>
              <select
                id="contract-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="contract-start-date" className="text-brand-accent-dark">
                Start Date
              </Label>
              <Input
                id="contract-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contract-end-date" className="text-brand-accent-dark">
                End Date
              </Label>
              <Input
                id="contract-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="contract-duration" className="text-brand-accent-dark">
                Duration (months)
              </Label>
              <Input
                id="contract-duration"
                type="number"
                min={1}
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="12"
                className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contract-status" className="text-brand-accent-dark">
                Status
              </Label>
              <select
                id="contract-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
              </select>
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
              placeholder='Describe key terms as JSON object (e.g., {"autoRenew": true, "terminationNoticeDays": 30}) or plain text'
              rows={3}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'resize-y min-h-[60px]'
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contract-content" className="text-brand-accent-dark">
              Content (Optional)
            </Label>
            <textarea
              id="contract-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contract content text..."
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
        <div className="grid grid-cols-2 gap-3 p-6 pt-2 shrink-0">
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
