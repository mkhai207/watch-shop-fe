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
    // Call new v1 orders list endpoint and normalize to existing consumer shape
    const res = await instanceAxios.get(`${CONFIG_API.ORDER.INDEX}`, {
      params: data.params,
      paramsSerializer: data.paramsSerializer
    })

    const raw = res.data
    // Expected backend shape:
    // { orders: { count: number, rows: Array<...> } }
    const rows = raw?.orders?.rows || []
    const count = raw?.orders?.count ?? rows.length

    // Normalize items for UI expectations
    const normalized = rows.map((item: any) => ({
      id: item.id,
      name: item.guess_name || item.name || '',
      shipping_address: item.shipping_address,
      created_at: item.created_at,
      status: item.status || item.current_status_id || 'PENDING'
    }))

    return {
      status: 'success',
      data: normalized,
      meta: {
        totalItems: count,
        totalPages: 1,
        currentPage: 1
      }
    }
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
