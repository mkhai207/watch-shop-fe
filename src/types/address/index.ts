export interface TAddress {
  id: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string | null
  city: string
  district: string
  is_default: boolean
  phone_number: string
  recipient_name: string
  street: string
  ward: string
  user_id: string
}

export interface TAddressResponse {
  status: string
  message: string
  error: null | string
  data: TAddress[]
}
