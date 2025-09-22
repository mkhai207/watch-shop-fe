export interface TCategory {
  id: number
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  code: string
  name: string
}

export interface CategoryResponse {
  status: string
  statusCode: number
  message: string
  data: TCategory[]
  error: null | string
  meta: {
    totalItems: number
    totalPages: number
    currentPage: number
    limit: number
  }
} 