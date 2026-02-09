import { useState } from 'react'
import headerVideoBg from '@/assets/header-video-bg.mp4'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Filter, Search, X } from 'lucide-react'
import { CornerAccents } from '../CornerAccents'

interface PageHeaderProps {
  /** Page name shown as the main heading */
  title: string
  /** Optional subtitle below the title */
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
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
          <p className="text-lg text-brand-accent-dark">
            {subtitle}
          </p>
        )}
        {/* Filter Tags */}
        <div className="flex gap-2 justify-center flex-wrap my-4">
            {['Legislations', 'Laws / Policy', 'Contracts', 'Agreements', 'Approvals'].map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 rounded-xl bg-white/10 border border-brand-accent-dark/30 hover:border-brand-accent-dark/50 text-white/70 text-sm hover:bg-brand-accent-dark/30 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
      {/* Search and Filters */}
      <div className="px-8 py-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent-dark" />
              <Input
                type="text"
                placeholder="Search laws, policies, or regulations..."
                className="pl-10 h-14 text-base rounded-xl bg-[#0A1628CC] border border-brand-accent-dark/30"
              />
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-10 px-6 flex items-center gap-2 bg-brand-accent-dark/20 border border-brand-accent-dark/30 hover:border-brand-accent-dark/50 text-brand-accent-dark rounded-xl text-sm hover:bg-brand-accent-dark/30 transition-colors absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 bg-[#0A1628CC] border border-brand-accent-dark/30 rounded-2xl p-6 relative overflow-hidden">
              <CornerAccents />
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-brand-accent-dark">
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-1 rounded-lg text-brand-muted-text-dark hover:text-brand-accent-dark hover:bg-white/5 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-left text-brand-accent-dark">
                    Status
                  </label>
                  <Input
                    type="text"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0D1B2A] border border-brand-accent-dark/30 rounded-lg h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-left text-brand-accent-dark">
                    Priority
                  </label>
                  <Input
                    type="text"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-[#0D1B2A] border border-brand-accent-dark/30 rounded-lg h-10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('')
                    setPriorityFilter('')
                  }}
                  className="border-brand-accent-dark/30 bg-transparent"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    // Apply filters logic here
                    console.log('Apply filters:', { statusFilter, priorityFilter })
                    setShowAdvancedFilters(false)
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

    </div>
  )
}
