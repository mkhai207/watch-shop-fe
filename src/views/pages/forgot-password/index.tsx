import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, CssBaseline, Typography, useTheme, Paper, Alert, CircularProgress } from '@mui/material'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import IconifyIcon from 'src/components/Icon'
import CustomTextField from 'src/components/text-field'
import { EMAIL_REG } from 'src/configs/regex'
import { forgotPassword } from 'src/services/auth'
import * as yup from 'yup'
import LoginDark from '/public/images/login-dark.png'
import LoginLight from '/public/images/login-light.png'

type TProps = {}

type TDefaultValues = {
  email: string
}

const ForgotPasswordPage: NextPage<TProps> = () => {
  const [loading, setLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()

  const schema = yup.object({
    email: yup.string().required('Email là bắt buộc').matches(EMAIL_REG, 'Định dạng email không hợp lệ')
  })

  const defaultValues: TDefaultValues = {
    email: ''
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

  const onSubmit = async (data: { email: string }) => {
    if (!Object.keys(errors)?.length) {
      try {
        setLoading(true)
        const response = await forgotPassword(data.email)

        if (response) {
          setIsEmailSent(true)
          setSentEmail(data.email)
          toast.success('Email khôi phục mật khẩu đã được gửi!')
          reset()
        }
      } catch (error: any) {
        console.error('Forgot password error:', error)
        if (error.response?.status === 404) {
          toast.error('Email không tồn tại trong hệ thống')
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

  const handleResendEmail = () => {
    setIsEmailSent(false)
    setSentEmail('')
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
          alt='forgot password image'
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
          {!isEmailSent ? (
            <>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <IconifyIcon
                  icon='mdi:lock-reset'
                  fontSize={48}
                  style={{ color: theme.palette.primary.main, marginBottom: 16 }}
                />
                <Typography component='h1' variant='h4' fontWeight='bold' gutterBottom>
                  Quên mật khẩu?
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
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
                  <Box sx={{ mb: 3 }}>
                    <Controller
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomTextField
                          variant='outlined'
                          required
                          fullWidth
                          label='Địa chỉ Email'
                          placeholder='Nhập email của bạn'
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          error={Boolean(errors?.email)}
                          helperText={errors?.email?.message}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <IconifyIcon
                                icon='mdi:email-outline'
                                style={{ marginRight: 8, color: theme.palette.text.secondary }}
                              />
                            )
                          }}
                        />
                      )}
                      name='email'
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
                        Đang gửi...
                      </Box>
                    ) : (
                      'Gửi email khôi phục'
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
                icon='mdi:email-check-outline'
                fontSize={64}
                style={{ color: theme.palette.success.main, marginBottom: 16 }}
              />

              <Typography variant='h4' fontWeight='bold' gutterBottom color='success.main'>
                Email đã được gửi!
              </Typography>

              <Alert severity='success' sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant='body1' gutterBottom>
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                </Typography>
                <Typography variant='body1' fontWeight='bold'>
                  {sentEmail}
                </Typography>
              </Alert>

              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Vui lòng kiểm tra hộp thư đến (và thư mục spam) để xem email hướng dẫn. Liên kết sẽ hết hạn sau 15 phút.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  Quay lại đăng nhập
                </Button>

                <Button
                  onClick={handleResendEmail}
                  variant='outlined'
                  size='large'
                  sx={{
                    height: 48,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Gửi lại email
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ForgotPasswordPage
