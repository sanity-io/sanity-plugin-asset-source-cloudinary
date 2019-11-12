import { CloudinaryAsset, CloudinaryAssetSourceIdData } from './types'

export function loadCloudinary(callback: () => void) {
  const existingScript = document.getElementById('cloudinary')
  if (!existingScript) {
    const script = document.createElement('script')
    script.src = 'https://media-library.cloudinary.com/global/all.js'
    script.id = 'cloudinary'
    document.body.appendChild(script)
    script.onload = () => {
      if (callback) {
        return callback()
      }
      return true
    }
  }
  if (existingScript && callback) {
    return callback()
  }
  return true
}

export function encodeSourceId(asset: CloudinaryAsset): string {
  const { resource_type, public_id, type } = asset
  return btoa(JSON.stringify({ public_id, resource_type, type })) // Sort keys alphabetically!
}

export function encodeFilename(asset: CloudinaryAsset) {
  return `${asset.public_id.split('/').slice(-1)[0]}.${asset.format}`
}

export function decodeSourceId(
  sourceId: string
): CloudinaryAssetSourceIdData | undefined {
  let sourceIdDecoded: any
  try {
    sourceIdDecoded = JSON.parse(atob(sourceId))
  } catch (err) {
    // Do nothing
  }
  return sourceIdDecoded
}
