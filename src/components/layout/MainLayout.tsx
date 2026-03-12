import { useState } from 'react'
import { useOutlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Button } from '../ui/button'
import { AILegalAssistantChat } from '../AILegalAssistantChat'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const pathToContextKey: Record<string, string> = {
  '/': 'nav.dashboard',
  '/legislations': 'nav.legislations',
  '/laws-policy': 'nav.lawsPolicy',
  '/contracts': 'nav.contracts',
  '/agreements': 'nav.agreements',
  '/approvals': 'nav.approvals',
}

export function MainLayout() {
  const { t } = useTranslation()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const outlet = useOutlet()
  const location = useLocation()
  const contextKey = pathToContextKey[location.pathname] ?? 'nav.dashboard'
  const context = t(contextKey)
  const isAILegalPage = location.pathname === '/ai-legal'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={cn('flex-1 overflow-y-auto', !isAILegalPage && 'pb-12')}>
            <div className="absolute top-4 ltr:right-12 z-20 rtl:left-12">
              <LanguageSwitcher />
            </div>
            {outlet}
      </main>
      {/* Floating AI Assistant Button - hidden when chat is open */}
      {!isChatOpen && (
        <div className="fixed bottom-4 ltr:right-12 rtl:left-12 z-30">
          <Button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="rounded-full h-12 px-4 shadow-lg flex items-center gap-2"
          >
            <Bot className="w-5 h-5" />
            <span className="font-medium">{t('app.aiAssistant')}</span>
          </Button>
        </div>
      )}
      <AILegalAssistantChat
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setIsChatExpanded(false)
        }}
        isExpanded={isChatExpanded}
        onExpandToggle={() => setIsChatExpanded((v) => !v)}
        context={context}
      />
    </div>
  )
}
