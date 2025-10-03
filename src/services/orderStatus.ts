import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'

export interface OrderStatus {
  id: string
  code: string
  name: string
  description: string
  hex_code: string
  color: string
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  del_flag: string
}

export interface CreateOrderStatusRequest {
  code: string
  name: string
  description: string
  hex_code: string
  color: string
  sort_order: number
}

export interface UpdateOrderStatusRequest {
  code: string
  name: string
  description: string
  hex_code: string
  color: string
  sort_order: number
}

export interface OrderStatusListResponse {
  orderStatuses: {
    count: number
    rows: OrderStatus[]
  }
}

export interface OrderStatusResponse {
  orderStatus: OrderStatus
}

export interface DeleteOrderStatusResponse {
  success: boolean
}

export const getOrderStatusList = async () => {
  try {
    const res = await instanceAxios.get(CONFIG_API.ORDER_STATUS.INDEX)
    return res.data as OrderStatusListResponse
  } catch (error) {
    throw error
  }
}

export const getOrderStatusById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ORDER_STATUS.INDEX}/${id}`)
    return res.data as OrderStatusResponse
  } catch (error) {
    throw error
  }
}

export const createOrderStatus = async (data: CreateOrderStatusRequest) => {
  try {
    const res = await instanceAxios.post(CONFIG_API.ORDER_STATUS.INDEX, data)
    return res.data as OrderStatusResponse
  } catch (error) {
    throw error
  }
}

export const updateOrderStatus = async (id: string, data: UpdateOrderStatusRequest) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.ORDER_STATUS.INDEX}/${id}`, data)
    return res.data as OrderStatusResponse
  } catch (error) {
    throw error
  }
}

export const deleteOrderStatus = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.ORDER_STATUS.INDEX}/${id}`)
    return res.data as DeleteOrderStatusResponse
  } catch (error) {
    throw error
  }
}
