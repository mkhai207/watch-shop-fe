import React, { useState } from 'react'
import { Button, Box, Typography, CircularProgress } from '@mui/material'
import { uploadImage } from 'src/services/file'

interface FileUploadProps {
  onUploadSuccess?: (response: any) => void
  onUploadError?: (error: any) => void
  accept?: string
  multiple?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = 'image/*',
  multiple = false
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    setIsUploading(true)
    try {
      const response = await uploadImage(selectedFile)
      console.log('Upload success:', response)
      onUploadSuccess?.(response)
      setSelectedFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
      <Typography variant='h6' gutterBottom>
        Upload Ảnh
      </Typography>

      <input
        accept={accept}
        multiple={multiple}
        type='file'
        onChange={handleFileSelect}
        style={{ marginBottom: '16px' }}
      />

      {selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2'>File đã chọn: {selectedFile.name}</Typography>
        </Box>
      )}

      <Button
        variant='contained'
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        startIcon={isUploading ? <CircularProgress size={20} /> : null}
      >
        {isUploading ? 'Đang upload...' : 'Upload Ảnh'}
      </Button>
    </Box>
  )
}

export default FileUpload
