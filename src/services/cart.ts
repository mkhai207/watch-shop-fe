import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TAddToCart, TUpdateCartItem } from 'src/types/cart'

export const addToCart = async (data: any) => {
  try {
    const endpoint = `${CONFIG_API.CART.INDEX}`
    const payload = data?.variant_id
      ? data
      : { variant_id: data?.variant_id || data?.product_variant_id || data?.variantId, quantity: data?.quantity }
    const res = await instanceAxios.post(endpoint, payload)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCartItems = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.CART.INDEX}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateCartItem = async (id: string, data: TUpdateCartItem) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.CART_ITEM.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteCartItem = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.CART_ITEM.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteCartItems = async () => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.CART.INDEX}/delete-all`)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteCartItemsByIds = async (cartItemIds: (string | number)[]) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.CART.INDEX}`, {
      data: { cartItemIds }
    })

    return res.data
  } catch (error) {
    return error as any
  }
}
