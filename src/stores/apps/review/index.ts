// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'
import { TReview } from 'src/types/review'
import {
  getReviewsAsync,
  getReviewByIdAsync,
  createReviewAsync,
  updateReviewAsync,
  deleteReviewAsync,
  getReviewsByProductAsync,
  getReviewsByUserAsync,
  serviceName
} from './action'

interface ReviewState {
  reviews: TReview[]
  currentReview: TReview | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  message: string
  error: string
}

const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  error: ''
}

export const reviewSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetReview: state => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
      state.error = ''
    },
    clearCurrentReview: state => {
      state.currentReview = null
    }
  },
  extraReducers: builder => {
    // ** Get all reviews
    builder
      .addCase(getReviewsAsync.pending, state => {
        state.reviews = []
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(getReviewsAsync.fulfilled, (state, action) => {
        state.reviews = Array.isArray(action.payload?.data) ? action.payload.data : []
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message || ''
        state.error = ''
      })
      .addCase(getReviewsAsync.rejected, (state, action) => {
        state.reviews = []
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi lấy danh sách đánh giá'
      })

    // ** Get review by ID
    builder
      .addCase(getReviewByIdAsync.pending, state => {
        state.currentReview = null
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(getReviewByIdAsync.fulfilled, (state, action) => {
        state.currentReview = action.payload?.data || null
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
        state.error = action.payload?.error
      })
      .addCase(getReviewByIdAsync.rejected, (state, action) => {
        state.currentReview = null
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi lấy thông tin đánh giá'
      })

    // ** Create review
    builder
      .addCase(createReviewAsync.pending, state => {
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(createReviewAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
        state.error = action.payload?.error
        if (action.payload.status === 'success' && action.payload.data) {
          state.reviews.unshift(action.payload.data)
        }
      })
      .addCase(createReviewAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi tạo đánh giá'
      })

    // ** Update review
    builder
      .addCase(updateReviewAsync.pending, state => {
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(updateReviewAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
        state.error = action.payload?.error
        if (action.payload.status === 'success' && action.payload.data) {
          const index = state.reviews.findIndex(review => review.id === action.payload.data.id)
          if (index !== -1) {
            state.reviews[index] = action.payload.data
          }
          if (state.currentReview?.id === action.payload.data.id) {
            state.currentReview = action.payload.data
          }
        }
      })
      .addCase(updateReviewAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi cập nhật đánh giá'
      })

    // ** Delete review
    builder
      .addCase(deleteReviewAsync.pending, state => {
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(deleteReviewAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
        state.error = ''
        if (action.payload.status === 'success' && action.payload.data?.id) {
          const idToRemove = String(action.payload.data.id)
          state.reviews = state.reviews.filter(review => review.id !== idToRemove)
          if (state.currentReview?.id === idToRemove) {
            state.currentReview = null
          }
        }
      })
      .addCase(deleteReviewAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi xóa đánh giá'
      })



    // ** Get reviews by product
    builder
      .addCase(getReviewsByProductAsync.pending, state => {
        state.reviews = []
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(getReviewsByProductAsync.fulfilled, (state, action) => {
        state.reviews = action.payload?.data || []
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
        state.error = action.payload?.error
      })
      .addCase(getReviewsByProductAsync.rejected, (state, action) => {
        state.reviews = []
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi lấy đánh giá sản phẩm'
      })

    // ** Get reviews by user
    builder
      .addCase(getReviewsByUserAsync.pending, state => {
        state.reviews = []
        state.isLoading = true
        state.isSuccess = false
        state.isError = false
        state.message = ''
        state.error = ''
      })
      .addCase(getReviewsByUserAsync.fulfilled, (state, action) => {
        state.reviews = action.payload?.data || []
        state.isLoading = false
        state.isSuccess = action.payload.status === 'success'
        state.isError = action.payload.status !== 'success'
        state.message = action.payload?.message
        state.error = action.payload?.error
      })
      .addCase(getReviewsByUserAsync.rejected, (state, action) => {
        state.reviews = []
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = ''
        state.error = action.error.message || 'Lỗi khi lấy đánh giá người dùng'
      })
  }
})

export const { resetReview, clearCurrentReview } = reviewSlice.actions
export default reviewSlice.reducer 