import { createAsyncThunk } from '@reduxjs/toolkit'
import { registerAuth, updateAuthMe } from 'src/services/auth'

// ** Add User
export const registerAuthAsync = createAsyncThunk('auth/register', async (data: any) => {
  const response = await registerAuth(data)
  console.log('registerResponse', response)

  if (response?.user) {
    return {
      data: response.user,
      message: 'Đăng ký thành công!',
      tokens: response.tokens
    }
  }

  return {
    data: null,
    message: response?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký',
    error: response?.response?.data?.error || 'Unknown error'
  }
})

// ** update me
export const updateMeAuthAsync = createAsyncThunk('auth/update-me', async (data: any) => {
  const response = await updateAuthMe(data)
  console.log('registerResponse', response)

  if (response?.data) {
    return response
  }

  return {
    data: null,
    message: response?.response.data.message,
    error: response?.response.data.error
  }
})
