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

// v1 endpoints (POST /v1/addresses)
export const createAddressV1 = async (data: any) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.ADDRESS.INDEX}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const listAddressesV1 = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.ADDRESS.INDEX}`)

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

// Update address default status using v1 endpoint
export const updateAddressDefaultStatus = async (id: number, isDefault: boolean) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.ADDRESS.INDEX}/${id}`, {
      is_default: isDefault ? '1' : '0'
    })

    return res.data
  } catch (error) {
    return error
  }
}

// Delete address using v1 endpoint
export const deleteAddressV1 = async (id: number) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.ADDRESS.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

// Update address using v1 endpoint
export const updateAddressV1 = async (id: number, data: any) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.ADDRESS.INDEX}/${id}`, {
      city: data.city,
      district: data.district,
      ward: data.ward,
      street: data.street,
      recipient_name: data.recipient_name,
      phone_number: data.phone_number,
      is_default: data.is_default ? '1' : '0'
    })

    return res.data
  } catch (error) {
    return error
  }
}
