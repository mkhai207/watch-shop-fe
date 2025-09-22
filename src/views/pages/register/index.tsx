import { Box, Button, CssBaseline, Grid, IconButton, InputAdornment, Typography, useTheme } from '@mui/material'
import { NextPage } from 'next'
import Link from 'next/link'
import CustomTextField from 'src/components/text-field'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { EMAIL_REG } from 'src/configs/regex'
import { useEffect, useState } from 'react'
import IconifyIcon from 'src/components/Icon'
import Image from 'next/image'
import RegisterLight from '/public/images/register-light.png'
import RegisterDark from '/public/images/register-dark.png'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { registerAuthAsync } from 'src/stores/apps/auth/action'
import toast from 'react-hot-toast'
import FallbackSpinner from 'src/components/fall-back'
import { resetInitialState } from 'src/stores/apps/auth'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'

type TProps = {}

type TDefaultValues = {
  fullname: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterPage: NextPage<TProps> = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const theme = useTheme()
  const dispatch: AppDispatch = useDispatch()
  const { isLoading, isError, message } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const schema = yup.object({
    fullname: yup.string().required('Full name is required'),
    phone: yup.string().required('Phone number is required'),
    email: yup.string().required('Email is required').matches(EMAIL_REG, 'The field is must email type'),
    password: yup.string().required('Password is required'),
    confirmPassword: yup
      .string()
      .required('Password is required')
      .oneOf([yup.ref('password')], 'Passwords must match')
  })

  const defaultValues: TDefaultValues = {
    fullname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const onSubmit = (data: {
    fullname: string
    phone: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    dispatch(
      registerAuthAsync({
        fullName: data.fullname,
        phone: data.phone,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      })
    )
  }

  useEffect(() => {
    if (message) {
      if (isError) {
        toast.error(message)
      } else {
        toast.success(message)
        router.push(ROUTE_CONFIG.LOGIN)
      }
    }
    dispatch(resetInitialState())
  }, [isLoading, isError, message])

  return (
    <>
      {isLoading && <FallbackSpinner />}
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
            src={theme.palette.mode === 'light' ? RegisterLight : RegisterDark}
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
              Register
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
                      label='FullName'
                      placeholder='Input full name'
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={Boolean(errors?.fullname)}
                      helperText={errors?.fullname?.message}
                    />
                  )}
                  name='fullname'
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
                      label='Phone'
                      placeholder='Input full name'
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={Boolean(errors?.phone)}
                      helperText={errors?.phone?.message}
                    />
                  )}
                  name='phone'
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
                      label='Email'
                      placeholder='Input email'
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={Boolean(errors?.email)}
                      helperText={errors?.email?.message}
                    />
                  )}
                  name='email'
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
                      label='Password'
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
                      label='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='Input confirm password'
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={Boolean(errors?.confirmPassword)}
                      helperText={errors?.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={() => {
                                setShowConfirmPassword(!showConfirmPassword)
                              }}
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

              <Button type='submit' fullWidth variant='contained' color='primary' sx={{ mt: 3, mb: 2 }}>
                Register
              </Button>
              <Grid container>
                <Grid item xs>
                  {'You already have an account?'}
                </Grid>
                <Grid item>
                  <Link href='/login'>{'Login'}</Link>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default RegisterPage
