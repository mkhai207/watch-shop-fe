import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TCreateOrder } from 'src/types/order'

export const createOrder = async (data: any) => {
  try {
    // API v1 expects POST /v1/orders with the payload
    const res = await instanceAxios.post(`${CONFIG_API.ORDER.INDEX}`, data)

    return res.data
  } catch (error) {
    return error
  }
}
