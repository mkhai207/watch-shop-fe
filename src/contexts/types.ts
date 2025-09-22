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
  created_at: string
  role_id: number
  role: {
    id: string
    name: string
    code: string
  }
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
