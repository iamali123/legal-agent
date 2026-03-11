import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createComplianceSession,
  getComplianceSession,
  listComplianceSessions,
  sendComplianceMessage,
  attachComplianceDocs,
  setComplianceLaw,
  runComplianceAudit,
} from '@/services/compliance.service'

export const useComplianceSessions = () =>
  useQuery({
    queryKey: ['compliance', 'sessions'],
    queryFn: listComplianceSessions,
  })

export const useComplianceSession = (sessionId: string | null) =>
  useQuery({
    queryKey: ['compliance', 'session', sessionId],
    queryFn: () => getComplianceSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' ? 3000 : false
    },
  })

export const useCreateComplianceSession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createComplianceSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compliance', 'sessions'] }),
  })
}

export const useSendComplianceMessage = () =>
  useMutation({ mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
    sendComplianceMessage(sessionId, content)
  })

export const useAttachComplianceDocs = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, docIds }: { sessionId: string; docIds: string[] }) =>
      attachComplianceDocs(sessionId, docIds),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['compliance', 'session', vars.sessionId] }),
  })
}

export const useSetComplianceLaw = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      sessionId,
      lawPolicyDocId,
      lawPolicyLabel,
    }: {
      sessionId: string
      lawPolicyDocId: string
      lawPolicyLabel?: string
    }) => setComplianceLaw(sessionId, lawPolicyDocId, lawPolicyLabel),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['compliance', 'session', vars.sessionId] }),
  })
}

export const useRunComplianceAudit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      sessionId,
      lawPolicyDocId,
      docIds,
    }: {
      sessionId: string
      lawPolicyDocId?: string
      docIds?: string[]
    }) => runComplianceAudit(sessionId, { lawPolicyDocId, docIds }),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['compliance', 'session', vars.sessionId] }),
  })
}
