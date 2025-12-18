import { axiosInstance } from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TDiscount, DiscountResponse, NewDiscount } from 'src/types/discount'
import axios from 'axios'

export const discountService = {
  getDiscounts: async (): Promise<DiscountResponse> => {
    const response = await axios.get(CONFIG_API.DISCOUNT.GET_DISCOUNTS)

    return response.data
  },

  getDiscountById: async (id: number): Promise<{ data: TDiscount }> => {
    const response = await axiosInstance.get(`${CONFIG_API.DISCOUNT.INDEX}/${id}`)

    return response.data
  },

  createDiscount: async (discount: NewDiscount): Promise<{ data: TDiscount }> => {
    const response = await axiosInstance.post(CONFIG_API.DISCOUNT.CREATE_DISCOUNT, discount)

    return response.data
  },

  updateDiscount: async (id: number, discount: Partial<NewDiscount>): Promise<{ data: TDiscount }> => {
    const response = await axiosInstance.put(`${CONFIG_API.DISCOUNT.INDEX}/update-discount/${id}`, discount)

    return response.data
  },

  deleteDiscount: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`${CONFIG_API.DISCOUNT.INDEX}/delete-discount/${id}`)

    return response.data
  }
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
  try {
    console.log('Creating discount with data:', data)
    const res = await axiosInstance.post(`${CONFIG_API.DISCOUNT.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('Create discount response:', res.data)
    return res.data
  } catch (error: any) {
    console.error('Error creating discount:', error)
    console.error('Error response:', error?.response?.data)
    throw error
  }
}

export const v1GetDiscounts = async (queryParams?: Record<string, any>): Promise<TV1ListResponse> => {
  const url = CONFIG_API.DISCOUNT.INDEX
  let finalUrl = url

  if (queryParams) {
    const params = new URLSearchParams()
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value))
      }
    })
    if (params.toString()) {
      finalUrl = `${url}?${params.toString()}`
    }
  }

  const res = await axios.get(finalUrl)

  return res.data
}

export const v1GetDiscountById = async (id: string): Promise<{ discount: TV1Discount }> => {
  const res = await axios.get(`${CONFIG_API.DISCOUNT.INDEX}/${id}`)

  return res.data
}

export const v1UpdateDiscount = async (
  id: string,
  data: Omit<TV1CreateDiscountReq, 'code'>
): Promise<{ success: boolean }> => {
  try {
    console.log('Updating discount ID:', id)
    console.log('Update data:', data)
    const res = await axiosInstance.put(`${CONFIG_API.DISCOUNT.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    console.log('Update response:', res.data)

    return res.data
  } catch (error: any) {
    console.error('Error updating discount:', error)
    console.error('Error response data:', error?.response?.data)
    console.error('Error status:', error?.response?.status)
    throw error
  }
}

export const v1DeleteDiscount = async (id: string): Promise<{ success: boolean }> => {
  const res = await axiosInstance.delete(`${CONFIG_API.DISCOUNT.INDEX}/${id}`)

  return res.data
}
