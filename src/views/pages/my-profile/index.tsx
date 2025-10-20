import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
  Divider,
  Stack
} from '@mui/material'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import IconifyIcon from 'src/components/Icon'
import Spinner from 'src/components/spinner'
import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { formatCompactVN } from 'src/utils/date'

type TProps = {}

interface UserData {
  id: string
  code: string | null
  username: string
  email: string
  phone_number: string | null
  first_name: string
  last_name: string
  gender: string | null
  date_of_birth: string | null
  address: string | null
  status: string
  created_at: string
  role_id: number
  role: {
    id: string
    name: string
    code: string
  }
}

interface AddressData {
  id: string
  city: string
  district: string
  ward: string
  street: string
  recipient_name: string
  phone_number: string
  is_default: string
  created_at: string
  user_id: string
}

const MyProfilePage: NextPage<TProps> = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { user: authUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [defaultAddress, setDefaultAddress] = useState<AddressData | null>(null)

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await instanceAxios.get(CONFIG_API.AUTH.AUTH_ME)
      if (response?.data?.user) {
        setUserData(response.data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDefaultAddress = async () => {
    try {
      const response = await instanceAxios.get(CONFIG_API.ADDRESS.INDEX)
      if (response?.data?.addresses?.rows) {
        const defaultAddr = response.data.addresses.rows.find((addr: AddressData) => addr.is_default === '1')
        setDefaultAddress(defaultAddr || null)
      }
    } catch (error) {
      console.error('Error fetching default address:', error)
    }
  }

  useEffect(() => {
    fetchUserData()
    fetchDefaultAddress()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case '0':
        return 'success'
      case '1':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case '0':
        return 'Hoạt động'
      case '1':
        return 'Tạm khóa'
      default:
        return 'Không xác định'
    }
  }

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'MALE':
        return 'Nam'
      case 'FEMALE':
        return 'Nữ'
      case 'OTHER':
        return 'Khác'
      default:
        return 'Chưa cập nhật'
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant='h6' color='text.secondary'>
          Không thể tải thông tin người dùng
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} sm='auto'>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '3rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <IconifyIcon icon='mdi:account' fontSize={60} />
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant='h4' fontWeight='bold' gutterBottom>
                {userData.first_name} {userData.last_name}
              </Typography>
              <Typography variant='h6' sx={{ opacity: 0.9, mb: 1 }}>
                @{userData.username}
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.8, mb: 2 }}>
                {userData.email}
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip
                  label={userData.role.name}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label={getStatusText(userData.status)}
                  color={getStatusColor(userData.status) as any}
                  sx={{ color: 'white' }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm='auto'>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant='outlined'
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  startIcon={<IconifyIcon icon='mdi:pencil' />}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant='outlined'
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  startIcon={<IconifyIcon icon='mdi:lock' />}
                >
                  Đổi mật khẩu
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Profile Information Cards */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconifyIcon icon='mdi:account-details' fontSize={24} color={theme.palette.primary.main} />
                <Typography variant='h6' fontWeight='bold' sx={{ ml: 1 }}>
                  Thông tin cá nhân
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Họ và tên
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {userData.first_name} {userData.last_name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Tên đăng nhập
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    @{userData.username}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Email
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {userData.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Số điện thoại
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {userData.phone_number || 'Chưa cập nhật'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Giới tính
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {getGenderText(userData.gender)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Ngày sinh
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {userData.date_of_birth ? formatCompactVN(userData.date_of_birth) : 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconifyIcon icon='mdi:shield-account' fontSize={24} color={theme.palette.primary.main} />
                <Typography variant='h6' fontWeight='bold' sx={{ ml: 1 }}>
                  Thông tin tài khoản
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    ID người dùng
                  </Typography>
                  <Typography variant='body1' fontWeight='medium' sx={{ fontFamily: 'monospace' }}>
                    #{userData.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Vai trò
                  </Typography>
                  <Chip label={userData.role.name} color='primary' variant='outlined' sx={{ fontWeight: 'bold' }} />
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Trạng thái tài khoản
                  </Typography>
                  <Chip
                    label={getStatusText(userData.status)}
                    color={getStatusColor(userData.status) as any}
                    variant='filled'
                  />
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Ngày tạo tài khoản
                  </Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {formatCompactVN(userData.created_at)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Địa chỉ mặc định
                  </Typography>
                  {defaultAddress ? (
                    <Box>
                      <Typography variant='body1' fontWeight='medium' gutterBottom>
                        {defaultAddress.recipient_name} - {defaultAddress.phone_number}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {defaultAddress.street}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant='body1' fontWeight='medium'>
                      Chưa có địa chỉ mặc định
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyProfilePage
