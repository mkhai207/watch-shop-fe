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

// Types for VN Public APIs
export interface Province {
  code: string
  name: string
  name_with_type: string
  slug: string
  type: string
}

export interface District {
  code: string
  name: string
  name_with_type: string
  slug: string
  type: string
  province_code: string
}

export interface Ward {
  code: string
  name: string
  name_with_type: string
  slug: string
  type: string
  district_code: string
}

// Extended address form data with codes for cascading selects
export interface AddressFormDataWithCodes {
  recipient_name: string
  phone_number: string
  street: string
  ward: string
  wardCode?: string
  district: string
  districtCode?: string
  city: string
  provinceCode?: string
  is_default: boolean
}