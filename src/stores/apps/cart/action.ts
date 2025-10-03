import { createAsyncThunk } from '@reduxjs/toolkit'
import { addToCart, deleteCartItem, deleteCartItems, getCartItems, updateCartItem } from 'src/services/cart'
import { createUserInteraction } from 'src/services/userInteraction'
import { TUpdateCartItem } from 'src/types/cart'

export const serviceName = 'cart'

// ** Add to cart
export const addToCartAsync = createAsyncThunk('cart/addToCart', async (data: any, { dispatch }) => {
  const response = await addToCart(data)
  // Consider multiple possible success shapes
  const isSuccess = Boolean(
    response?.status === 'success' || response?.cartItem || response?.cart || response?.data?.id || response?.id
  )

  if (isSuccess) {
    // Refresh cart immediately to update header badge
    dispatch(getCartItemsAsync())
    dispatch(
      createUserInteractionAsync({
        product_id: data?.product_id || '',
        interaction_type: 3
      })
    )

    return { status: 'success', data: response?.data || response?.cartItem || response?.cart || response }
  }

  return {
    status: 'error',
    data: null,
    message: response?.message || response?.response?.data?.message,
    error: response?.error || response?.response?.data?.error
  }
})

// ** get cart items
export const getCartItemsAsync = createAsyncThunk('cart/getCartItems', async () => {
  const response = await getCartItems()
  if (response?.cart) {
    // Normalize to data array of items
    return { status: 'success', data: response.cart.cartItems?.rows || [], message: '' }
  }

  return {
    data: null,
    message: response?.response?.data?.message || 'Failed to get cart'
  }
})

// ** update cart item
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, data }: { itemId: string; data: TUpdateCartItem }, { dispatch }) => {
    const response = await updateCartItem(itemId, data)

    // New API returns { cartItem: {...} }
    if (response?.cartItem) {
      return { status: 'success', data: response.cartItem, message: '' }
    }

    return {
      status: 'error',
      data: null,
      message: response?.message || response?.response?.data?.message || 'Cập nhật số lượng thất bại',
      error: response?.error || response?.response?.data?.error
    }
  }
)

// ** delete cart item
export const deleteCartItemAsync = createAsyncThunk('cart/deleteCartItem', async (itemId: string, { dispatch }) => {
  const response = await deleteCartItem(itemId)

  // New API returns { success: true }
  if (response?.success) {
    dispatch(getCartItemsAsync())

    return { status: 'success', data: null, message: 'Đã xóa sản phẩm khỏi giỏ hàng' }
  }

  return {
    status: 'error',
    data: null,
    message: response?.message || response?.response?.data?.message || 'Xóa sản phẩm thất bại',
    error: response?.error || response?.response?.data?.error
  }
})

// ** delete all cart items
export const deleteCartItemsAsync = createAsyncThunk('cart/deleteCartItem', async () => {
  const response = await deleteCartItems()

  if (response?.status === 'success') {
    return response
  }

  return {
    data: null,
    message: response?.response.data.message,
    error: response?.response.data.error
  }
})

export const createUserInteractionAsync = createAsyncThunk(
  'user-interaction',
  async (data: { product_id: string; interaction_type: number }) => {
    const response = await createUserInteraction(data)

    if (response?.status === 'success') {
      console.log('createUserInteractionAsync', response)

      return response
    }

    return {
      data: null,
      message: response?.response.data.message,
      error: response?.response.data.error
    }
  }
)
