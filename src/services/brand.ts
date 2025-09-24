import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateBrand, TUpdateBrand } from 'src/types/brand'

export const getBrands = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.BRAND.INDEX}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const createBrand = async (data: TCreateBrand) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.BRAND.INDEX}`, data, {
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
    const res = await instanceAxios.put(`${CONFIG_API.BRAND.INDEX}/${id}`, data, {
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
    const res = await instanceAxios.delete(`${CONFIG_API.BRAND.INDEX}/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getBrandById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.BRAND.INDEX}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
