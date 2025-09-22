import React, { useState } from 'react'
import { Button, Box, Typography, CircularProgress, LinearProgress, Alert, Paper } from '@mui/material'
import { useFileUpload } from 'src/hooks/useFileUpload'

interface AdvancedFileUploadProps {
  onUploadSuccess?: (response: any) => void
  onUploadError?: (error: any) => void
  accept?: string
  multiple?: boolean
  maxFileSize?: number // in MB
}

const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = 'image/*',
  multiple = false,
  maxFileSize = 5 // 5MB default
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { uploadFile, isUploading, uploadProgress, error, reset } = useFileUpload()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Kiểm tra kích thước file
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File quá lớn. Kích thước tối đa là ${maxFileSize}MB`)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    try {
      const response = await uploadFile(selectedFile)
      console.log('Upload success:', response)
      onUploadSuccess?.(response)
      setSelectedFile(null)
      reset()
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    reset()
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant='h6' gutterBottom>
        Upload Ảnh Nâng Cao
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <input
          accept={accept}
          multiple={multiple}
          type='file'
          onChange={handleFileSelect}
          style={{ marginBottom: '16px' }}
        />
      </Box>

      {selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            File: {selectedFile.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
        </Box>
      )}

      {isUploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' gutterBottom>
            Đang upload... {uploadProgress}%
          </Typography>
          <LinearProgress variant='determinate' value={uploadProgress} />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant='contained'
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : null}
        >
          {isUploading ? 'Đang upload...' : 'Upload Ảnh'}
        </Button>

        <Button variant='outlined' onClick={handleReset} disabled={isUploading}>
          Reset
        </Button>
      </Box>

      <Typography variant='caption' color='text.secondary' sx={{ mt: 2, display: 'block' }}>
        Kích thước tối đa: {maxFileSize}MB
      </Typography>
    </Paper>
  )
}

export default AdvancedFileUpload
