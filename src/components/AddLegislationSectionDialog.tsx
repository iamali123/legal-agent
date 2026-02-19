import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateLegislationSectionRequest } from '@/types/legislation.types'

export interface AddLegislationSectionDialogProps {
  open: boolean
  legislationId: string
  legislationTitle?: string
  onClose: () => void
  onSubmit: (data: CreateLegislationSectionRequest) => void
  isPending?: boolean
  error?: string | null
}

function validate(
  data: { title: string; content: string; order: string }
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (!data.title.trim()) errors.title = 'Title is required'
  if (!data.content.trim()) errors.content = 'Content is required'
  const orderNum = Number(data.order)
  if (data.order === '' || Number.isNaN(orderNum) || orderNum < 1 || !Number.isInteger(orderNum)) {
    errors.order = 'Order must be a positive integer (e.g. 1, 2, 3)'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function AddLegislationSectionDialog({
  open,
  legislationId,
  legislationTitle,
  onClose,
  onSubmit,
  isPending = false,
  error: externalError = null,
}: AddLegislationSectionDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [order, setOrder] = useState('1')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    setTitle('')
    setContent('')
    setOrder('1')
    setErrors({})
    setSuccess(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validate({ title, content, order })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      order: Number(order),
    })
    setSuccess(true)
    setTitle('')
    setContent('')
    setOrder((prev) => String(Number(prev) + 1))
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden border border-brand-accent-dark/30 bg-[#0A1628] shadow-[0_0_24px_rgba(0,217,255,0.08)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 shrink-0">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-accent-dark/20 border border-brand-accent-dark/30 shrink-0">
                <FileText className="w-5 h-5 text-brand-accent-dark" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-white">Add Section</h2>
                {legislationTitle && (
                  <p className="text-sm text-brand-muted-text-dark truncate mt-0.5">
                    {legislationTitle}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-brand-muted-text-dark hover:bg-white/10 hover:text-white transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
              Section added successfully. You can add another or close.
            </div>
          )}

          {((externalError && externalError.trim()) ||
            Object.values(errors).some((v) => v && String(v).trim())) && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {externalError?.trim() ||
                Object.values(errors)
                  .filter((v) => v && String(v).trim())
                  .join(' ')}
            </div>
          )}
        </div>

        <form id="add-section-form" onSubmit={handleSubmit} className="px-6 pb-4 flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll space-y-4">
            <div>
              <Label htmlFor="section-title" className="text-white">
                Title
              </Label>
              <Input
                id="section-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setErrors((prev) => ({ ...prev, title: '' }))
                }}
                placeholder="e.g. Chapter 1 - Definitions"
                className="mt-1.5 bg-white/5 border-brand-accent-dark/30 text-white placeholder:text-brand-muted-text-dark"
                disabled={isPending}
                autoFocus
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="section-content" className="text-white">
                Content
              </Label>
              <textarea
                id="section-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setErrors((prev) => ({ ...prev, content: '' }))
                }}
                placeholder="Section text..."
                rows={5}
                className="mt-1.5 w-full rounded-md border border-brand-accent-dark/30 bg-white/5 text-white placeholder:text-brand-muted-text-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-dark resize-y min-h-[100px]"
                disabled={isPending}
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-400">{errors.content}</p>
              )}
            </div>

            <div>
              <Label htmlFor="section-order" className="text-white">
                Order
              </Label>
              <Input
                id="section-order"
                type="number"
                min={1}
                step={1}
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value)
                  setErrors((prev) => ({ ...prev, order: '' }))
                }}
                className="mt-1.5 bg-white/5 border-brand-accent-dark/30 text-white w-24"
                disabled={isPending}
              />
              {errors.order && (
                <p className="mt-1 text-xs text-red-400">{errors.order}</p>
              )}
            </div>
          </form>

        <div className="p-6 pt-2 shrink-0 border-t border-brand-accent-dark/20">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 border-brand-accent-dark/30 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              type="submit"
              form="add-section-form"
              disabled={isPending}
              className="flex-1 bg-brand-accent-dark text-[#0A1628] hover:bg-brand-accent-dark/90"
            >
              {isPending ? 'Adding...' : 'Add Section'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
