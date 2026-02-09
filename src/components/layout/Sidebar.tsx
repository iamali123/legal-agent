import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  FileCheck, 
  FileSignature,
  CheckSquare2,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import logoImage from '@/assets/mbrhe-logo.png'

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/legislations', label: 'Legislations', icon: FileText },
  { path: '/laws-policy', label: 'Laws / Policy', icon: Scale },
  { path: '/contracts', label: 'Contracts', icon: FileCheck },
  { path: '/agreements', label: 'Agreements', icon: FileSignature },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare2 },
  { path: '/ai-legal', label: 'AI Legal', icon: Sparkles },
]

export function Sidebar() {
  return (
    <div className="w-64  border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-3 mb-5">
          <img 
            src={logoImage} 
            alt="MBRHE Logo" 
            className="w-full h-10 mt-0.5 object-contain"
          />
        </div>
        <h2 className="text-xl font-medium text-brand-accent-dark pb-3">
          Legal Portal
        </h2>
        <hr className="border-0 h-px bg-hr-glow -ml-5" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out active:scale-[0.99]',
                  isActive
                    ? 'bg-gradient-to-r from-[rgba(0,217,255,0.2)] to-[rgba(0,168,181,0.2)] text-white border border-[#00D9FF4D] border-l-4 border-l-brand-accent-dark shadow-[0_4px_6px_-4px_rgba(0,217,255,0.2),0_10px_15px_-3px_rgba(0,217,255,0.2)]'
                    : 'text-brand-muted-text-dark hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive ? 'text-brand-accent-dark' : 'text-brand-muted-text-dark'
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center">
            <span className="text-white font-semibold">U</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              User Name
            </div>
            <div className="text-xs text-brand-accent-dark">
              Legal Officer
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
