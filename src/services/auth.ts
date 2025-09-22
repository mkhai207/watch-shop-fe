import axios from 'axios'
import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TLoginAuth, TRegisterAuth, TGetUsersResponse } from 'src/types/auth'

export const loginAuth = async (data: TLoginAuth) => {
  const res = await axios.post(`${CONFIG_API.AUTH.INDEX}/login`, data)

  return res.data
}

export const registerAuth = async (data: TRegisterAuth) => {
  try {
    const res = await axios.post(`${CONFIG_API.AUTH.INDEX}/register`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateAuthMe = async (data: TRegisterAuth) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.AUTH.INDEX}/me`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getUsers = async (): Promise<TGetUsersResponse> => {
  try {
    const res = await instanceAxios.get(CONFIG_API.USER.GET_USERS)

    return res.data
  } catch (error) {
    throw error
  }
}

export const createUser = async (data: TRegisterAuth) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.AUTH.INDEX}/register`, data)

    return res.data
  } catch (error) {
    throw error
  }
}

export const updateUser = async (
  id: string,
  data: {
    fullname?: string
    phone?: string
    avatar?: string
    birthday?: string
    gender?: string
    active?: boolean
  }
) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.USER.INDEX}/update/${id}`, data)

    return res.data
  } catch (error) {
    throw error
  }
}

export const deleteUser = async (id: string) => {
  try {
    // Soft delete: chỉ update trạng thái active = false thay vì xóa vĩnh viễn
    const res = await instanceAxios.put(`${CONFIG_API.USER.INDEX}/update/${id}`, {
      active: false
    })

    return res.data
  } catch (error) {
    throw error
  }
}
