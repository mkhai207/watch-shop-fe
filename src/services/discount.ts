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
