// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'
import { TCartItem } from 'src/types/cart'
import { addToCartAsync, deleteCartItemAsync, getCartItemsAsync, serviceName, updateCartItemAsync } from './action'

interface CartState {
  items: TCartItem[]
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  message: string
  error: string
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  error: ''
}

export const cartSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetCart: state => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
      state.error = ''
    }
  },
  extraReducers: builder => {
    // ** add to cart
    builder.addCase(addToCartAsync.pending, state => {
      state.isLoading = true
      state.isSuccess = false
      state.isError = false
      state.message = ''
      state.error = ''
    })
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      console.log('action.payload', action)
      state.isLoading = false
      state.isSuccess = !!action.payload?.data?.id
      state.isError = !action.payload?.data?.id
      state.message = action.payload?.message || ''
      state.error = ''
    })
    builder.addCase(addToCartAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ''
      state.error = action.error.message || 'Failed to add to cart'
    })

    // ** get cart items
    builder
      .addCase(getCartItemsAsync.pending, state => {
        state.items = []
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(getCartItemsAsync.fulfilled, (state, action) => {
        state.items = action.payload?.data
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message || ''
        state.error = ''
      })
      .addCase(getCartItemsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Failed to get cart items'
      })

    // updateCartItemAsync
    builder
      .addCase(updateCartItemAsync.pending, state => {
        // do not toggle global spinner for quantity changes
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        const updated = action.payload?.data as any
        if (updated?.id) {
          const idx = state.items.findIndex(i => i.id === String(updated.id))
          if (idx !== -1) {
            state.items[idx] = { ...(state.items[idx] as any), ...updated }
          }
        }
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.isError = true
        state.isSuccess = false
        state.error = action.error.message || 'Failed to update cart item'
      })

    // deleteCartItemAsync
    builder
      .addCase(deleteCartItemAsync.pending, state => {
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(deleteCartItemAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
      })
      .addCase(deleteCartItemAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.isSuccess = false
        state.message = ''
        state.error = action.error.message || 'Failed to delete cart item'
      })
  }
})

export const { resetCart } = cartSlice.actions
export default cartSlice.reducer
