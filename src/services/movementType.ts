import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateMovementType, TUpdateMovementType } from 'src/types/movementType'
import axios from 'axios'

export const getMovementTypes = async () => {
  try {
    const res = await axios.get(`${CONFIG_API.MOVEMENT_TYPE.INDEX}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const createMovementType = async (data: TCreateMovementType) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.MOVEMENT_TYPE.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const updateMovementType = async (id: string, data: TUpdateMovementType) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.MOVEMENT_TYPE.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteMovementType = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.MOVEMENT_TYPE.INDEX}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getMovementTypeById = async (id: string) => {
  try {
    const res = await axios.get(`${CONFIG_API.MOVEMENT_TYPE.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}
