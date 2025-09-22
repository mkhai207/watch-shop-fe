export interface TUser {
  id: string
  full_name: string
  email: string
  avatar: string | null
}

export interface TReview {
  id: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  rating: number
  comment: string
  images: string | null
  user_id: string
  product_id: string
  order_id: string | null
  user: TUser
}

export interface NewReview {
  rating: number
  comment: string
  product_id: string
  images?: string
  order_id?: number
}

export interface ReviewFilter {
  search?: string
  rating?: number
  user_id?: number
  product_id?: string
  page?: number
  limit?: number
}

export interface ReviewResponse {
  status: string
  statusCode: number
  message: string
  data?: TReview[]
  error: any
  meta?: {
    totalItems: number
    totalPages: number
    currentPage: number
    limit: number
  }
}

export interface TReviewResponse {
  status: string
  message: string
  error: string | null
  data: TReview[]
}
