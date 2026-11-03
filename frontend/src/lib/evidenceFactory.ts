import type { ImageEvidence, TextEvidence, UrlEvidence } from '../types/evidence'

let seq = 0
const nextId = () => `ev-${Date.now()}-${++seq}`

export const createImageEvidence = (file: File): ImageEvidence => {
  return {
    id: nextId(),
    type: 'image',
    file,
    fileName: file.name,
    sizeBytes: file.size,
    previewUrl: URL.createObjectURL(file),
  }
}

export const createUrlEvidence = (value: string): UrlEvidence => {
  return { id: nextId(), type: 'url', value: value.trim() }
}

export const createTextEvidence = (value: string): TextEvidence => {
  return { id: nextId(), type: 'text', value: value.trim() }
}
