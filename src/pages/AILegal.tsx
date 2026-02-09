import { AILegalAssistantChat } from '@/components/AILegalAssistantChat'

export function AILegal() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <AILegalAssistantChat embedded context="DASHBOARD" />
    </div>
  )
}
