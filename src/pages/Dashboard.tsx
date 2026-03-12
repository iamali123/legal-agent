import { Sparkles, FileText, AlertCircle, FileCheck, Calendar } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/DashboardHeader'
import { CornerAccents } from '@/components/CornerAccents'
import {
  useDashboardStats,
  useAIHighlights,
  useRecentActivity,
} from '@/hooks/api'
import { useTranslation } from 'react-i18next'

const highlightBorderMap = {
  warning: 'border-l-[#FF6900]',
  info: 'border-l-[#00D9FF]',
  success: 'border-l-[#00C950]',
  error: 'border-l-red-500',
} as const

export function Dashboard() {
  const { t } = useTranslation()
  const { data: statsData, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: highlightsData } = useAIHighlights({ limit: 10 })
  const { data: activityData } = useRecentActivity({ limit: 10 })

  const stats = statsData?.data
  const highlights = highlightsData?.data?.highlights ?? []
  const activities = activityData?.data?.activities ?? []

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-400">{t('dashboard.failedToLoad')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title={t('dashboard.welcomeTitle')}
        subtitle={t('dashboard.subtitle')}
      />

      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-center bg-brand-accent-dark/20 border border-brand-accent-dark/30 mb-4 w-12 h-12 rounded-xl">
                <FileText className="w-6 h-6 text-brand-accent-dark" />
              </div>
              <div>
                <p className="text-sm text-brand-accent-dark mb-2">{t('dashboard.totalLegislations')}</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {statsLoading ? '—' : stats?.legislations?.total ?? 0}
                </p>
                <hr className="border-0 h-px bg-hr-glow my-2" />
                <p className="text-xs text-brand-muted-text-dark">
                  {Number(stats?.legislations?.byStatus?.find((s) => s.status === 'active')?.count ?? 0)} {t('dashboard.active')}
                </p>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>

          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-900/30 border border-brand-accent-dark/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-brand-accent-dark mb-2">{t('dashboard.pendingApprovals')}</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {statsLoading ? '—' : stats?.approvals?.pending ?? 0}
                </p>
                <hr className="border-0 h-px bg-hr-glow my-2" />
                <p className="text-xs text-brand-muted-text-dark">
                  {t('dashboard.requiresReview')}
                </p>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>

          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-center bg-green-900/30 border border-brand-accent-dark/30 mb-4 w-12 h-12 rounded-xl">
                <FileCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-brand-accent-dark mb-2">{t('dashboard.totalContracts')}</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {statsLoading ? '—' : stats?.contracts?.total ?? 0}
                </p>
                <hr className="border-0 h-px bg-hr-glow my-2" />
                <p className="text-xs text-brand-muted-text-dark">
                  {t('dashboard.totalValue')}: {statsLoading ? '—' : new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0 }).format(stats?.contracts?.totalValue ?? 0)}
                </p>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>

          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-center bg-purple-900/30 border border-brand-accent-dark/30 mb-4 w-12 h-12 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-brand-accent-dark mb-2">{t('dashboard.aiProcessedJobs')}</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {statsLoading ? '—' : stats?.ai?.processedJobs ?? 0}
                </p>
                <hr className="border-0 h-px bg-hr-glow my-2" />
                <p className="text-xs text-brand-muted-text-dark">
                  {t('dashboard.totalAiOperations')}
                </p>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Highlights & Insights */}
      <div className="px-8 pb-6 pt-4">
        <div className="max-w-7xl mx-auto bg-[#0A1628CC] rounded-xl p-5 border border-brand-accent-dark/30 relative overflow-hidden">
          <CornerAccents />
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-accent-dark" />
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              {t('dashboard.aiHighlightsInsights')}
            </h2>
          </div>

          <div className="space-y-4">
            {highlights.length === 0 ? (
              <p className="text-sm text-brand-muted-text-dark">{t('dashboard.noHighlights')}</p>
            ) : (
              highlights.map((h) => (
                <Card
                  key={h.id}
                  className={`bg-[#0A162880] border-0 border-l-4 ${highlightBorderMap[h.type] ?? 'border-l-[#00D9FF]'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{h.title}</h3>
                        <p className="text-sm text-brand-muted-text-dark">{h.description}</p>
                      </div>
                      <span className="text-xs text-brand-accent-dark whitespace-nowrap ml-4">
                        {formatRelativeTime(h.timestamp)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-[#0D1B2A] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-brand-accent-dark flex items-center gap-2">
                  <span className="text-brand-accent-dark">•</span>
                  {t('dashboard.recentActivity')}
                </h2>
              </div>

              <div className="space-y-0">
                {activities.length === 0 ? (
                  <p className="text-sm text-brand-muted-text-dark py-4">
                    {t('dashboard.noRecentActivity')}
                  </p>
                ) : (
                  activities.map((a) => (
                    <div
                      key={a.id}
                      className="py-3 border-b border-brand-accent-dark/30 rounded-lg group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1 group-hover:text-brand-accent-dark">
                            {a.action}
                          </p>
                          <p className="text-xs text-brand-muted-text-dark">{a.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-brand-accent-dark mb-1">
                            {a.user.name}
                          </p>
                          <p className="text-xs text-brand-muted-text-dark">{formatRelativeTime(a.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <CornerAccents />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
