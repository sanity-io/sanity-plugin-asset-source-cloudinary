import { CloudinaryAsset } from './types'

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

export function encodeSourceId(asset: CloudinaryAsset) {
  const { resource_type, public_id, type } = asset
  return JSON.stringify({ resource_type, public_id, type })
}

export function encodeFilename(asset: CloudinaryAsset) {
  return `${asset.public_id.split('/').slice(-1)[0]}.${asset.format}`
}

export function decodeSourceId(sourceId: string): CloudinaryAsset {
  let labelDecoded
  try {
    labelDecoded = JSON.parse(sourceId)
  } catch (err) {
    // Do nothing
  }
  return labelDecoded
}
