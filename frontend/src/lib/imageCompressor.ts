// 單檔上限 10 MB（API Gateway 硬性限制），超過 2 MB 時啟動漸進式 JPEG 壓縮
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const COMPRESS_TRIGGER_BYTES = 2 * 1024 * 1024
const MAX_DIMENSION = 1920

export type CompressedImage = {
  blob: Blob
  contentType: 'image/png' | 'image/jpeg' | 'image/webp'
  ext: 'png' | 'jpg' | 'webp'
}

const normalizeMime = (mime: string): { contentType: CompressedImage['contentType']; ext: CompressedImage['ext'] } => {
  if (mime === 'image/png') return { contentType: 'image/png', ext: 'png' }
  if (mime === 'image/webp') return { contentType: 'image/webp', ext: 'webp' }
  return { contentType: 'image/jpeg', ext: 'jpg' }
}

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('無法讀取截圖檔案'))
    }
    img.src = url
  })
}

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('截圖壓縮失敗'))
      },
      type,
      quality,
    )
  })
}

export const compressImageForUpload = async (file: File): Promise<CompressedImage> => {
  if (file.size <= COMPRESS_TRIGGER_BYTES) {
    const { contentType, ext } = normalizeMime(file.type)
    return { blob: file, contentType, ext }
  }

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('瀏覽器不支援 Canvas 截圖壓縮')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const qualities = [0.85, 0.7, 0.55, 0.4]
  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    if (blob.size <= MAX_UPLOAD_BYTES) {
      return { blob, contentType: 'image/jpeg', ext: 'jpg' }
    }
  }

  throw new Error('截圖壓縮後仍超過 10 MB 上限')
}

