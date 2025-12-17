import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton
} from '@mui/material'
import { Close, AddPhotoAlternate } from '@mui/icons-material'
import toast from 'react-hot-toast'
import { createCategory, updateCategory } from 'src/services/category'
import { uploadImage } from 'src/services/file'
import type { TCreateCategory, TUpdateCategory, TCategory } from 'src/types/category/manage'

interface CreateCategoryDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: TCategory | null
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({ open, onClose, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string>('')
  const [nameTouched, setNameTouched] = useState(false)

  const isEditMode = !!editData

  useEffect(() => {
    if (open) {
      if (editData) {
        setNameInput(editData.name || '')
        setDescriptionInput(editData.description || '')
        setImagePreview(editData.image_url || null)
        setImageFile(null)
        setNameError('')
        setNameTouched(false)
      } else {
        setNameInput('')
        setDescriptionInput('')
        setImageFile(null)
        setImagePreview(null)
        setNameError('')
        setNameTouched(false)
      }
    }
  }, [open, editData])

  const validateName = (value: string): string => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Tên phân loại không được để trống'
    }
    if (trimmed.length < 2) {
      return 'Tên phân loại phải có ít nhất 2 ký tự'
    }
    if (trimmed.length > 100) {
      return 'Tên phân loại không được quá 100 ký tự'
    }
    return ''
  }

  const handleNameBlur = () => {
    setNameTouched(true)
    const error = validateName(nameInput)
    setNameError(error)
  }

  const handleNameFocus = () => {
    if (nameTouched) {
      setNameError('')
    }
  }

  const clearNameError = () => {
    setNameError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async () => {
    const nameValidationError = validateName(nameInput)
    if (nameValidationError) {
      setNameError(nameValidationError)
      toast.error(nameValidationError)
      return
    }

    const payload: TCreateCategory | TUpdateCategory = { name: nameInput.trim() }

    try {
      setLoading(true)
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile)
        const imageUrl = (uploadRes as any)?.uploadedImage?.url as string | undefined
        if (imageUrl) {
          payload.image_url = imageUrl
        }
      }
      if (descriptionInput.trim()) {
        payload.description = descriptionInput.trim()
      }

      if (isEditMode) {
        const res = await updateCategory(editData!.id, payload as TUpdateCategory)
        if ((res as any)?.category) {
          toast.success('Cập nhật phân loại thành công')
          onSuccess()
          onClose()
        }
      } else {
        const res = await createCategory(payload as TCreateCategory)
        if ((res as any)?.category) {
          toast.success('Tạo phân loại thành công')
          onSuccess()
          onClose()
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle
        sx={{ fontWeight: 700, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}
      >
        {isEditMode ? 'Cập nhật phân loại' : 'Thêm phân loại'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: 150,
                height: 150,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: 'grey.50',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'grey.100'
                }
              }}
            >
              {imagePreview ? (
                <>
                  <Box
                    component='img'
                    src={imagePreview}
                    alt='Image preview'
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white'
                      }
                    }}
                    onClick={e => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                  >
                    <Close fontSize='small' />
                  </IconButton>
                </>
              ) : (
                <Box
                  component='label'
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <AddPhotoAlternate sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant='body2' color='text.secondary'>
                    Nhấn để chọn ảnh
                  </Typography>
                  <input hidden type='file' accept='image/*' onChange={handleImageChange} />
                </Box>
              )}
            </Box>
          </Box>

          <TextField
            autoFocus
            fullWidth
            label='Tên phân loại'
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={handleNameBlur}
            onFocus={handleNameFocus}
            error={!!nameError}
            helperText={nameError}
            required
          />

          <TextField
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 2 }}
            label='Mô tả'
            value={descriptionInput}
            onChange={e => setDescriptionInput(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={loading}>
          {loading ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...') : isEditMode ? 'Cập nhật' : 'Tạo'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateCategoryDialog
