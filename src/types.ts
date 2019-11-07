export type Asset = {
  kind: 'url' | 'base64' | 'file' | 'assetDocumentId'
  value: string | File
  metadata?: { filename?: string }
}

export type AssetDocument = {
  _id: string
  originalFilename?: string
}

export type CloudinaryAsset = {
  secure_url: string
  format: string
  resource_type: string
  type: string
  public_id: string
}

export interface CloudinaryMediaLibrary {
  show: (config?: { asset: any, folder: any }) => void
  hide: () => void
}
