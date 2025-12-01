import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateBrand, TUpdateBrand } from 'src/types/brand'
import axios from 'axios'

export const getBrands = async (queryParams?: Record<string, any>) => {
  try {
    const url = CONFIG_API.BRAND.INDEX
    let finalUrl = url

    if (queryParams) {
      const params = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.set(key, String(value))
        }
      })
      if (params.toString()) {
        finalUrl = `${url}?${params.toString()}`
      }
    }

    const res = await axios.get(finalUrl)

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
    const res = await axios.get(`${CONFIG_API.BRAND.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}
