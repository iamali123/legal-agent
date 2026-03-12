import headerVideoBg from '@/assets/header-video-bg.mp4'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { useTranslation } from 'react-i18next'

interface DashboardHeaderProps {
  /** Page name shown as the main heading */
  title: string
  /** Optional subtitle below the title */
  subtitle?: string
}

const FILTER_TAG_KEYS = [
  'pageHeader.filterTagLegislations',
  'pageHeader.filterTagLawsPolicy',
  'pageHeader.filterTagContracts',
  'pageHeader.filterTagAgreements',
  'pageHeader.filterTagApprovals',
] as const

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="relative min-h-[338px] px-8 py-16 text-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.2 }}
        aria-hidden
      >
        <source src={headerVideoBg} type="video/mp4" />
      </video>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, #0A1628 0%, #00A8B5 25%, #00D9FF 50%, #008B9C 75%, #0A1628 100%)',
          opacity: 0.4,
        }}
      />
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-white/80">
            {subtitle}
          </p>
        )}
              {/* Search and Filters */}
      <div className="px-8 pt-5 pb-2 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent-dark" />
              <Input
                type="text"
                placeholder={t('pageHeader.searchPlaceholder')}
                className="ltr:pl-10 rtl:pr-10 h-14 text-base rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30"
              />
              <button className="h-10 px-6 bg-brand-accent-dark/20 border border-brand-accent-dark/30 hover:border-brand-accent-dark/50 text-brand-accent-dark rounded-xl text-sm hover:bg-brand-accent-dark/30 transition-colors absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2">
                {t('common.search')}
              </button>
            </div>
          </div>
        </div>
      </div>
        {/* Filter Tags */}
        <div className="flex gap-2 justify-center flex-wrap">
            {FILTER_TAG_KEYS.map((key) => (
              <button
                key={key}
                className="px-4 py-2 rounded-xl bg-white/10 border border-brand-accent-dark/30 hover:border-brand-accent-dark/50 text-white/70 text-sm hover:bg-brand-accent-dark/30 transition-colors"
              >
                {t(key)}
              </button>
            ))}
          </div>
      </div>

    </div>
  )
}
