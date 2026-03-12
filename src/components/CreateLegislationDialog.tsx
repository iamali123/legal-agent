import { useState } from 'react'
import { Sparkles, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { LegislationStatus } from '@/types/legislation.types'
import { useTranslation } from 'react-i18next'

const JURISDICTION_OPTIONS = ['Federal', 'Emirate', 'Local'] as const
const JURISDICTION_KEYS = ['createLegislation.federal', 'createLegislation.emirate', 'createLegislation.local'] as const

const STATUS_OPTIONS: { value: LegislationStatus; labelKey: string }[] = [
  { value: 'draft', labelKey: 'legislations.statusDraft' },
  { value: 'active', labelKey: 'legislations.statusActive' },
  { value: 'published', labelKey: 'legislations.statusPublished' },
  { value: 'amended', labelKey: 'legislations.statusAmended' },
]

const AI_BENEFIT_KEYS = [
  'createLegislation.benefit1',
  'createLegislation.benefit2',
  'createLegislation.benefit3',
  'createLegislation.benefit4',
  'createLegislation.benefit5',
] as const

interface CreateLegislationDialogProps {
  open: boolean
  onClose: () => void
  onSave?: (data: { 
    title: string
    jurisdiction: string
    description: string
    status: LegislationStatus
    content?: string
    version: string
  }) => void
  onGenerateDraft?: (data: { 
    title: string
    jurisdiction: string
    description: string
    status: LegislationStatus
    content?: string
    version: string
  }) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export function CreateLegislationDialog({
  open,
  onClose,
  onSave: _onSave, // eslint-disable-line @typescript-eslint/no-unused-vars
  onGenerateDraft,
}: CreateLegislationDialogProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<LegislationStatus>('draft')
  const [content, setContent] = useState('')
  const [version, setVersion] = useState('1.0')

  const handleClose = () => {
    setTitle('')
    setJurisdiction('')
    setDescription('')
    setStatus('draft')
    setContent('')
    setVersion('1.0')
    onClose()
  }

  const handleCancel = () => {
    handleClose()
  }

  const handleGenerateDraft = () => {
    onGenerateDraft?.({
      title,
      jurisdiction,
      description,
      status,
      content: content.trim() || undefined,
      version,
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
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3244DD]/10 shrink-0">
              <Sparkles className="w-5 h-5 text-brand-accent-dark shrink-0" />
              </div>
              <div>
              <h2 className="text-xl font-semibold text-white">
                {t('createLegislation.title')}
              </h2>
              <p className="text-sm text-brand-muted-text-dark">
              {t('createLegislation.subtitle')}
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

        {/* Form */}
        <div className="px-6 pb-4 space-y-3 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll">
          <div className="space-y-1">
            <Label htmlFor="legislation-title" className='text-brand-accent-dark'>{t('createLegislation.legislationTitle')}</Label>
            <Input
              id="legislation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('createLegislation.titlePlaceholder')}
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="legislation-jurisdiction" className='text-brand-accent-dark'>{t('createLegislation.jurisdiction')}</Label>
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
                <option value="">{t('createLegislation.selectJurisdiction')}</option>
                {JURISDICTION_OPTIONS.map((opt, i) => (
                  <option key={opt} value={opt}>
                    {t(JURISDICTION_KEYS[i])}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="legislation-description" className='text-brand-accent-dark'>{t('createLegislation.briefDescription')}</Label>
            <textarea
              id="legislation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('createLegislation.descriptionPlaceholder')}
              rows={4}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="legislation-status" className='text-brand-accent-dark'>{t('createLegislation.status')}</Label>
            <div className="relative">
              <select
                id="legislation-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LegislationStatus)}
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
            <Label htmlFor="legislation-content" className='text-brand-accent-dark'>{t('createLegislation.content')}</Label>
            <textarea
              id="legislation-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('createLegislation.contentPlaceholder')}
              rows={6}
              className={cn(
                'flex w-full rounded-lg bg-[#0A162880] border border-brand-accent-dark/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground',
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="legislation-version" className='text-brand-accent-dark'>{t('createLegislation.version')}</Label>
            <Input
              id="legislation-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder={t('createLegislation.versionPlaceholder')}
              className="rounded-lg bg-[#0A162880] border border-brand-accent-dark/30"
            />
          </div>

          {/* AI Will Provide */}
          <div className="rounded-lg border border-brand-accent-dark/30 bg-brand-accent-dark/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-accent-dark shrink-0" />
              <h3 className="font-semibold text-white text-sm">
                {t('createLegislation.aiWillProvide')}
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-brand-muted-text-dark list-disc list-inside">
              {AI_BENEFIT_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 p-6 pt-2 shrink-0">
          <Button variant="outline" onClick={handleCancel} className='bg-transparent' >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleGenerateDraft}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('createLegislation.generateDraft')}
          </Button>
        </div>
      </div>
    </div>
  )
}
