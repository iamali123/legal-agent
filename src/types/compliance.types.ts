/**
 * Compliance Audit Types
 */

export type ComplianceSessionStatus =
  | 'gathering'
  | 'running'
  | 'completed'
  | 'error'

export interface ComplianceFinding {
  clause_id: string
  clause_summary: string
  classification: 'Major NC' | 'Minor NC' | 'OFI' | 'Strength' | 'Pass'
  justification: string
  evidence_found: string
  evidence_gap: string
  systemic_note: string | null
  source_docs: string[]
}

export interface ComplianceResults {
  law_label: string
  doc_registry: Array<{
    doc_id: string
    filename: string
    doc_type: string
    title: string
    summary: string
    covers_clauses: string[]
  }>
  findings: ComplianceFinding[]
  summary_counts: {
    'Major NC'?: number
    'Minor NC'?: number
    OFI?: number
    Strength?: number
    Pass?: number
  }
  audit_narrative: string
  audit_flags: string[]
}

export interface ComplianceSession {
  session_id: string
  status: ComplianceSessionStatus
  info_complete: boolean
  company_name: string | null
  auditor_name: string | null
  law_policy_doc_id: string | null
  law_policy_label: string | null
  company_doc_ids: string[]
  error: string | null
  results: ComplianceResults | null
  created_at: string
}

export interface ComplianceChatMessage {
  role: 'user' | 'assistant'
  content: string
}
