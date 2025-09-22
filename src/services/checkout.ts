import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TCreateOrder } from 'src/types/order'

export const createOrder = async (data: TCreateOrder) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.ORDER.INDEX}/create`, data)

    return res.data
  } catch (error) {
    return error
  }
}
