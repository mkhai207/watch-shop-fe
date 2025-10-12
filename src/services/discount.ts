import { axiosInstance } from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TDiscount, DiscountResponse, NewDiscount } from 'src/types/discount'
import axios from 'axios'

export const discountService = {
  // Lấy danh sách tất cả khuyến mãi
  getDiscounts: async (): Promise<DiscountResponse> => {
    const response = await axiosInstance.get(CONFIG_API.DISCOUNT.GET_DISCOUNTS)

    return response.data
  },

  // Lấy thông tin một khuyến mãi theo ID
  getDiscountById: async (id: number): Promise<{ data: TDiscount }> => {
    const response = await axiosInstance.get(`${CONFIG_API.DISCOUNT.INDEX}/${id}`)

    return response.data
  },

  // Tạo khuyến mãi mới
  createDiscount: async (discount: NewDiscount): Promise<{ data: TDiscount }> => {
    const response = await axiosInstance.post(CONFIG_API.DISCOUNT.CREATE_DISCOUNT, discount)

    return response.data
  },

  // Cập nhật khuyến mãi
  updateDiscount: async (id: number, discount: Partial<NewDiscount>): Promise<{ data: TDiscount }> => {
    const response = await axiosInstance.put(`${CONFIG_API.DISCOUNT.INDEX}/update-discount/${id}`, discount)

    return response.data
  },

  // Xóa khuyến mãi
  deleteDiscount: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`${CONFIG_API.DISCOUNT.INDEX}/delete-discount/${id}`)

    return response.data
  }

  // Lấy khuyến mãi theo code
}

export const getDiscountByCode = async (code: string) => {
  try {
    const res = await axiosInstance.get(`${CONFIG_API.DISCOUNT.INDEX}/get-discount/${code}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getDiscounts = async () => {
  try {
    const res = await axios.get(`${CONFIG_API.DISCOUNT.INDEX}/get-discounts`)

    return res.data
  } catch (error) {
    return error
  }
}

// ===================== V1 endpoints (standard REST) =====================
// These functions align with endpoints provided by the backend examples
// POST   /v1/discounts
// GET    /v1/discounts (with optional page, limit)
// GET    /v1/discounts/{id}
// PUT    /v1/discounts/{id}
// DELETE /v1/discounts/{id}

export type TV1Discount = {
  id: string
  code: string
  name: string
  description: string | null
  min_order_value: number
  max_discount_amount: number | null
  discount_type: string // "0" | "1" according to backend
  discount_value: number
  effective_date: string // yyyyMMddHHmmss
  valid_until: string // yyyyMMddHHmmss
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  del_flag?: string
}

export type TV1CreateDiscountReq = {
  code: string
  name: string
  description: string
  min_order_value: number
  discount_type: string
  discount_value: number
  effective_date: string
  valid_until: string
  max_discount_amount?: number | null
}

export type TV1ListResponse = {
  discounts: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    items: TV1Discount[]
  }
}

export const v1CreateDiscount = async (data: TV1CreateDiscountReq): Promise<{ discount: TV1Discount }> => {
  const res = await axiosInstance.post(`${CONFIG_API.DISCOUNT.INDEX}`, data, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data
}

export const v1GetDiscounts = async (params?: { page?: number; limit?: number }): Promise<TV1ListResponse> => {
  const res = await axiosInstance.get(`${CONFIG_API.DISCOUNT.INDEX}`, { params })
  return res.data
}

export const v1GetDiscountById = async (id: string): Promise<{ discount: TV1Discount }> => {
  const res = await axiosInstance.get(`${CONFIG_API.DISCOUNT.INDEX}/${id}`)
  return res.data
}

export const v1UpdateDiscount = async (
  id: string,
  data: Omit<TV1CreateDiscountReq, 'code'>
): Promise<{ success: boolean }> => {
  const res = await axiosInstance.put(`${CONFIG_API.DISCOUNT.INDEX}/${id}`, data, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data
}

export const v1DeleteDiscount = async (id: string): Promise<{ success: boolean }> => {
  const res = await axiosInstance.delete(`${CONFIG_API.DISCOUNT.INDEX}/${id}`)
  return res.data
}
