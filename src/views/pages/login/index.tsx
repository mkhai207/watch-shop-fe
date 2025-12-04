import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme
} from '@mui/material'
import axios from 'axios'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import GoogleLoginButton from 'src/components/auth/GoogleLoginButton'
import IconifyIcon from 'src/components/Icon'
import CustomTextField from 'src/components/text-field'
import { CONFIG_API } from 'src/configs/api'
import { EMAIL_REG } from 'src/configs/regex'
import { setLocalUserData } from 'src/helpers/storage'
import { useAuth } from 'src/hooks/useAuth'
import * as yup from 'yup'
import LoginDark from '/public/images/login-dark.png'
import LoginLight from '/public/images/login-light.png'

type TProps = {}

type TDefaultValues = {
  userName: string
  password: string
}

const LoginPage: NextPage<TProps> = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isRemember, setIsRemember] = useState(true)

  const { login, setUser } = useAuth()
  const router = useRouter()

  const theme = useTheme()
  const { t } = useTranslation()

  // Persist returnUrl so it survives intermediate redirects / validation errors
  useEffect(() => {
    if (!router.isReady) return

    const qReturnUrl = router.query.returnUrl
    if (qReturnUrl && typeof window !== 'undefined') {
      window.sessionStorage.setItem('returnUrl', String(qReturnUrl))
    }
  }, [router.isReady, router.query.returnUrl])

  const schema = yup.object({
    userName: yup.string().required(t('email-is-required')),
    password: yup.string().required(t('password-is-required'))
  })

  const defaultValues: TDefaultValues = {
    userName: 'lkhai4617',
    password: 'k123123123'
  }

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: { userName: string; password: string }) => {
    if (!Object.keys(errors)?.length) {
      login({ ...data, rememberMe: isRemember }, err => {
        console.error('Login error:', err)

        if (err?.response?.status === 500) {
          const errorMessage = err?.response?.data?.message || 'Lỗi server, vui lòng thử lại sau'
          if (errorMessage.includes('Cannot read properties of null')) {
            toast.error('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa')
          } else {
            toast.error(`Lỗi server: ${errorMessage}`)
          }
        } else if (err?.response?.status === 401) {
          toast.error(t('username-or-password-is-incorrect'))
        } else if (err?.response?.status === 400) {
          const errorMessage = err?.response?.data?.message || 'Dữ liệu không hợp lệ'
          toast.error(errorMessage)
        } else if (err?.response?.status === 403) {
          toast.error('Tài khoản đã bị khóa hoặc không có quyền truy cập')
        } else if (err?.response?.data?.error) {
          toast.error(err.response.data.error)
        } else if (err?.response?.data?.message) {
          toast.error(err.response.data.message)
        } else if (err?.message) {
          if (err.message.includes('Network Error')) {
            toast.error('Không thể kết nối đến server, vui lòng kiểm tra mạng')
          } else {
            toast.error(`Lỗi: ${err.message}`)
          }
        } else {
          toast.error('Đã xảy ra lỗi không xác định, vui lòng thử lại')
        }
      })
    }
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
          alt='login image'
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
            alignItems: 'center'
          }}
        >
          <Typography component='h1' variant='h5'>
            Sign in
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
            <Box sx={{ mt: 2, width: '300px' }}>
              <Controller
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextField
                    variant='outlined'
                    required
                    fullWidth
                    label='UserName'
                    placeholder='Input email'
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={Boolean(errors?.userName)}
                    helperText={errors?.userName?.message}
                  />
                )}
                name='userName'
              />
            </Box>

            <Box sx={{ mt: 2, width: '300px' }}>
              <Controller
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextField
                    variant='outlined'
                    required
                    fullWidth
                    label={t('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Input password'
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={Boolean(errors?.password)}
                    helperText={errors?.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={() => {
                              setShowPassword(!showPassword)
                            }}
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

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='rememberMe'
                    checked={isRemember}
                    onChange={e => {
                      setIsRemember(e.target.checked)
                    }}
                    value='remember'
                    color='primary'
                  />
                }
                label={t('remember-me')}
              />
              <Link href='/forgot-password'>{t('forgot-password')}</Link>
            </Box>
            <Button type='submit' fullWidth variant='contained' color='primary' sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>

            {/* Google Login Button */}
            <GoogleLoginButton
              onSuccess={async response => {
                try {
                  const apiResponse = await axios.post(`${CONFIG_API.AUTH.INDEX}/google`, {
                    credential: response.credential,
                    userInfo: response.userInfo
                  })

                  if (apiResponse.data.user.id) {
                    console.log(apiResponse)
                    const userData = apiResponse.data.user
                    const accessToken = apiResponse.data.tokens.access.token
                    const refreshToken = apiResponse.data.tokens.refresh.token

                    setLocalUserData(JSON.stringify(userData), accessToken, refreshToken)
                    setUser(userData)

                    toast.success('Đăng nhập Google thành công!')

                    // Redirect
                    const returnUrl = router.query.returnUrl
                    const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
                    router.replace(redirectURL as string)
                  } else {
                    console.log('Status not success:', apiResponse.data.status)
                    toast.error('Đăng nhập thất bại - Server response không hợp lệ!')
                  }
                } catch (error: any) {
                  console.error('API call failed:', error)
                  console.error('Error response:', error.response?.data)
                  toast.error('Đăng nhập thất bại!')
                }
              }}
              onError={error => {
                console.error('Google login error:', error)
                toast.error('Đăng nhập Google thất bại!')
              }}
            />

            <Grid container>
              <Grid item xs>
                {t('dont-have-an-account')}
              </Grid>
              <Grid item>
                <Link
                  href={{
                    pathname: '/register',
                    query: router.query
                  }}
                >
                  {'Sign Up'}
                </Link>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
