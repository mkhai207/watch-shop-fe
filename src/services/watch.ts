import axios from 'axios'
import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import {
  CreateWatchResponse,
  CreateWatchVariant,
  CreateWatchVariantResponse,
  GetWatchResponse,
  GetWatchesResponse,
  TCreateWatch,
  TUpdateWatch
} from 'src/types/watch'

export const getWatches = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.WATCH.INDEX}`)

    return res.data as GetWatchesResponse
  } catch (error) {
    return error
  }
}

export const createWatch = async (data: TCreateWatch) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.WATCH.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data as CreateWatchResponse
  } catch (error) {
    return error
  }
}

export const getWatchById = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.WATCH.INDEX}/${id}`)

    return res.data as GetWatchResponse
  } catch (error) {
    return error
  }
}

export const updateWatch = async (id: string, data: TUpdateWatch) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.WATCH.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteWatch = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.WATCH.INDEX}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const createWatchVariant = async (data: CreateWatchVariant) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.WATCH_VARIANT.INDEX}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data as CreateWatchVariantResponse
  } catch (error) {
    return error
  }
}

export const getWatchVariants = async () => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.WATCH_VARIANT.INDEX}`)

    return res.data as { variants: { count: number; rows: any[] } }
  } catch (error) {
    return error
  }
}

export const updateWatchVariant = async (id: string, data: Partial<CreateWatchVariant>) => {
  try {
    const res = await instanceAxios.put(`${CONFIG_API.WATCH_VARIANT.INDEX}/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteWatchVariant = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${CONFIG_API.WATCH_VARIANT.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const search = async (data: { params: {}; paramsSerializer?: (params: any) => string }) => {
  try {
    const res = await axios.get(`${CONFIG_API.SEARCH.INDEX}`, {
      params: data.params,
      paramsSerializer: data.paramsSerializer
    })

    return res.data
  } catch (error) {
    return error
  }
}
