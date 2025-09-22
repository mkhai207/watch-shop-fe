import { useState } from 'react'
import { uploadImage, uploadMultipleImages } from 'src/services/file'

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<any>
  uploadMultipleFiles: (files: File[]) => Promise<any>
  isUploading: boolean
  uploadProgress: number
  error: string | null
  reset: () => void
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const response = await uploadImage(file)
      setUploadProgress(100)

      return response
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const uploadMultipleFiles = async (files: File[]) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const response = await uploadMultipleImages(files)
      setUploadProgress(100)

      return response
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)
  }

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    uploadProgress,
    error,
    reset
  }
}
