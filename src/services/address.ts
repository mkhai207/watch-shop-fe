import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'

export const createAddress = async (data: any) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.ADDRESS.INDEX}/create-address`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getAddressesByUserId = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ADDRESS.INDEX}/get-addresses-user`)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateAddressById = async (id: number, data: any) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.ADDRESS.INDEX}/update/${id}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteAddressById = async (id: number) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.ADDRESS.INDEX}/delete/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}
