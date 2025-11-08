import { createAsyncThunk } from '@reduxjs/toolkit'
import { reviewService } from 'src/services/review'
import { TReview, NewReview, ReviewFilter } from 'src/types/review'

export const serviceName = 'review'

// Get all reviews
export const getReviewsAsync = createAsyncThunk(`${serviceName}/getReviews`, async (filter?: ReviewFilter) => {
  try {
    const response = await reviewService.getReviews(filter)
    return {
      status: 'success',
      data: Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [],
      message: 'Lấy danh sách đánh giá thành công',
      error: ''
    }
  } catch (error: any) {
    return {
      status: 'error',
      data: [],
      message: '',
      error: error.response?.data?.message || 'Lỗi khi lấy danh sách đánh giá'
    }
  }
})

// Get review by ID
export const getReviewByIdAsync = createAsyncThunk(`${serviceName}/getReviewById`, async (id: number) => {
  try {
    const response = await reviewService.getReviewById(id)
    return {
      status: 'success',
      data: response.data || response,
      message: 'Lấy thông tin đánh giá thành công',
      error: ''
    }
  } catch (error: any) {
    return {
      status: 'error',
      data: null,
      message: '',
      error: error.response?.data?.message || 'Lỗi khi lấy thông tin đánh giá'
    }
  }
})

// Create new review
export const createReviewAsync = createAsyncThunk(`${serviceName}/createReview`, async (review: NewReview) => {
  try {
    const response = await reviewService.createReview(review)
    return {
      status: 'success',
      data: response.data || response,
      message: 'Tạo đánh giá thành công',
      error: ''
    }
  } catch (error: any) {
    return {
      status: 'error',
      data: null,
      message: '',
      error: error.response?.data?.message || 'Lỗi khi tạo đánh giá'
    }
  }
})

// Update review
export const updateReviewAsync = createAsyncThunk(
  `${serviceName}/updateReview`,
  async ({ id, review }: { id: number; review: Partial<TReview> }) => {
    try {
      const response = await reviewService.updateReview(id, review)
      return {
        status: 'success',
        data: response.data || response,
        message: 'Cập nhật đánh giá thành công',
        error: ''
      }
    } catch (error: any) {
      return {
        status: 'error',
        data: null,
        message: '',
        error: error.response?.data?.message || 'Lỗi khi cập nhật đánh giá'
      }
    }
  }
)

// Delete review
export const deleteReviewAsync = createAsyncThunk(`${serviceName}/deleteReview`, async (id: number) => {
  try {
    const response = await reviewService.deleteReview(String(id))
    return {
      status: 'success',
      data: { id },
      message: 'Xóa đánh giá thành công',
      error: ''
    }
  } catch (error: any) {
    return {
      status: 'error',
      data: null,
      message: '',
      error: error.response?.data?.message || 'Lỗi khi xóa đánh giá'
    }
  }
})

// Get reviews by product
export const getReviewsByProductAsync = createAsyncThunk(
  `${serviceName}/getReviewsByProduct`,
  async ({ productId, filter }: { productId: number; filter?: ReviewFilter }) => {
    try {
      const response = await reviewService.getReviewsByProduct(productId, filter)
      return {
        status: 'success',
        data: response.data || response,
        message: 'Lấy đánh giá sản phẩm thành công',
        error: ''
      }
    } catch (error: any) {
      return {
        status: 'error',
        data: [],
        message: '',
        error: error.response?.data?.message || 'Lỗi khi lấy đánh giá sản phẩm'
      }
    }
  }
)

// Get reviews by user
export const getReviewsByUserAsync = createAsyncThunk(
  `${serviceName}/getReviewsByUser`,
  async ({ userId, filter }: { userId: number; filter?: ReviewFilter }) => {
    try {
      const response = await reviewService.getReviewsByUser(userId, filter)
      return {
        status: 'success',
        data: response.data || response,
        message: 'Lấy đánh giá người dùng thành công',
        error: ''
      }
    } catch (error: any) {
      return {
        status: 'error',
        data: [],
        message: '',
        error: error.response?.data?.message || 'Lỗi khi lấy đánh giá người dùng'
      }
    }
  }
)
