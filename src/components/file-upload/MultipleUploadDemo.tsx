import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress
} from '@mui/material'
import { CloudUpload, CheckCircle, Error } from '@mui/icons-material'
import { useFileUpload } from 'src/hooks/useFileUpload'

const MultipleUploadDemo: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadResults, setUploadResults] = useState<string[]>([])
  const { uploadMultipleFiles, isUploading, uploadProgress, error, reset } = useFileUpload()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleUploadMultiple = async () => {
    if (selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất một file')
      return
    }

    try {
      const response = await uploadMultipleFiles(selectedFiles)
      console.log('Multiple upload success:', response)

      // API trả về response.data.urls theo format bạn cung cấp
      const urls = response.data?.urls || []
      setUploadResults(urls)

      alert(`Upload thành công ${selectedFiles.length} file!`)
    } catch (error) {
      console.error('Multiple upload failed:', error)
      alert('Upload thất bại!')
    }
  }

  const handleReset = () => {
    setSelectedFiles([])
    setUploadResults([])
    reset()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Demo Upload Nhiều Ảnh (API Format Mới)
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Chọn Nhiều File
        </Typography>

        <Box sx={{ mb: 2 }}>
          <input
            accept='image/*'
            multiple
            type='file'
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id='multiple-file-input'
          />
          <label htmlFor='multiple-file-input'>
            <Button variant='outlined' component='span' startIcon={<CloudUpload />} disabled={isUploading}>
              Chọn Nhiều Ảnh
            </Button>
          </label>
        </Box>

        {selectedFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              Đã chọn {selectedFiles.length} file:
            </Typography>
            <List dense>
              {selectedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
                  <Chip label={`File ${index + 1}`} size='small' color='primary' />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {isUploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant='determinate' value={uploadProgress} />
            <Typography variant='caption' sx={{ mt: 1 }}>
              Đang upload... {uploadProgress}%
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            onClick={handleUploadMultiple}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Đang upload...' : `Upload ${selectedFiles.length} File`}
          </Button>

          <Button variant='outlined' onClick={handleReset} disabled={isUploading}>
            Reset
          </Button>
        </Box>
      </Paper>

      {uploadResults.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            Kết Quả Upload (URLs từ API)
          </Typography>

          <List>
            {uploadResults.map((url, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color='success' />
                </ListItemIcon>
                <ListItemText primary={`Image ${index + 1}`} secondary={url} />
                <Chip label='Thành công' color='success' size='small' />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant='subtitle2' gutterBottom>
              Response Format từ API:
            </Typography>
            <Typography variant='body2' component='pre' sx={{ fontSize: '0.8rem' }}>
              {JSON.stringify(
                {
                  status: 'success',
                  message: 'Images uploaded successfully',
                  error: null,
                  data: {
                    urls: uploadResults
                  }
                },
                null,
                2
              )}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default MultipleUploadDemo
