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
  Avatar,
  SelectChangeEvent
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { IUser } from 'src/types/user'
import toast from 'react-hot-toast'
import { updateUser } from 'src/services/user'

interface UserEditDialogProps {
  open: boolean
  user: IUser | null
  onClose: () => void
  onSuccess: () => void
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({ open, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: 0,
    role_id: 2
  })

  useEffect(() => {
    if (user) {
      setFormData({
        status: typeof user.status === 'string' ? parseInt(user.status) : user.status || 0,
        role_id: typeof user.role_id === 'string' ? parseInt(user.role_id) : user.role_id || 2
      })
    }
  }, [user])

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Chỉ gửi những field đã thay đổi so với dữ liệu gốc
      const changedFields: any = {}

      const originalStatus = typeof user.status === 'string' ? parseInt(user.status) : user.status || 0
      const originalRoleId = typeof user.role_id === 'string' ? parseInt(user.role_id) : user.role_id || 2

      if (formData.status !== originalStatus) {
        changedFields.status = formData.status.toString()
      }
      if (formData.role_id !== originalRoleId) {
        changedFields.role_id = formData.role_id
      }

      // Chỉ gửi request nếu có field thay đổi
      if (Object.keys(changedFields).length === 0) {
        toast('Không có thay đổi nào để cập nhật')

        return
      }

      const response = await updateUser(user.id, changedFields)

      if (response) {
        toast.success('Cập nhật người dùng thành công')
        onSuccess()
      }
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật người dùng')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<any>) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Chỉnh sửa người dùng</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          {/* User Info Header */}
          <Box display='flex' alignItems='center' mb={4}>
            <Avatar sx={{ width: 60, height: 60, mr: 3, bgcolor: 'primary.main' }}>
              {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant='h6' gutterBottom>
                {user?.fullName || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Email: {user?.email}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Thông tin cơ bản - Disabled */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Tên đăng nhập' value={user?.username || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Email' value={user?.email || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Họ và tên'
                value={user?.fullName || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || ''}
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Số điện thoại' value={user?.phone_number || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Giới tính'
                value={user?.gender === 'Male' ? 'Nam' : user?.gender === 'Female' ? 'Nữ' : ''}
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Ngày sinh' value={user?.date_of_birth || ''} disabled />
            </Grid>

            {/* Các trường có thể chỉnh sửa */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select value={formData.role_id} label='Vai trò' onChange={handleSelectChange('role_id')}>
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Customer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select value={formData.status} label='Trạng thái' onChange={handleSelectChange('status')}>
                  <MenuItem value={0}>Hoạt động</MenuItem>
                  <MenuItem value={1}>Tạm khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserEditDialog
