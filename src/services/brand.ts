import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateBrand, TUpdateBrand } from 'src/types/brand'

export const getBrands = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.BRAND.INDEX}/get-brands`)

    return res.data
  } catch (error) {
    return error
  }
}

export const createBrand = async (data: TCreateBrand) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.BRAND.INDEX}/create-brand`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const updateBrand = async (id: string, data: TUpdateBrand) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.BRAND.INDEX}/update/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteBrand = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.BRAND.INDEX}/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return res.data
  } catch (error) {
    return error
  }
}
