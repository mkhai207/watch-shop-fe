import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import { TCategory, TCreateCategory, TUpdateCategory } from 'src/types/category/manage'

// This service targets the v1 categorys endpoints (backend spelling) similar to Brand

export const getCategorys = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.CATEGORY_V1.INDEX}`)
    return res.data
  } catch (error) {
    return error
  }
}

export const createCategory = async (data: TCreateCategory) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.CATEGORY_V1.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const updateCategory = async (id: string, data: TUpdateCategory) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.CATEGORY_V1.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteCategory = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.CATEGORY_V1.INDEX}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getCategoryById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.CATEGORY_V1.INDEX}/${id}`)
    return res.data
  } catch (error) {
    return error
  }
}
