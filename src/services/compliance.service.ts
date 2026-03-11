/**
 * Compliance Audit Service
 * Calls the Node.js proxy which forwards to the Python ai_backend.
 */

import { apiClient } from '@/lib/api/client'
import type { ComplianceSession } from '@/types/compliance.types'

interface ApiWrap<T> {
  success: boolean
  data: T
  message?: string
}

// ── Session management ────────────────────────────────────────────────────────

export const createComplianceSession = async (opts?: {
  lawPolicyDocId?: string
  lawPolicyLabel?: string
  companyName?: string
  auditorName?: string
}): Promise<{ session_id: string; status: string }> => {
  const res = await apiClient.post<ApiWrap<{ session_id: string; status: string }>>(
    '/ai/compliance/sessions',
    {
      law_policy_doc_id: opts?.lawPolicyDocId ?? null,
      law_policy_label: opts?.lawPolicyLabel ?? null,
      company_name: opts?.companyName ?? null,
      auditor_name: opts?.auditorName ?? null,
    }
  )
  return res.data.data
}

export const getComplianceSession = async (
  sessionId: string
): Promise<ComplianceSession> => {
  const res = await apiClient.get<ApiWrap<ApiWrap<ComplianceSession>>>(
    `/ai/compliance/sessions/${sessionId}`
  )
  return res.data.data.data
}

export const listComplianceSessions = async (): Promise<ComplianceSession[]> => {
  const res = await apiClient.get<ApiWrap<ApiWrap<ComplianceSession[]>>>(
    '/ai/compliance/sessions'
  )
  return res.data.data.data
}

// ── Conversational turn ───────────────────────────────────────────────────────

export interface ComplianceMessageResponse {
  reply: string
  info_complete: boolean
  session: {
    company_name: string | null
    auditor_name: string | null
    law_policy_doc_id: string | null
    law_policy_label: string | null
    company_doc_ids: string[]
  }
}

export const sendComplianceMessage = async (
  sessionId: string,
  content: string
): Promise<ComplianceMessageResponse> => {
  const res = await apiClient.post<ApiWrap<ApiWrap<ComplianceMessageResponse>>>(
    `/ai/compliance/sessions/${sessionId}/message`,
    { content }
  )
  return res.data.data.data
}

// ── Attach documents ──────────────────────────────────────────────────────────

export const attachComplianceDocs = async (
  sessionId: string,
  docIds: string[]
): Promise<{ company_doc_ids: string[]; count: number }> => {
  const res = await apiClient.post<
    ApiWrap<ApiWrap<{ company_doc_ids: string[]; count: number }>>
  >(`/ai/compliance/sessions/${sessionId}/docs`, { doc_ids: docIds })
  return res.data.data.data
}

// ── Set law/policy ────────────────────────────────────────────────────────────

export const setComplianceLaw = async (
  sessionId: string,
  lawPolicyDocId: string,
  lawPolicyLabel?: string
): Promise<{ law_policy_doc_id: string; law_policy_label: string }> => {
  const res = await apiClient.post<
    ApiWrap<ApiWrap<{ law_policy_doc_id: string; law_policy_label: string }>>
  >(`/ai/compliance/sessions/${sessionId}/law`, {
    law_policy_doc_id: lawPolicyDocId,
    law_policy_label: lawPolicyLabel,
  })
  return res.data.data.data
}

// ── Run audit ─────────────────────────────────────────────────────────────────

export const runComplianceAudit = async (
  sessionId: string,
  opts?: { lawPolicyDocId?: string; docIds?: string[] }
): Promise<{ session_id: string; status: string; message: string }> => {
  const res = await apiClient.post<
    ApiWrap<{ session_id: string; status: string; message: string }>
  >(`/ai/compliance/sessions/${sessionId}/run`, {
    law_policy_doc_id: opts?.lawPolicyDocId,
    doc_ids: opts?.docIds,
  })
  return res.data.data
}
