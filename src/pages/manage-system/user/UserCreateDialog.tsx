import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  SelectChangeEvent,
  InputAdornment
} from '@mui/material'
import { Close, Visibility, VisibilityOff } from '@mui/icons-material'
import { IUserCreate } from 'src/types/user'
import toast from 'react-hot-toast'
import { registerAuth } from 'src/services/auth'
import { TRegisterAuth } from 'src/types/auth'

interface UserCreateDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const UserCreateDialog: React.FC<UserCreateDialogProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<IUserCreate>({
    email: '',
    userName: '',
    password: '',
    fistName: '',
    lastName: '',
    roleId: 2 // Default to Customer
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        email: '',
        userName: '',
        password: '',
        fistName: '',
        lastName: '',
        roleId: 2
      })
      setErrors({})
      setShowPassword(false)
    }
  }, [open])

  const validatePassword = (value: string): string => {
    if (value.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự'
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số'
    }

    return ''
  }

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'email':
        if (!value?.trim()) {
          return 'Email là bắt buộc'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không hợp lệ'
        }

        return ''
      case 'userName':
        if (!value?.trim()) {
          return 'Tên đăng nhập là bắt buộc'
        }

        return ''
      case 'password':
        if (!value?.trim()) {
          return 'Mật khẩu là bắt buộc'
        }

        return validatePassword(value)
      case 'fistName':
        if (!value?.trim()) {
          return 'Tên là bắt buộc'
        }
        
        return ''
      case 'lastName':
        if (!value?.trim()) {
          return 'Họ là bắt buộc'
        }

        return ''
      case 'roleId':
        if (!value) {
          return 'Vai trò là bắt buộc'
        }

        return ''
      default:
        return ''
    }
  }

  const handleBlur = (field: string) => () => {
    const error = validateField(field, formData[field as keyof IUserCreate])
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]

      return newErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError

    const userNameError = validateField('userName', formData.userName)
    if (userNameError) newErrors.userName = userNameError

    const passwordError = validateField('password', formData.password)
    if (passwordError) newErrors.password = passwordError

    const fistNameError = validateField('fistName', formData.fistName)
    if (fistNameError) newErrors.fistName = fistNameError

    const lastNameError = validateField('lastName', formData.lastName)
    if (lastNameError) newErrors.lastName = lastNameError

    const roleIdError = validateField('roleId', formData.roleId)
    if (roleIdError) newErrors.roleId = roleIdError

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0]
      toast.error(firstError)

      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const registerData: TRegisterAuth = {
        email: formData.email,
        userName: formData.userName,
        password: formData.password,
        fistName: formData.fistName,
        lastName: formData.lastName,
        roleId: formData.roleId
      }

      const response = await registerAuth(registerData)

      if (response) {
        toast.success('Tạo người dùng thành công')
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error?.response?.status === 400) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
      } else if (error?.response?.status === 409) {
        toast.error('Email hoặc tên đăng nhập đã tồn tại')
      } else {
        toast.error('Có lỗi xảy ra khi tạo người dùng')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof IUserCreate) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSelectChange = (field: keyof IUserCreate) => (event: SelectChangeEvent<any>) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user changes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' sx={{ fontWeight: 700, color: 'inherit' }}>Thêm người dùng mới</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ p: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={formData.email}
                onChange={handleInputChange('email')}
                onFocus={() => clearFieldError('email')}
                onBlur={handleBlur('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Tên đăng nhập'
                value={formData.userName}
                onChange={handleInputChange('userName')}
                onFocus={() => clearFieldError('userName')}
                onBlur={handleBlur('userName')}
                error={!!errors.userName}
                helperText={errors.userName}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Mật khẩu'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                onFocus={() => clearFieldError('password')}
                onBlur={handleBlur('password')}
                error={!!errors.password}
                helperText={errors.password}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Tên'
                value={formData.fistName}
                onChange={handleInputChange('fistName')}
                onFocus={() => clearFieldError('fistName')}
                onBlur={handleBlur('fistName')}
                error={!!errors.fistName}
                helperText={errors.fistName}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Họ'
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                onFocus={() => clearFieldError('lastName')}
                onBlur={handleBlur('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.roleId}>
                <InputLabel>Vai trò</InputLabel>
                <Select 
                  value={formData.roleId} 
                  label='Vai trò' 
                  onChange={handleSelectChange('roleId')}
                  onFocus={() => clearFieldError('roleId')}
                >
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Customer</MenuItem>
                </Select>
                {errors.roleId && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.roleId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo người dùng'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserCreateDialog
