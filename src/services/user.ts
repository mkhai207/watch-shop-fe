import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import qs from 'qs'

export const getUserByEmail = async (params: { email: string }) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.USER.INDEX}/get-users`, {
      params,
      paramsSerializer: params => qs.stringify(params, { encode: false })
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getUsers = async (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  gender?: string
}) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.USER.INDEX}`, {
      params,
      paramsSerializer: params => qs.stringify(params, { encode: false })
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getUserById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.USER.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const createUser = async (data: any) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.USER.INDEX}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateUser = async (id: string, data: any) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.USER.INDEX}/${id}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteUser = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.USER.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}
