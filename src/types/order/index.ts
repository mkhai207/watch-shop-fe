type TOrderDetail = {
  quantity: number
  product_variant_id: string
}

export type TCreateOrderForm = {
  paymentMethod: string
  shipping_address: string
  name: string
  phone: string
}

export type TCreateOrder = {
  status?: string
  paymentMethod: string
  orderDetails: TOrderDetail[]
  shipping_address: string
  name: string
  phone: string
  discount_code?: string
}

export type TCreateOrderSystem = {
  status?: string
  paymentMethod: string
  orderDetails: TOrderDetail[]
  shipping_address: string
  name: string
  phone: string
  user: number
  discount_code?: string
}

export type TParams = {}

// export type TOrder = {
//   id: number
//   created_at: string
//   created_by: string
//   updated_at: string
//   updated_by: string
//   name: string
//   payment_method: string
//   phone: string
//   shipping_address: string
//   status: string
//   total_money: number
//   discount_id: number
//   user_id: number
// }

export interface Order {
  id: string
  code: string
  user_id: string
  total_amount: number
  discount_code?: string
  discount_amount: number
  final_amount: number
  current_status_id: string
  payment_method?: string
  shipping_address: string
  shipping_fee: number
  note?: string
  guess_name: string
  guess_email: string
  guess_phone: string
  review_flag: string
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
  del_flag: string
}

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
  updated_at?: string
  updated_by?: string
  del_flag: string
}

export interface OrderStatusesResponse {
  orderStatuses: {
    count: number
    rows: OrderStatus[]
  }
}
