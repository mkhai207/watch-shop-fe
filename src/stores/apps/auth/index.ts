// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Axios Imports
import { registerAuthAsync, updateMeAuthAsync } from './action'

const initialState = {
  isLoading: false,
  isSuccess: true,
  isError: false,
  message: '',
  error: '',
  isSuccessUpdateMe: true,
  isErrorUpdateMe: false,
  messageUpdateMe: ''
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetInitialState: state => {
      state.isLoading = false
      state.isSuccess = true
      state.isError = false
      state.message = ''
      state.error = ''
      state.isSuccessUpdateMe = true
      state.isErrorUpdateMe = false
      state.messageUpdateMe = ''
    }
  },
  extraReducers: builder => {
    // ** register user
    builder.addCase(registerAuthAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(registerAuthAsync.fulfilled, (state, action) => {
      console.log('action', { action })
      state.isLoading = false
      state.isSuccess = !!action.payload?.data?.email
      state.isError = !action.payload?.data?.email
      state.message = action.payload?.message
      state.error = ''
    })
    builder.addCase(registerAuthAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = (action.payload as any)?.message || 'Có lỗi xảy ra'
      state.error = (action.payload as any)?.message || 'Có lỗi xảy ra'
    })

    // ** update me
    builder.addCase(updateMeAuthAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateMeAuthAsync.fulfilled, (state, action) => {
      console.log('action', { action })
      state.isLoading = false
      state.isSuccessUpdateMe = !!action.payload?.data
      state.isErrorUpdateMe = !action.payload?.data
      state.messageUpdateMe = action.payload?.message
      state.error = action.payload?.error || ''
    })
    builder.addCase(updateMeAuthAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateMe = false
      state.isErrorUpdateMe = true
      state.messageUpdateMe = (action.payload as any)?.message || 'Có lỗi xảy ra'
      state.error = (action.payload as any)?.error || ''
    })
  }
})

export const { resetInitialState } = authSlice.actions

export default authSlice.reducer
