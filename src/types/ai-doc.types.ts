/**
 * AI Document Types
 */

export type AiDocStatus = 'pending' | 'processing' | 'processed' | 'error'

export interface AiDoc {
  id: string
  filename: string
  status: AiDocStatus
  entity_type?: string | null
  entity_id?: string | null
  section_count?: number
  clause_count?: number
  char_count?: number
  error_msg?: string | null
  created_at?: string
  updated_at?: string
}

export interface AiDocSectionMetadata {
  chunk_id: number
  boundary_label: string
  char_start: number
  char_end: number
  subsections?: unknown
  metadata?: {
    section_label?: string | null
    summary?: string | null
    clause_count?: number
    clauses?: unknown[]
  }
}

export interface AiDocChunks {
  id: string
  filename: string
  status: AiDocStatus
  boundaries: unknown
  sections_metadata: AiDocSectionMetadata[]
}

