import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCreateStrapMaterial, TUpdateStrapMaterial } from 'src/types/strapMaterial'

export const getStrapMaterials = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.STRAP_MATERIAL.INDEX}`)
    return res.data
  } catch (error) {
    return error
  }
}

export const createStrapMaterial = async (data: TCreateStrapMaterial) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.STRAP_MATERIAL.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    return res.data
  } catch (error) {
    return error
  }
}

export const updateStrapMaterial = async (id: string, data: TUpdateStrapMaterial) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.STRAP_MATERIAL.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    return res.data
  } catch (error) {
    return error
  }
}

export const deleteStrapMaterial = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.STRAP_MATERIAL.INDEX}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    return res.data
  } catch (error) {
    return error
  }
}

export const getStrapMaterialById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.STRAP_MATERIAL.INDEX}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
