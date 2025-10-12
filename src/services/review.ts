import instanceAxios from 'src/helpers/axios'
import { TReview, NewReview, ReviewFilter, ReviewResponse } from 'src/types/review'
import { CONFIG_API } from 'src/configs/api'
import axios from 'axios'

export const reviewService = {
  // Lấy danh sách đánh giá
  getReviews: async (filter?: ReviewFilter): Promise<ReviewResponse> => {
    try {
      const response = await instanceAxios.get(`${CONFIG_API.REVIEW.INDEX}/get-reviews`, { params: filter })

      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // Lấy đánh giá theo ID
  getReviewById: async (id: number) => {
    const response = await instanceAxios.get(`/reviews/${id}`)

    return response.data
  },

  // Tạo đánh giá mới
  createReview: async (review: NewReview) => {
    console.log('🔄 Calling API createReview with data:', review)
    try {
      const response = await instanceAxios.post('/reviews/create-review', review)

      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // Cập nhật đánh giá
  updateReview: async (id: number, review: Partial<TReview>) => {
    const response = await instanceAxios.put(`/reviews/${id}`, review)

    return response.data
  },

  // Xóa đánh giá
  deleteReview: async (id: string) => {
    console.log('🔄 Calling API deleteReview with id:', id)
    console.log('🔗 Full API URL:', `${CONFIG_API.REVIEW.INDEX}/delete-review/${id}`)
    try {
      const response = await instanceAxios.delete(`${CONFIG_API.REVIEW.INDEX}/delete-review/${id}`)

      console.log('Delete review successful:', response.data)

      return response.data
    } catch (error) {
      console.error(error)
    }
  },

  // Lấy đánh giá theo sản phẩm
  getReviewsByProduct: async (productId: number, filter?: ReviewFilter) => {
    const response = await instanceAxios.get(`/products/${productId}/reviews`, { params: filter })

    return response.data
  },

  // Lấy đánh giá theo người dùng
  getReviewsByUser: async (userId: number, filter?: ReviewFilter) => {
    const response = await instanceAxios.get(`/users/${userId}/reviews`, { params: filter })

    return response.data
  }
}

// Các function riêng lẻ từ main
export const createReview = async (reviewData: any) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.REVIEW.INDEX}/create-review`, reviewData)

    return res.data
  } catch (error) {
    return error
  }
}

export const getReviewsByProductId = async (productId: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.REVIEW.INDEX}/get-reviews/${productId}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const fetchReviewsByProductId = async (query: any) => {
  try {
    const res = await axios.get(`${CONFIG_API.REVIEW.INDEX}/get-reviews`, query)

    return res.data
  } catch (error) {
    return error
  }
}

// New V1 endpoints per latest backend
export const createReviewV1 = async (data: {
  rating: number
  comment: string
  image_url?: string
  user_id: number | string
  order_id: number | string
}) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.REVIEW.INDEX}`, data)

    return res.data
  } catch (error) {
    return error as any
  }
}

export const getReviewsByWatchIdV1 = async (watchId: string | number, params?: { page?: number; limit?: number }) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.REVIEW.INDEX}/${watchId}`, { params })

    return res.data
  } catch (error) {
    return error as any
  }
}

export const deleteReviewV1 = async (reviewId: string | number) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.REVIEW.INDEX}/${reviewId}`)

    return res.data
  } catch (error) {
    return error as any
  }
}
