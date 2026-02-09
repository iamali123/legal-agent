import { useState } from 'react'
import { useOutlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Button } from '../ui/button'
import { AILegalAssistantChat } from '../AILegalAssistantChat'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const pathToContext: Record<string, string> = {
  '/': 'Dashboard',
  '/legislations': 'Legislations',
  '/laws-policy': 'Laws / Policy',
  '/contracts': 'Contracts',
  '/agreements': 'Agreements',
  '/approvals': 'Approvals',
}

export function MainLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const outlet = useOutlet()
  const location = useLocation()
  const context = pathToContext[location.pathname] ?? 'Dashboard'
  const isAILegalPage = location.pathname === '/ai-legal'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={cn('flex-1 overflow-y-auto', !isAILegalPage && 'pb-12')}>
            {outlet}
      </main>
      {/* Floating AI Assistant Button - hidden when chat is open */}
      {!isChatOpen && (
        <div className="fixed bottom-4 right-12 z-30">
          <Button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="rounded-full h-12 px-4 shadow-lg flex items-center gap-2"
          >
            <Bot className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
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
