import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateOrderSystem, TParams } from 'src/types/order'

// export type Order = TOrder
export interface CreateOrderResponse {
  status: string
  statusCode: number
  message: string
  data: any
  error: null
}

export const getListOrders = async (data: { params: TParams; paramsSerializer?: (params: any) => string }) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}`, {
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
    const res = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}/${id}/retry-payment`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getOrderDetail = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}/${id}`)

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

export const getOrderStatuses = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER_STATUS.INDEX}`)

    return res.data
  } catch (error) {
    return error
  }
}

export interface OrderStatusHistoryItem {
  id: string
  order_id: string
  status_id: string
  note: string | null
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  del_flag: string
  status?: {
    id: string
    name: string
    code: string
    description: string
  }
}

export interface OrderStatusHistoriesResponse {
  orderStatusHistorys: OrderStatusHistoryItem[]
}

export const getOrderStatusHistories = async (orderId: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER_STATUS_HISTORY.INDEX}/${orderId}`)

    return res.data as OrderStatusHistoriesResponse
  } catch (error) {
    return error
  }
}
