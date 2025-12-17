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
import { createBrand, updateBrand } from 'src/services/brand'
import { uploadImage } from 'src/services/file'
import type { TCreateBrand, TUpdateBrand, TBrand } from 'src/types/brand'

interface CreateBrandDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: TBrand | null
}

const CreateBrandDialog: React.FC<CreateBrandDialogProps> = ({ open, onClose, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string>('')
  const [nameTouched, setNameTouched] = useState(false)

  const isEditMode = !!editData

  useEffect(() => {
    if (open) {
      if (editData) {
        setNameInput(editData.name || '')
        setDescriptionInput(editData.description || '')
        setLogoPreview(editData.logo_url || null)
        setLogoFile(null)
        setNameError('')
        setNameTouched(false)
      } else {
        setNameInput('')
        setDescriptionInput('')
        setLogoFile(null)
        setLogoPreview(null)
        setNameError('')
        setNameTouched(false)
      }
    }
  }, [open, editData])

  const validateName = (value: string): string => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Tên thương hiệu không được để trống'
    }
    if (trimmed.length < 2) {
      return 'Tên thương hiệu phải có ít nhất 2 ký tự'
    }
    if (trimmed.length > 100) {
      return 'Tên thương hiệu không được quá 100 ký tự'
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSubmit = async () => {
    const nameValidationError = validateName(nameInput)
    if (nameValidationError) {
      setNameError(nameValidationError)
      toast.error(nameValidationError)

      return
    }

    const payload: TCreateBrand | TUpdateBrand = { name: nameInput.trim() }

    try {
      setLoading(true)
      if (logoFile) {
        const uploadRes = await uploadImage(logoFile)
        const imageUrl = (uploadRes as any)?.uploadedImage?.url as string | undefined
        if (imageUrl) {
          payload.logo_url = imageUrl
        }
      }
      if (descriptionInput.trim()) {
        payload.description = descriptionInput.trim()
      }

      if (isEditMode) {
        const res = await updateBrand(editData!.id, payload as TUpdateBrand)
        if ((res as any)?.brand) {
          toast.success('Cập nhật thương hiệu thành công')
          onSuccess()
          onClose()
        }
      } else {
        const res = await createBrand(payload as TCreateBrand)
        if ((res as any)?.brand) {
          toast.success('Tạo thương hiệu thành công')
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
        Thêm thương hiệu
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
              {logoPreview ? (
                <>
                  <Box
                    component='img'
                    src={logoPreview}
                    alt='Logo preview'
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
                      handleRemoveLogo()
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
                  <input hidden type='file' accept='image/*' onChange={handleLogoChange} />
                </Box>
              )}
            </Box>
          </Box>

          <TextField
            autoFocus
            fullWidth
            label='Tên thương hiệu'
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

export default CreateBrandDialog
