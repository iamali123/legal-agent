import { useTranslation } from 'react-i18next'
import { setLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language === 'ar' ? 'ar' : 'en'

  return (
    <div className="flex items-center gap-1 rounded-lg border border-brand-accent-dark/30 bg-white/5 p-0.5">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
          current === 'en'
            ? 'bg-brand-accent-dark/20 text-brand-accent-dark'
            : 'text-brand-muted-text-dark hover:text-white hover:bg-white/5'
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={cn(
          'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
          current === 'ar'
            ? 'bg-brand-accent-dark/20 text-brand-accent-dark'
            : 'text-brand-muted-text-dark hover:text-white hover:bg-white/5'
        )}
      >
        AR
      </button>
    </div>
  )
}
