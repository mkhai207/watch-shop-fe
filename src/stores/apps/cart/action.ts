import { createAsyncThunk } from '@reduxjs/toolkit'
import { addToCart, deleteCartItem, deleteCartItems, getCartItems, updateCartItem } from 'src/services/cart'
import { createUserInteraction } from 'src/services/userInteraction'
import { TUpdateCartItem } from 'src/types/cart'

export const serviceName = 'cart'

// ** Add to cart
export const addToCartAsync = createAsyncThunk('cart/addToCart', async (data: any, { dispatch }) => {
  const response = await addToCart(data)
  if (response?.status === 'success' && response?.data) {
    dispatch(getCartItemsAsync())
    dispatch(
      createUserInteractionAsync({
        product_id: data?.product_id || '',
        interaction_type: 3
      })
    )

    return response
  }

  return {
    data: null,
    message: response?.response.data.message,
    error: response?.response.data.error
  }
})

// ** get cart items
export const getCartItemsAsync = createAsyncThunk('cart/getCartItems', async () => {
  const response = await getCartItems()
  console.log('getCartItemsAsync', response)

  if (response?.data) {
    return response
  }

  return {
    data: null,
    message: response?.response.data.message
  }
})

// ** update cart item
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, data }: { itemId: string; data: TUpdateCartItem }, { dispatch }) => {
    const response = await updateCartItem(itemId, data)

    if (response?.status === 'success' && response?.data) {
      dispatch(getCartItemsAsync())

      return response
    }

    return {
      data: null,
      message: response?.response.data.message,
      error: response?.response.data.error
    }
  }
)

// ** delete cart item
export const deleteCartItemAsync = createAsyncThunk('cart/deleteCartItem', async (itemId: string, { dispatch }) => {
  const response = await deleteCartItem(itemId)

  if (response?.status === 'success') {
    dispatch(getCartItemsAsync())

    return response
  }

  return {
    data: null,
    message: response?.response.data.message,
    error: response?.response.data.error
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
