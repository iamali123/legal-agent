/**
 * File Types
 */

export type EntityType = 'legislation' | 'contract' | 'agreement' | 'approval'

export interface File {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  uploadedAt: string
  uploadedBy?: {
    id: string
    name: string
  } | null
}

export interface UploadFileRequest {
  file: File | Blob
  entityType?: EntityType
  entityId?: string
}
