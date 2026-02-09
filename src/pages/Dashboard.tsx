import { Sparkles, FileText, AlertCircle, FileCheck, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/DashboardHeader'
import { CornerAccents } from '@/components/CornerAccents'

export function Dashboard() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Welcome to Legal Portal"
        subtitle="AI-powered legal management at your fingertips"
      />

      {/* Summary Cards */}
      <div className="px-8 pt-6 pb-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="">
              <div className='flex items-center justify-center bg-brand-accent-dark/20 border border-brand-accent-dark/30 mb-4 w-12 h-12 rounded-xl'>
                <FileText className="w-6 h-6 text-brand-accent-dark" />
                  </div>
                <div>
                  <p className="text-sm text-brand-accent-dark mb-2">
                    Total Legislations
                  </p>
                  <p className="text-5xl font-bold text-white mb-1">
                    247
                  </p>
                  <hr className="border-0 h-px bg-hr-glow my-2" />
                  <p className="text-xs text-brand-muted-text-dark">
                    +12 this month
                  </p>
                </div>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>
          </div>

          <div>
          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-orange-900/30 border border-brand-accent-dark/30 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-brand-accent-dark mb-2">
                    Pending Approvals
                  </p>
                  <p className="text-5xl font-bold text-white mb-1">
                    18
                  </p>
                  <hr className="border-0 h-px bg-hr-glow my-2" />
                  <p className="text-xs text-brand-muted-text-dark">
                    5 urgent
                  </p>
                </div>
              <CornerAccents />
            </CardContent>
          </Card>
          </div>

          <div>
          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="">
              <div className='flex items-center justify-center bg-green-900/30 border border-brand-accent-dark/30 mb-4 w-12 h-12 rounded-xl'>
                <FileCheck className="w-6 h-6 text-green-400" />
                  </div>
                <div>
                  <p className="text-sm text-brand-accent-dark mb-2">
                    Active Contracts
                  </p>
                        <p className="text-5xl font-bold text-white mb-1">
                    142
                  </p>
                  <hr className="border-0 h-px bg-hr-glow my-2" />
                  <p className="text-xs text-brand-muted-text-dark">
                    8 expiring soon
                  </p>
                  </div>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>
          </div>

          <div>
          <Card className="bg-[#0A1628CC] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className='flex items-center justify-center bg-purple-900/30 border border-brand-accent-dark/30 mb-4 w-12 h-12 rounded-xl'>
                <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                <div>
                  <p className="text-sm text-brand-accent-dark mb-2">
                    Recent Updates
                  </p>
                  <p className="text-5xl font-bold text-white mb-1">
                    34
                  </p>
                  <p className="text-xs text-brand-muted-text-dark">
                    <hr className="border-0 h-px bg-hr-glow my-2" />
                    Last 7 days
                  </p>
                </div>
              <CornerAccents />
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* AI Highlights & Insights */}
      <div className="px-8 pb-6 pt-4">
        <div className="max-w-7xl mx-auto bg-[#0A1628CC] rounded-xl p-5 border border-brand-accent-dark/30 relative overflow-hidden">
          <CornerAccents />
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-accent-dark" />
            <h2 className="text-xl font-semibold text-brand-accent-dark">
              AI Highlights & Insights
            </h2>
          </div>

          <div className="space-y-4">
            <div>
            <Card className="bg-[#0A162880] border-0 border-l-4 border-l-[#FF6900]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">
                      Conflicting Clauses Detected
                    </h3>
                    <p className="text-sm text-brand-muted-text-dark">
                      Contract #2024-045 has conflicting terms with existing policy framework
                    </p>
                  </div>
                  <span className="text-xs text-brand-accent-dark whitespace-nowrap ml-4">
                    2 hours ago
                  </span>
                </div>
              </CardContent>
            </Card>
            </div>

            <div>
            <Card className="bg-[#0A162880] border-0 border-l-4 border-l-[#00D9FF]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">
                      Suggested Updates
                    </h3>
                    <p className="text-sm text-brand-muted-text-dark">
                      3 legislations require updates based on new federal law amendments
                    </p>
                  </div>
                  <span className="text-xs text-brand-accent-dark whitespace-nowrap ml-4">
                    5 hours ago
                  </span>
                </div>
              </CardContent>
            </Card>
            </div>

            <div>
            <Card className="bg-[#0A162880] border-0 border-l-4 border-l-[#00C950]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">
                      Compliance Check Complete
                    </h3>
                    <p className="text-sm text-brand-muted-text-dark">
                      All active contracts are compliant with current regulations
                    </p>
                  </div>
                  <span className="text-xs text-brand-accent-dark whitespace-nowrap ml-4">
                    1 day ago
                  </span>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-[#0D1B2A] rounded-xl border border-brand-accent-dark/30 relative overflow-hidden">
            <CardContent className="p-6">
              {/* Header */}
              <div className="mb-5">
                <h2 className="text-xl font-bold text-brand-accent-dark flex items-center gap-2">
                  <span className="text-brand-accent-dark">•</span>
                  Recent Activity
                </h2>
              </div>

              {/* Activity List */}
              <div className="space-y-0">
                {/* Activity Item 1 */}
                <div className="py-3 border-b border-brand-accent-dark/30 rounded-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1 group-hover:text-brand-accent-dark">
                        Legislation Draft Created
                      </p>
                      <p className="text-xs text-brand-muted-text-dark">
                        Data Protection Act 2024
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand-accent-dark mb-1">
                        Sarah Ahmed
                      </p>
                      <p className="text-xs text-brand-muted-text-dark ">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="py-3 border-b border-brand-accent-dark/30 rounded-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1 group-hover:text-brand-accent-dark">
                        Agreement Updated
                      </p>
                      <p className="text-xs text-brand-muted-text-dark">
                        Partnership MOU - Section 3
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand-accent-dark mb-1">
                        Fatima Hassan
                      </p>
                      <p className="text-xs text-brand-muted-text-dark ">
                        5 hours ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="py-3 border-b border-brand-accent-dark/30 rounded-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1 group-hover:text-brand-accent-dark">
                        Policy Review Completed
                      </p>
                      <p className="text-xs text-brand-muted-text-dark">
                        Environmental Compliance Framework
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand-accent-dark mb-1">
                        Ahmed Khalid
                      </p>
                      <p className="text-xs text-brand-muted-text-dark">
                        1 day ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <CornerAccents />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
