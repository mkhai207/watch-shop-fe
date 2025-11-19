import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  CssBaseline,
  Typography,
  useTheme,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material'
import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import IconifyIcon from 'src/components/Icon'
import CustomTextField from 'src/components/text-field'
import { resetPassword } from 'src/services/auth'
import * as yup from 'yup'
import LoginDark from '/public/images/login-dark.png'
import LoginLight from '/public/images/login-light.png'

type TProps = {}

type TDefaultValues = {
  password: string
  confirmPassword: string
}

const ResetPasswordPage: NextPage<TProps> = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState('')

  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()

  const schema = yup.object({
    password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: yup
      .string()
      .required('Xác nhận mật khẩu là bắt buộc')
      .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
  })

  const defaultValues: TDefaultValues = {
    password: '',
    confirmPassword: ''
  }

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // Extract token from URL on component mount
  useEffect(() => {
    if (router.isReady) {
      const urlToken = router.query.token as string
      if (urlToken) {
        setToken(urlToken)
      } else {
        setTokenError('Token không hợp lệ hoặc đã hết hạn')
      }
    }
  }, [router.isReady, router.query.token])

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      toast.error('Token không hợp lệ')
      return
    }

    if (!Object.keys(errors)?.length) {
      try {
        setLoading(true)
        const response = await resetPassword(token, data.password)

        if (response) {
          setIsSuccess(true)
          toast.success('Đặt lại mật khẩu thành công!')
          reset()

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      } catch (error: any) {
        console.error('Reset password error:', error)
        if (error.response?.status === 400) {
          toast.error('Token không hợp lệ hoặc đã hết hạn')
          setTokenError('Token không hợp lệ hoặc đã hết hạn')
        } else if (error.response?.status === 404) {
          toast.error('Người dùng không tồn tại')
        } else {
          toast.error('Có lỗi xảy ra, vui lòng thử lại')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleBackToForgot = () => {
    router.push('/forgot-password')
  }

  // If token error, show error page
  if (tokenError) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          backgroundColor: theme.palette.background.paper,
          alignItems: 'center',
          padding: '40px',
          display: 'flex'
        }}
      >
        <Box
          display={{ md: 'flex', xs: 'none' }}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '20px',
            backgroundColor: theme.palette.customColors.bodyBg,
            height: '100%',
            minWidth: '50vw'
          }}
        >
          <Image
            src={theme.palette.mode === 'light' ? LoginLight : LoginDark}
            alt='reset password image'
            style={{
              height: 'auto',
              width: 'auto'
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1' }}>
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 400,
              width: '100%'
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                borderRadius: 2,
                textAlign: 'center',
                background: 'linear-gradient(145deg, #ffebee 0%, #ffffff 100%)'
              }}
            >
              <IconifyIcon
                icon='mdi:alert-circle-outline'
                fontSize={64}
                style={{ color: theme.palette.error.main, marginBottom: 16 }}
              />

              <Typography variant='h4' fontWeight='bold' gutterBottom color='error.main'>
                Liên kết không hợp lệ
              </Typography>

              <Alert severity='error' sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant='body1'>{tokenError}</Typography>
              </Alert>

              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Liên kết có thể đã hết hạn hoặc đã được sử dụng. Vui lòng thực hiện lại quá trình quên mật khẩu.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  onClick={handleBackToForgot}
                  variant='contained'
                  size='large'
                  sx={{
                    height: 48,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Quên mật khẩu lại
                </Button>

                <Button
                  onClick={handleBackToLogin}
                  variant='outlined'
                  size='large'
                  sx={{
                    height: 48,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Quay lại đăng nhập
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
        alignItems: 'center',
        padding: '40px',
        display: 'flex'
      }}
    >
      <Box
        display={{ md: 'flex', xs: 'none' }}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20px',
          backgroundColor: theme.palette.customColors.bodyBg,
          height: '100%',
          minWidth: '50vw'
        }}
      >
        <Image
          src={theme.palette.mode === 'light' ? LoginLight : LoginDark}
          alt='reset password image'
          style={{
            height: 'auto',
            width: 'auto'
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1' }}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 400,
            width: '100%'
          }}
        >
          {!isSuccess ? (
            <>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <IconifyIcon
                  icon='mdi:lock-reset'
                  fontSize={48}
                  style={{ color: theme.palette.primary.main, marginBottom: 16 }}
                />
                <Typography component='h1' variant='h4' fontWeight='bold' gutterBottom>
                  Đặt lại mật khẩu
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </Typography>
              </Box>

              {/* Form */}
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  width: '100%',
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)'
                }}
              >
                <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
                  {/* New Password */}
                  <Box sx={{ mb: 3 }}>
                    <Controller
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomTextField
                          variant='outlined'
                          required
                          fullWidth
                          label='Mật khẩu mới'
                          placeholder='Nhập mật khẩu mới'
                          type={showPassword ? 'text' : 'password'}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          error={Boolean(errors?.password)}
                          helperText={errors?.password?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <IconifyIcon
                                icon='mdi:lock-outline'
                                style={{ marginRight: 8, color: theme.palette.text.secondary }}
                              />
                            ),
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={loading}
                                >
                                  {showPassword ? (
                                    <IconifyIcon icon='material-symbols:visibility-outline' />
                                  ) : (
                                    <IconifyIcon icon='material-symbols:visibility-off-outline-rounded' />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                      name='password'
                    />
                  </Box>

                  {/* Confirm Password */}
                  <Box sx={{ mb: 3 }}>
                    <Controller
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomTextField
                          variant='outlined'
                          required
                          fullWidth
                          label='Xác nhận mật khẩu'
                          placeholder='Nhập lại mật khẩu mới'
                          type={showConfirmPassword ? 'text' : 'password'}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          error={Boolean(errors?.confirmPassword)}
                          helperText={errors?.confirmPassword?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <IconifyIcon
                                icon='mdi:lock-check-outline'
                                style={{ marginRight: 8, color: theme.palette.text.secondary }}
                              />
                            ),
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  disabled={loading}
                                >
                                  {showConfirmPassword ? (
                                    <IconifyIcon icon='material-symbols:visibility-outline' />
                                  ) : (
                                    <IconifyIcon icon='material-symbols:visibility-off-outline-rounded' />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                      name='confirmPassword'
                    />
                  </Box>

                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    size='large'
                    disabled={loading}
                    sx={{
                      mb: 2,
                      height: 48,
                      fontWeight: 'bold',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color='inherit' />
                        Đang xử lý...
                      </Box>
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      onClick={handleBackToLogin}
                      variant='text'
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                      startIcon={<IconifyIcon icon='mdi:arrow-left' />}
                    >
                      Quay lại đăng nhập
                    </Button>
                  </Box>
                </form>
              </Paper>
            </>
          ) : (
            // Success State
            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                borderRadius: 2,
                textAlign: 'center',
                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)'
              }}
            >
              <IconifyIcon
                icon='mdi:check-circle-outline'
                fontSize={64}
                style={{ color: theme.palette.success.main, marginBottom: 16 }}
              />

              <Typography variant='h4' fontWeight='bold' gutterBottom color='success.main'>
                Đặt lại mật khẩu thành công!
              </Typography>

              <Alert severity='success' sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant='body1'>
                  Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
                </Typography>
              </Alert>

              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
              </Typography>

              <Button
                onClick={handleBackToLogin}
                variant='contained'
                size='large'
                sx={{
                  height: 48,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Đăng nhập ngay
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ResetPasswordPage
