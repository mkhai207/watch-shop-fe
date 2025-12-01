import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateColor, TUpdateColor } from 'src/types/color'
import axios from 'axios'

export const getColors = async (queryParams?: Record<string, any>) => {
  try {
    const url = CONFIG_API.COLOR.INDEX
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

export const createColor = async (data: TCreateColor) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.COLOR.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const updateColor = async (id: string, data: TUpdateColor) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.COLOR.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteColor = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.COLOR.INDEX}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getColorById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.COLOR.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}
