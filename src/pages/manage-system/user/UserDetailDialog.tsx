import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  IconButton
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { IUser } from 'src/types/user'
import { getUserById } from 'src/services/user'
import dayjs from 'dayjs'
import Spinner from 'src/components/spinner'

interface UserDetailDialogProps {
  open: boolean
  user: IUser | null
  onClose: () => void
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ open, user, onClose }) => {
  const [userDetail, setUserDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!user?.id || !open) return

      setLoading(true)
      try {
        const response = await getUserById(user.id)
        if (response?.user) {
          setUserDetail(response.user)
        }
      } catch (error) {
        console.error('Error fetching user detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetail()
  }, [user?.id, open])

  if (!user) return null

  const getStatusColor = (status: string) => {
    return status === '0' ? 'success' : 'error'
  }

  const getStatusText = (status: string) => {
    return status === '0' ? 'Hoạt động' : 'Tạm khóa'
  }

  const getRoleColor = (roleId: number) => {
    return roleId === 1 ? 'error' : 'primary'
  }

  const getRoleText = (roleId: number, roleName?: string) => {
    if (roleName) return roleName

    return roleId === 1 ? 'Admin' : 'Customer'
  }

  const displayUser = userDetail || user
  const fullName = `${displayUser.first_name || ''} ${displayUser.last_name || ''}`.trim() || displayUser.username

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Chi tiết người dùng</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display='flex' justifyContent='center' p={4}>
            <Spinner />
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {/* Avatar and Basic Info */}
            <Box display='flex' alignItems='center' mb={3}>
              <Avatar alt={fullName} sx={{ width: 80, height: 80, mr: 3 }}>
                {fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant='h5' gutterBottom>
                  {fullName}
                </Typography>
                <Box display='flex' gap={1} mb={1}>
                  <Chip
                    label={getStatusText(displayUser.status)}
                    color={getStatusColor(displayUser.status)}
                    size='small'
                  />
                  <Chip
                    label={getRoleText(displayUser.role_id, displayUser['role.name'])}
                    color={getRoleColor(displayUser.role_id)}
                    size='small'
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Basic Information */}
            <Typography variant='h6' gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Họ
                  </Typography>
                  <Typography variant='body1'>{displayUser.first_name || 'Chưa cập nhật'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Tên
                  </Typography>
                  <Typography variant='body1'>{displayUser.last_name || 'Chưa cập nhật'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Tên đăng nhập
                  </Typography>
                  <Typography variant='body1'>{displayUser.username}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Email
                  </Typography>
                  <Typography variant='body1'>{displayUser.email}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Số điện thoại
                  </Typography>
                  <Typography variant='body1'>{displayUser.phone_number || 'Chưa cập nhật'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Giới tính
                  </Typography>
                  <Typography variant='body1'>
                    {displayUser.gender === '0' ? 'Nam' : displayUser.gender === '1' ? 'Nữ' : 'Chưa cập nhật'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Ngày sinh
                  </Typography>
                  <Typography variant='body1'>
                    {displayUser.date_of_birth
                      ? dayjs(displayUser.date_of_birth, 'YYYYMMDD').format('DD/MM/YYYY')
                      : 'Chưa cập nhật'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Địa chỉ
                  </Typography>
                  <Typography variant='body1'>{displayUser.address || 'Chưa cập nhật'}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Preferences (if available) */}
            {(displayUser.age_group || displayUser.gender_preference || displayUser.price_range_preference) && (
              <>
                <Typography variant='h6' gutterBottom>
                  Sở thích
                </Typography>
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} md={6}>
                    {displayUser.age_group && (
                      <Box mb={2}>
                        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                          Nhóm tuổi
                        </Typography>
                        <Typography variant='body1'>{displayUser.age_group}</Typography>
                      </Box>
                    )}

                    {displayUser.gender_preference && (
                      <Box mb={2}>
                        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                          Sở thích giới tính
                        </Typography>
                        <Typography variant='body1'>{displayUser.gender_preference}</Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {displayUser.price_range_preference && (
                      <Box mb={2}>
                        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                          Khoảng giá yêu thích
                        </Typography>
                        <Typography variant='body1'>{displayUser.price_range_preference}</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />
              </>
            )}

            {/* System Information */}
            <Typography variant='h6' gutterBottom>
              Thông tin hệ thống
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Ngày tạo
                  </Typography>
                  <Typography variant='body1'>
                    {dayjs(displayUser.created_at, 'YYYYMMDDHHMMSS').format('DD/MM/YYYY HH:mm:ss')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Ngày cập nhật
                  </Typography>
                  <Typography variant='body1'>
                    {displayUser.updated_at
                      ? dayjs(displayUser.updated_at, 'YYYYMMDDHHMMSS').format('DD/MM/YYYY HH:mm:ss')
                      : 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailDialog
