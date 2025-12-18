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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Badge
} from '@mui/material'
import { NextPage } from 'next'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import IconifyIcon from 'src/components/Icon'
import Spinner from 'src/components/spinner'
import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { formatCompactVN } from 'src/utils/date'
import { uploadImage } from 'src/services/file'

type TProps = {}

interface UserData {
  id: number
  code: string
  username: string
  email: string
  phone_number: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
  address: string
  status: string
  age_group: string
  gender_preference: string
  price_range_preference: string
  brand_preferences: string[]
  category_preferences: string[]
  style_preferences: string[]
  avatar_url?: string
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
  role_id: number
  role: {
    id: number
    name: string
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
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    address: '',
    age_group: '',
    gender_preference: '',
    price_range_preference: '',
    brand_preferences: [] as string[],
    category_preferences: [] as string[],
    style_preferences: [] as string[]
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const getGenderText = (gender: string) => {
    switch (gender) {
      case '0':
        return 'Nam'
      case '1':
        return 'Nữ'
      default:
        return 'Chưa cập nhật'
    }
  }

  const getGenderPreferenceText = (preference: string) => {
    switch (preference) {
      case 'M':
        return 'Nam'
      case 'F':
        return 'Nữ'
      case 'U':
        return 'Unisex'
      default:
        return 'Chưa cập nhật'
    }
  }

  const getPriceRangeText = (range: string) => {
    switch (range) {
      case 'budget':
        return 'Budget'
      case 'mid_range':
        return 'Mid Range'
      case 'premium':
        return 'Premium'
      case 'luxury':
        return 'Luxury'
      default:
        return 'Chưa cập nhật'
    }
  }

  const handleEditProfile = () => {
    if (userData) {
      setEditForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone_number: userData.phone_number || '',
        gender: userData.gender || '',
        date_of_birth: formatDateFromYYYYMMDD(userData.date_of_birth || ''),
        address: userData.address || '',
        age_group: userData.age_group || '',
        gender_preference: userData.gender_preference || '',
        price_range_preference: userData.price_range_preference || '',
        brand_preferences: userData.brand_preferences || [],
        category_preferences: userData.category_preferences || [],
        style_preferences: userData.style_preferences || []
      })
    }
    setOpenEditDialog(true)
  }

  const handleChangePassword = () => {
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    setOpenChangePasswordDialog(true)
  }

  const formatDateToYYYYMMDD = (dateStr: string) => {
    if (!dateStr) return ''

    return dateStr.replace(/-/g, '')
  }

  const formatDateFromYYYYMMDD = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return ''
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)

    return `${year}-${month}-${day}`
  }

  const handleUpdateProfile = async () => {
    console.log('handleUpdateProfile called')
    if (!userData) {
      console.log('No userData found')

      return
    }

    try {
      setUpdateLoading(true)
      console.log('Starting update profile with data:', editForm)

      if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
        toast.error('Họ và tên không được để trống')

        return
      }

      const updateData = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone_number: editForm.phone_number,
        gender: editForm.gender,
        date_of_birth: formatDateToYYYYMMDD(editForm.date_of_birth),
        address: editForm.address,
        age_group: editForm.age_group,
        gender_preference: editForm.gender_preference,
        price_range_preference: editForm.price_range_preference,
        brand_preferences: editForm.brand_preferences,
        category_preferences: editForm.category_preferences,
        style_preferences: editForm.style_preferences
      }

      console.log('Calling API:', `${CONFIG_API.AUTH.UPDATE_USER}/${userData.id}`)
      console.log('Update data:', updateData)

      const response = await instanceAxios.put(`${CONFIG_API.AUTH.UPDATE_USER}/${userData.id}`, updateData)
      console.log('API response:', response)

      if (response?.data) {
        toast.success('Cập nhật thông tin thành công')
        setOpenEditDialog(false)
        await fetchUserData()
      } else {
        throw new Error('Cập nhật thất bại')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Cập nhật thất bại')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    try {
      setAvatarUploadLoading(true)

      // Upload image
      const uploadResponse = await uploadImage(file)

      if (uploadResponse?.uploadedImage?.url) {
        // Update user with new avatar_url
        const updateResponse = await instanceAxios.put(`${CONFIG_API.AUTH.UPDATE_USER}/${userData?.id}`, {
          avatar_url: uploadResponse.uploadedImage.url
        })

        if (updateResponse?.data) {
          toast.success('Cập nhật ảnh đại diện thành công')
          await fetchUserData()
        } else {
          throw new Error('Cập nhật thất bại')
        }
      } else {
        throw new Error('Upload ảnh thất bại')
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Cập nhật ảnh đại diện thất bại')
    } finally {
      setAvatarUploadLoading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChangePasswordSubmit = async () => {
    try {
      setUpdateLoading(true)

      if (!passwordForm.current_password.trim()) {
        toast.error('Vui lòng nhập mật khẩu hiện tại')

        return
      }

      if (!passwordForm.new_password.trim()) {
        toast.error('Vui lòng nhập mật khẩu mới')

        return
      }

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp')

        return
      }

      if (passwordForm.new_password.length < 6) {
        toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')

        return
      }

      // Call API to change password
      const response = await instanceAxios.put(`${CONFIG_API.AUTH.CHANGE_PASSWORD}`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })

      if (response?.data) {
        toast.success('Đổi mật khẩu thành công')
        setOpenChangePasswordDialog(false)
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
      } else {
        throw new Error('Đổi mật khẩu thất bại')
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setUpdateLoading(false)
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
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <Badge
                overlap='circular'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    size='small'
                    onClick={handleAvatarClick}
                    disabled={avatarUploadLoading}
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <IconifyIcon icon='mdi:pencil' fontSize={20} color='primary' />
                  </IconButton>
                }
              >
                <Avatar
                  src={userData.avatar_url}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '3rem',
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {!userData.avatar_url && <IconifyIcon icon='mdi:account' fontSize={60} />}
                </Avatar>
              </Badge>
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
                  onClick={handleEditProfile}
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
                  onClick={handleChangePassword}
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

      <Grid container spacing={3}>
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
                    {userData.date_of_birth
                      ? formatCompactVN(formatDateFromYYYYMMDD(userData.date_of_birth))
                      : 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

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

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconifyIcon icon='mdi:heart' fontSize={24} color={theme.palette.primary.main} />
                <Typography variant='h6' fontWeight='bold' sx={{ ml: 1 }}>
                  Sở thích & Ưu tiên
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Nhóm tuổi
                    </Typography>
                    <Typography variant='body1' fontWeight='medium'>
                      {userData.age_group || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Ưu tiên giới tính
                    </Typography>
                    <Typography variant='body1' fontWeight='medium'>
                      {getGenderPreferenceText(userData.gender_preference)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Phân khúc giá ưa thích
                    </Typography>
                    <Typography variant='body1' fontWeight='medium'>
                      {getPriceRangeText(userData.price_range_preference)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Thương hiệu yêu thích
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {userData.brand_preferences && userData.brand_preferences.length > 0 ? (
                        userData.brand_preferences.map((brand, index) => (
                          <Chip key={index} label={brand} color='primary' size='small' />
                        ))
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          Chưa cập nhật
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Phân loại yêu thích
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {userData.category_preferences && userData.category_preferences.length > 0 ? (
                        userData.category_preferences.map((category, index) => (
                          <Chip key={index} label={category} color='secondary' size='small' />
                        ))
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          Chưa cập nhật
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Phong cách yêu thích
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {userData.style_preferences && userData.style_preferences.length > 0 ? (
                        userData.style_preferences.map((style, index) => (
                          <Chip key={index} label={style} color='success' size='small' />
                        ))
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          Chưa cập nhật
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Họ'
                value={editForm.first_name}
                onChange={e => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Tên'
                value={editForm.last_name}
                onChange={e => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Số điện thoại'
                value={editForm.phone_number}
                onChange={e => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={editForm.gender}
                  onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                  label='Giới tính'
                >
                  <MenuItem value='0'>Nam</MenuItem>
                  <MenuItem value='1'>Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='date'
                label='Ngày sinh'
                InputLabelProps={{ shrink: true }}
                value={editForm.date_of_birth}
                onChange={e => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Địa chỉ'
                value={editForm.address}
                onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Nhóm tuổi</InputLabel>
                <Select
                  value={editForm.age_group}
                  onChange={e => setEditForm(prev => ({ ...prev, age_group: e.target.value }))}
                  label='Nhóm tuổi'
                >
                  <MenuItem value='18-25'>18-25</MenuItem>
                  <MenuItem value='26-35'>26-35</MenuItem>
                  <MenuItem value='36-45'>36-45</MenuItem>
                  <MenuItem value='46-55'>46-55</MenuItem>
                  <MenuItem value='56-65'>56-65</MenuItem>
                  <MenuItem value='65+'>65+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ưu tiên giới tính</InputLabel>
                <Select
                  value={editForm.gender_preference}
                  onChange={e => setEditForm(prev => ({ ...prev, gender_preference: e.target.value }))}
                  label='Ưu tiên giới tính'
                >
                  <MenuItem value='M'>Nam</MenuItem>
                  <MenuItem value='F'>Nữ</MenuItem>
                  <MenuItem value='U'>Unisex</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Phân khúc giá ưa thích</InputLabel>
                <Select
                  value={editForm.price_range_preference}
                  onChange={e => setEditForm(prev => ({ ...prev, price_range_preference: e.target.value }))}
                  label='Phân khúc giá ưa thích'
                >
                  <MenuItem value='budget'>Budget</MenuItem>
                  <MenuItem value='mid_range'>Mid Range</MenuItem>
                  <MenuItem value='premium'>Premium</MenuItem>
                  <MenuItem value='luxury'>Luxury</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  'Rolex',
                  'Omega',
                  'Seiko',
                  'TAG Heuer',
                  'Breitling',
                  'Cartier',
                  'Patek Philippe',
                  'Audemars Piguet',
                  'IWC',
                  'Panerai',
                  'Hublot',
                  'Zenith'
                ]}
                value={editForm.brand_preferences}
                onChange={(_, newValue) => setEditForm(prev => ({ ...prev, brand_preferences: newValue }))}
                renderInput={params => <TextField {...params} label='Thương hiệu yêu thích' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant='outlined' label={option} size='small' {...getTagProps({ index })} key={option} />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  'Diving',
                  'Chronograph',
                  'Dress',
                  'Pilot',
                  'Military',
                  'Sports',
                  'Luxury',
                  'Vintage',
                  'Racing',
                  'GMT',
                  'Moon Phase',
                  'Tourbillon'
                ]}
                value={editForm.category_preferences}
                onChange={(_, newValue) => setEditForm(prev => ({ ...prev, category_preferences: newValue }))}
                renderInput={params => <TextField {...params} label='Phân loại yêu thích' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant='outlined' label={option} size='small' {...getTagProps({ index })} key={option} />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  'sport',
                  'dress',
                  'casual',
                  'luxury',
                  'vintage',
                  'modern',
                  'classic',
                  'elegant',
                  'professional',
                  'minimalist',
                  'bold',
                  'sophisticated'
                ]}
                value={editForm.style_preferences}
                onChange={(_, newValue) => setEditForm(prev => ({ ...prev, style_preferences: newValue }))}
                renderInput={params => <TextField {...params} label='Phong cách yêu thích' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant='outlined' label={option} size='small' {...getTagProps({ index })} key={option} />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={updateLoading}>
            Hủy
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              console.log('Button clicked')
              handleUpdateProfile()
            }}
            disabled={updateLoading}
          >
            {updateLoading ? 'Đang cập nhật...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePasswordDialog}
        onClose={() => setOpenChangePasswordDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                label='Mật khẩu hiện tại'
                value={passwordForm.current_password}
                onChange={e => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge='end' size='small'>
                      <IconifyIcon icon={showCurrentPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                label='Mật khẩu mới'
                value={passwordForm.new_password}
                onChange={e => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge='end' size='small'>
                      <IconifyIcon icon={showNewPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                label='Xác nhận mật khẩu mới'
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge='end' size='small'>
                      <IconifyIcon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangePasswordDialog(false)} disabled={updateLoading}>
            Hủy
          </Button>
          <Button variant='contained' onClick={handleChangePasswordSubmit} disabled={updateLoading}>
            {updateLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MyProfilePage
