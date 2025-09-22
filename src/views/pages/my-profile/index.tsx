import { yupResolver } from '@hookform/resolvers/yup'
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
  Typography
} from '@mui/material'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import IconifyIcon from 'src/components/Icon'
import Spinner from 'src/components/spinner'
import CustomTextField from 'src/components/text-field'
import WrapperFileUpload from 'src/components/wrapper-file-upload'
import { CONFIG_API } from 'src/configs/api'
import { EMAIL_REG } from 'src/configs/regex'
import instanceAxios from 'src/helpers/axios'
import { useFileUpload } from 'src/hooks/useFileUpload'
import { AppDispatch, RootState } from 'src/stores'
import { resetInitialState } from 'src/stores/apps/auth'
import { updateMeAuthAsync } from 'src/stores/apps/auth/action'
import { toDate } from 'src/utils/date'
import * as yup from 'yup'

type TProps = {}

type TDefaultValues = {
  fullname: string
  email: string
  phone?: string
  avatar?: File | string
  birthday?: string
  gender?: string
}

const MyProfilePage: NextPage<TProps> = () => {
  const theme = useTheme()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const dispatch: AppDispatch = useDispatch()
  const { uploadFile, isUploading, error: uploadError } = useFileUpload()
  const { isLoading, isErrorUpdateMe, messageUpdateMe, isSuccessUpdateMe } = useSelector(
    (state: RootState) => state.auth
  )

  const schema = yup.object({
    fullname: yup.string().required(t('Full name is required')),
    email: yup.string().required(t('Email is required')).matches(EMAIL_REG, t('invalid_email_format')),
    phone: yup.string().optional().min(10, t('phone_number_invalid')),
    avatar: yup.mixed().optional(),
    birthday: yup.string().optional(),
    gender: yup.string().optional()
  })

  const defaultValues: TDefaultValues = {
    fullname: '',
    email: '',
    phone: '',
    avatar: '',
    birthday: '',
    gender: ''
  }

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: any) => {
    try {
      let avatarUrl = null

      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile)
        if (uploadResponse?.data?.url) {
          avatarUrl = uploadResponse.data.url
        } else {
          toast.error('Không thể upload ảnh. Vui lòng thử lại')

          return
        }
      }

      const updateData: any = {
        fullname: data.fullname,
        email: data.email
      }

      if (data.phone) updateData.phone = data.phone
      if (data.birthday) updateData.birthday = data.birthday
      if (data.gender) updateData.gender = data.gender
      if (avatarUrl) updateData.avatar = avatarUrl

      dispatch(updateMeAuthAsync(updateData))
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra khi cập nhật thông tin')
    }
  }

  const handleUploadAvatar = (file: File) => {
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB')

        return
      }

      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file JPG, JPEG hoặc PNG')

        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setAvatar(url)

      // Cập nhật form value
      setValue('avatar', file)

      toast.success('Ảnh đã được tải lên thành công')
    }
  }

  const fetchGetAuthMe = async () => {
    await instanceAxios
      .get(CONFIG_API.AUTH.AUTH_ME)
      .then(async response => {
        setLoading(false)
        const data = response?.data?.data
        if (data) {
          data.avatar ? setAvatar(data.avatar) : setAvatar(null)
          reset({
            fullname: data?.fullName || '',
            email: data?.email || '',
            phone: data?.phone || '',
            birthday: toDate(data?.birthday) || '',
            gender: data?.gender || ''
          })
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchGetAuthMe()
  }, [])

  useEffect(() => {
    if (messageUpdateMe) {
      console.log('message: ', messageUpdateMe)
      if (isErrorUpdateMe) {
        toast.error(messageUpdateMe)
      } else {
        toast.success(messageUpdateMe)
        fetchGetAuthMe()

        // Reset selected file sau khi update thành công
        setSelectedFile(null)
      }
    }
    dispatch(resetInitialState())
  }, [isLoading, isErrorUpdateMe, isSuccessUpdateMe, messageUpdateMe])

  return (
    <>
      {(isLoading || loading || isUploading) && <Spinner />}
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: '16px',
              py: { xs: 4, sm: 5 },
              px: { xs: 3, sm: 4, md: 5 },
              width: { xs: '100%', sm: 480, md: 520, lg: 560 },
              maxWidth: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Grid container spacing={3} direction='column' alignItems='center'>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1
                  }}
                >
                  {avatar ? (
                    <Avatar
                      src={avatar}
                      sx={{
                        width: 100,
                        height: 100,
                        border: '3px solid',
                        borderColor: 'primary.main'
                      }}
                    >
                      <IconifyIcon icon='ph:user-thin' fontSize={70} />
                    </Avatar>
                  ) : (
                    <Avatar sx={{ width: 100, height: 100 }}>
                      <IconifyIcon icon='ph:user-thin' fontSize={70} />
                    </Avatar>
                  )}

                  <WrapperFileUpload
                    uploadFunc={handleUploadAvatar}
                    objectAcceptFile={{
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/png': ['.png']
                    }}
                  >
                    <Button
                      variant='outlined'
                      disabled={isUploading}
                      sx={{
                        width: 'auto',
                        borderRadius: '8px',
                        px: 3
                      }}
                    >
                      <IconifyIcon icon='mdi:camera' fontSize={18} />
                      <Box sx={{ ml: 1 }}>{isUploading ? 'Đang upload...' : t('Upload Avatar')}</Box>
                    </Button>
                  </WrapperFileUpload>

                  {uploadError && (
                    <Typography variant='caption' color='error'>
                      {uploadError}
                    </Typography>
                  )}

                  {selectedFile && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='caption' color='success.main'>
                        File đã chọn: {selectedFile.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ width: '100%' }}>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomTextField
                      required
                      autoFocus
                      fullWidth
                      label={t('Full Name')}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder={t('enter_your_fullname')}
                      error={Boolean(errors?.fullname)}
                      helperText={errors?.fullname?.message}
                    />
                  )}
                  name='fullname'
                />
              </Grid>

              <Grid item xs={12} sx={{ width: '100%' }}>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomTextField
                      disabled
                      required
                      fullWidth
                      label={t('Email')}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder={t('enter_your_email')}
                      error={Boolean(errors?.email)}
                      helperText={errors?.email?.message}
                    />
                  )}
                  name='email'
                />
              </Grid>

              <Grid item xs={12} sx={{ width: '100%' }}>
                <Controller
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomTextField
                      fullWidth
                      label={t('Phone')}
                      onChange={e => {
                        const numValue = e.target.value.replace(/[^0-9]/g, '')
                        onChange(numValue)
                      }}
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        maxLength: 10
                      }}
                      onBlur={onBlur}
                      value={value}
                      placeholder={t('enter_your_phone')}
                      error={Boolean(errors?.phone)}
                      helperText={errors?.phone?.message}
                    />
                  )}
                  name='phone'
                />
              </Grid>

              {/* Row layout cho BirthDay và Gender */}
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      control={control}
                      rules={{ required: false }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomTextField
                          fullWidth
                          label={t('Birth Day')}
                          type='date'
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          placeholder={t('enter_your_birthday')}
                          error={Boolean(errors?.birthday)}
                          helperText={errors?.birthday?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      name='birthday'
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl fullWidth error={Boolean(errors?.gender)}>
                          <InputLabel id='gender-label'>{t('Gender')}</InputLabel>
                          <Select
                            labelId='gender-label'
                            id='gender'
                            value={value || ''}
                            onChange={onChange}
                            onBlur={onBlur}
                            label={t('Gender')}
                          >
                            <MenuItem value='MALE'>{t('Male')}</MenuItem>
                            <MenuItem value='FEMALE'>{t('Female')}</MenuItem>
                            <MenuItem value='OTHER'>{t('Other')}</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      name='gender'
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isLoading}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    {isLoading ? 'Đang cập nhật...' : t('Change')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Box>
    </>
  )
}

export default MyProfilePage
