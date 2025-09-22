import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import FileUpload from './index'
import AdvancedFileUpload from './AdvancedFileUpload'

const UploadDemo: React.FC = () => {
  const handleUploadSuccess = (response: any) => {
    console.log('Upload thành công:', response)
    alert('Upload thành công!')
  }

  const handleUploadError = (error: any) => {
    console.error('Upload thất bại:', error)
    alert('Upload thất bại!')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Demo Upload Ảnh
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, minWidth: 300 }}>
          <Typography variant='h6' gutterBottom>
            Component Upload Cơ Bản
          </Typography>
          <FileUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
        </Paper>

        <Paper sx={{ p: 3, minWidth: 300 }}>
          <Typography variant='h6' gutterBottom>
            Component Upload Nâng Cao
          </Typography>
          <AdvancedFileUpload
            maxFileSize={10}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </Paper>
      </Box>
    </Box>
  )
}

export default UploadDemo
