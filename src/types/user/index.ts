export interface IUser {
  id: string
  code?: string
  username: string
  email: string
  phone_number?: string
  first_name?: string
  last_name?: string
  age_group?: string
  gender_preference?: string
  price_range_preference?: string
  brand_preferences?: string
  category_preferences?: string
  style_preferences?: string
  gender?: string
  date_of_birth?: string
  address?: string
  status: string
  created_at: string
  created_by?: number
  updated_at?: string
  updated_by?: number
  del_flag?: string
  role_id: number
  'role.id'?: string
  'role.name'?: string
  fullName?: string // computed field
}

export interface IUserList {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  items: IUser[]
}

export interface IUserCreate {
  email: string
  userName: string
  password: string
  fistName: string // Note: keep typo as API expects it
  lastName: string
  roleId: number
}

export interface IUserUpdate {
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  role?: string
  status?: 0 | 1
  gender?: 'Male' | 'Female'
}

export interface IUserFilter {
  page?: number
  limit?: number
  search?: string
  status?: string
  gender?: string
}
