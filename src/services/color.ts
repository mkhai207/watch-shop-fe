import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateColor, TUpdateColor } from 'src/types/color'
import axios from 'axios'

export const getColors = async () => {
  try {
    const res = await axios.get(`${CONFIG_API.COLOR.INDEX}`)

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
