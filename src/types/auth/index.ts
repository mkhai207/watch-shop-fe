export type TLoginAuth = {
  userName: string
  password: string
}

export type TRegisterAuth = {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  phone_number: string
  gender: string
  date_of_birth: string
  address: string
  role_id: number
  age_group: string
  gender_preference: string
  price_range_preference: string
  brand_preferences: string[]
  category_preferences: string[]
  style_preferences: string[]
}

export type TPermission = {
  id: number
  name: string
  api_path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  module: string
}

export type TUserRole = {
  id: number
  name: string
}

export type TUser = {
  id: number
  code: string
  username: string
  email: string
  phone_number: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
  address: string
  status: string
  age_group: string
  gender_preference: string
  price_range_preference: string
  brand_preferences: string[]
  category_preferences: string[]
  style_preferences: string[]
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
  role: TUserRole
  permissions?: TPermission[]
}

export type TGetUsersResponse = {
  status: string
  statusCode: number
  message: string
  data: TUser[]
}
