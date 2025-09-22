import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TOrder, TCreateOrderSystem, TParams } from 'src/types/order'

export type Order = TOrder
export interface CreateOrderResponse {
  status: string
  statusCode: number
  message: string
  data: Order
  error: null
}

export const getListOrders = async (data: { params: TParams; paramsSerializer?: (params: any) => string }) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}/get-orders`, {
      params: data.params,
      paramsSerializer: data.paramsSerializer
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const createOrderSystem = async (orderData: TCreateOrderSystem): Promise<CreateOrderResponse> => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.ORDER.INDEX}/create`, orderData)

    return res.data
  } catch (error) {
    throw error
  }
}

export const retryPayOrder = async (id: string) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.ORDER.INDEX}/${id}/retry-payment`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getOrderDetail = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}/get-orders/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateOrderStatus = async (id: string, data: { status: string }) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.ORDER.INDEX}/update/${id}`, data)

    return res.data
  } catch (error) {
    return error
  }
}
