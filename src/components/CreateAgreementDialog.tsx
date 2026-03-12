import { useState } from 'react'
import { Sparkles, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AgreementStatus, AgreementType } from '@/types/agreement.types'
import { useTranslation } from 'react-i18next'

const AGREEMENT_TYPE_OPTIONS: { value: AgreementType; labelKey: string }[] = [
  { value: 'Memorandum of Understanding', labelKey: 'createAgreement.mou' },
  { value: 'NDA', labelKey: 'createAgreement.nda' },
  { value: 'SLA', labelKey: 'createAgreement.sla' },
  { value: 'Joint Venture', labelKey: 'createAgreement.jointVenture' },
  { value: 'Partnership', labelKey: 'createAgreement.partnership' },
  { value: 'Other', labelKey: 'createAgreement.other' },
]

const STATUS_OPTIONS: { value: AgreementStatus; labelKey: string }[] = [
  { value: 'draft', labelKey: 'agreements.draft' },
  { value: 'active', labelKey: 'agreements.active' },
  { value: 'terminated', labelKey: 'agreements.terminated' },
]

export interface CreateAgreementFormData {
  title: string
  parties: string[]
  type: AgreementType
  purposeAndObjectives: string
  status: AgreementStatus
  content?: string
  date: string
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
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<AgreementType | ''>('')
  const [partiesInput, setPartiesInput] = useState('') // Comma-separated input
  const [purposeAndObjectives, setPurposeAndObjectives] = useState('')
  const [status, setStatus] = useState<AgreementStatus>('draft')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')

  const handleClose = () => {
    setTitle('')
    setType('')
    setPartiesInput('')
    setPurposeAndObjectives('')
    setStatus('draft')
    setContent('')
    setDate('')
    onClose()
  }

  const handleGenerateDraft = () => {
    // Convert comma-separated parties string to array
    const parties = partiesInput
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    if (!type) {
      return // Type is required
    }

    onGenerateDraft?.({
      title,
      parties,
      type: type as AgreementType,
      purposeAndObjectives,
      status,
      content: content.trim() || undefined,
      date,
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
        {/* Header - icon + title + subtitle, same as CreateContractDialog */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3244DD]/10 shrink-0">
                <Sparkles className="w-5 h-5 text-brand-accent-dark shrink-0" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t('createAgreement.title')}
                </h2>
                <p className="text-sm text-brand-muted-text-dark">
                  {t('createAgreement.subtitle')}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-brand-muted-text-dark hover:text-foreground transition-colors shrink-0"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - labels/inputs styled like CreateContractDialog */}
        <div className="px-6 pb-4 space-y-3 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll">
          <div className="space-y-1">
            <Label htmlFor="agreement-title" className="text-brand-accent-dark">
              {t('createAgreement.agreementTitle')}
            </Label>
            <Input
              id="agreement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('createAgreement.titlePlaceholder')}
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-type" className="text-brand-accent-dark">
              {t('createAgreement.agreementType')}
            </Label>
            <div className="relative">
              <select
                id="agreement-type"
                value={type}
                onChange={(e) => setType(e.target.value as AgreementType)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                <option value="">{t('createAgreement.selectType')}</option>
                {AGREEMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-parties" className="text-brand-accent-dark">
              {t('createAgreement.partiesInvolved')}
            </Label>
            <Input
              id="agreement-parties"
              value={partiesInput}
              onChange={(e) => setPartiesInput(e.target.value)}
              placeholder={t('createAgreement.partiesPlaceholder')}
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
            <p className="text-xs text-brand-muted-text-dark mt-1">
              {t('createAgreement.partiesHint')}
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-purpose" className="text-brand-accent-dark">
              {t('createAgreement.purposeObjectives')}
            </Label>
            <textarea
              id="agreement-purpose"
              value={purposeAndObjectives}
              onChange={(e) => setPurposeAndObjectives(e.target.value)}
              placeholder={t('createAgreement.purposePlaceholder')}
              rows={4}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'resize-y min-h-[80px]'
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-status" className="text-brand-accent-dark">
              {t('createAgreement.status')}
            </Label>
            <div className="relative">
              <select
                id="agreement-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AgreementStatus)}
                className={cn(
                  'appearance-none w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2 pr-9',
                  'text-sm text-foreground'
                )}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-content" className="text-brand-accent-dark">
              {t('createAgreement.content')}
            </Label>
            <textarea
              id="agreement-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('createAgreement.contentPlaceholder')}
              rows={6}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'resize-y min-h-[100px]'
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agreement-date" className="text-brand-accent-dark">
              {t('createAgreement.date')}
            </Label>
            <Input
              id="agreement-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>
        </div>

        {/* Actions - Cancel (outline) + Generate Draft (gradient with Sparkles) */}
        <div className="grid grid-cols-2 gap-3 p-6 pt-2 shrink-0">
          <Button variant="outline" onClick={handleClose} className="bg-transparent">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleGenerateDraft}>
            <Sparkles className="w-4 h-4 mr-2" />
            {t('createAgreement.generateDraft')}
          </Button>
        </div>
      </div>
    </div>
  )
}
