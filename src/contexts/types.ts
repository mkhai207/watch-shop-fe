export type ErrCallbackType = (err: any) => void

export type LoginParams = {
  userName: string
  password: string
  rememberMe?: boolean
}

export type Permission = {
  id: number
  name: string
  api_path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  module: string
}

export type UserDataType = {
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
  role_id: number
  role: {
    id: number
    name: string
    code: string
    permissions?: Permission[]
  }
  avatar?: string | null
}

export type CreateUserType = {
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

export type UpdateUserType = {
  first_name: string
  last_name: string
  phone_number: string
  gender: string
  date_of_birth: string
  address: string
  status: string
  role_id: number
  age_group: string
  gender_preference: string
  price_range_preference: string
  brand_preferences: string[]
  category_preferences: string[]
  style_preferences: string[]
}

export type GetUserResponse = {
  user: UserDataType
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
