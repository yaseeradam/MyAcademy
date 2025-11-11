// File storage utility - supports both base64 (fallback) and cloud storage

export async function uploadFile(file, type = 'chat') {
  // Check if Firebase is configured
  const hasFirebase = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                      process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_firebase_api_key_here'

  if (hasFirebase) {
    // Use Firebase Storage (when configured)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const { url } = await response.json()
        return { url, storage: 'firebase' }
      }
    } catch (error) {
      console.error('Firebase upload failed, falling back to base64:', error)
    }
  }

  // Fallback to base64 (current method)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve({ url: reader.result, storage: 'base64' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function getFileSize(sizeInBytes) {
  if (sizeInBytes < 1024) return `${sizeInBytes}B`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)}KB`
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`
}
