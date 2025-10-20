export type TParamsGetReportDashboard = {
  startDate?: string
  endDate?: string
}

export interface RecentOrder {
  id: string
  code: string
  user_id: string
  total_amount: number
  discount_code: string | null
  discount_amount: number
  final_amount: number
  current_status_id: string
  payment_method: string
  shipping_address: string
  shipping_fee: number
  note: string | null
  guess_name: string
  guess_email: string
  guess_phone: string
  review_flag: string
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  del_flag: string
}

export interface DashboardData {
  totalRevenue: number
  countOrder: number
  countWatch: number
  countUser: number
  countBrand: number
  countCategory: number
  countDiscount: number
  countReview: number
  topWatches: TopWatch[]
  orderRecently: RecentOrder[]
}

export interface TopWatch {
  id: string
  code: string
  name: string
  description: string
  model: string
  case_material: string
  case_size: number
  strap_size: number
  gender: string
  water_resistance: string
  release_date: string
  sold: number
  base_price: number
  rating: number
  status: boolean
  thumbnail: string
  slider: string
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  del_flag: string
  category_id: string
  brand_id: string
  movement_type_id: string
}
