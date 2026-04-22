import { supabase } from '../supabaseClient'

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name (e.g., 'vehicle-images')
 * @param {string} path - Optional path within bucket (e.g., 'vehicles/123')
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
export const uploadImage = async (file, bucket = 'vehicle-images', path = '') => {
  if (!file) throw new Error('No file provided')

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Max 5MB allowed')
  }

  try {
    // Create unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomStr}.${extension}`
    const fullPath = path ? `${path}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicData.publicUrl,
      path: data.path,
    }
  } catch (err) {
    console.error('Image upload error:', err)
    throw new Error(`Upload failed: ${err.message}`)
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - The full path of the file in storage
 * @param {string} bucket - The storage bucket name
 */
export const deleteImage = async (filePath, bucket = 'vehicle-images') => {
  if (!filePath) return

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error
  } catch (err) {
    console.error('Image deletion error:', err)
    throw new Error(`Deletion failed: ${err.message}`)
  }
}

/**
 * Upload multiple images
 * @param {File[]} files - Array of files to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} path - Optional path within bucket
 * @returns {Promise<Array>} - Array of uploaded image objects
 */
export const uploadMultipleImages = async (files, bucket = 'vehicle-images', path = '') => {
  if (!files || files.length === 0) return []

  const uploads = files.map(file => uploadImage(file, bucket, path))
  return Promise.all(uploads)
}

/**
 * Convert file input to File object (for preview)
 * @param {Event} e - onChange event from file input
 * @returns {File|null}
 */
export const getFileFromInput = (e) => {
  return e.target.files?.[0] || null
}

/**
 * Create a preview URL for a file (before upload)
 * @param {File} file - The file to preview
 * @returns {string} - Data URL for preview
 */
export const createPreviewUrl = (file) => {
  return URL.createObjectURL(file)
}

/**
 * Revoke preview URL to free memory
 * @param {string} url - The preview URL
 */
export const revokePreviewUrl = (url) => {
  URL.revokeObjectURL(url)
}
