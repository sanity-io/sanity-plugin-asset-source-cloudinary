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

export function encodeFilename(asset: CloudinaryAsset) {
  const { resource_type, public_id, type } = asset
  return `${btoa(JSON.stringify({ resource_type, public_id, type }))}.${asset.format}`
}

export function decodeFilename(filename: string): CloudinaryAsset {
  let filenameDecoded
  try {
    filenameDecoded = JSON.parse(atob(filename.split('.')[0]))
  } catch (err) {
    // Do nothing
  }
  return filenameDecoded
}
