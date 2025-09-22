import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TAddToCart, TUpdateCartItem } from 'src/types/cart'

export const addToCart = async (data: TAddToCart) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.CART.INDEX}/create`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCartItems = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.CART.INDEX}/get-my-cart`)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateCartItem = async (id: string, data: TUpdateCartItem) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.CART.INDEX}/update/${id}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteCartItem = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.CART.INDEX}/delete/${id}`)

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
