import { createAsyncThunk } from '@reduxjs/toolkit'
import { registerAuth, updateAuthMe } from 'src/services/auth'

// ** Add User
export const registerAuthAsync = createAsyncThunk('auth/register', async (data: any, { rejectWithValue }) => {
  try {
    const response = await registerAuth(data)

    if (response?.user) {
      return {
        data: response.user,
        message: 'Đăng ký thành công!',
        tokens: response.tokens
      }
    }

    // Trường hợp response không có user
    return rejectWithValue({
      message: 'Đăng ký thất bại'
    })
  } catch (error: any) {
    // Lấy message từ API response
    const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi đăng ký'
    return rejectWithValue({
      message
    })
  }
})

// ** update me
export const updateMeAuthAsync = createAsyncThunk('auth/update-me', async (data: any, { rejectWithValue }) => {
  try {
    const response = await updateAuthMe(data)
    console.log('registerResponse', response)

    if (response?.data) {
      return {
        data: response.data,
        message: response?.message || 'Cập nhật thành công',
        error: ''
      }
    }

    return rejectWithValue({
      message: response?.response?.data?.message || 'Cập nhật thất bại',
      error: response?.response?.data?.error || ''
    })
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra'
    return rejectWithValue({
      message,
      error: error?.response?.data?.error || ''
    })
  }
})
