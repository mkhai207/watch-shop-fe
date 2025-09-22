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

export type TOrder = {
  id: number
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  name: string
  payment_method: string
  phone: string
  shipping_address: string
  status: string
  total_money: number
  discount_id: number
  user_id: number
}
