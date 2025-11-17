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
import instanceAxios from 'src/helpers/axios'

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email?.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.userName?.trim()) {
      newErrors.userName = 'Tên đăng nhập là bắt buộc'
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.fistName?.trim()) {
      newErrors.fistName = 'Tên là bắt buộc'
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Họ là bắt buộc'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await instanceAxios.post('https://watch-shop-uzr4.onrender.com/v1/auth/register', formData)

      if (response.data) {
        toast.success('Tạo người dùng thành công')
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating user:', error)

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
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Thêm người dùng mới</Typography>
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
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select value={formData.roleId} label='Vai trò' onChange={handleSelectChange('roleId')}>
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Customer</MenuItem>
                </Select>
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
