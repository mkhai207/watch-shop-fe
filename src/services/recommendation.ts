import axios from 'axios'
import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'

type InteractionType = 'view' | 'cart_add' | 'purchase'

export type CreateInteractionPayload = {
  user_id: number
  watch_id: number
  interaction_type: InteractionType
  session_id?: string
}

export const createRecommendationInteraction = async (data: CreateInteractionPayload) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.RECOMMENDATIONS.INDEX}/interactions`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getRecommendationsByUser = async (
  userId: number,
  params?: { type?: 'hybrid' | 'content' | 'collab'; limit?: number }
) => {
  try {
    const query = new URLSearchParams()
    if (params?.type) query.set('type', params.type)
    if (params?.limit) query.set('limit', String(params.limit))
    const url = `${CONFIG_API.RECOMMENDATIONS.INDEX}/recommendations/${userId}${query.toString() ? `?${query.toString()}` : ''}`
    const res = await instanceAxios.get(url)

    return res.data
  } catch (error) {
    return error
  }
}

// New functions for the recommendation API endpoints
export const getPublicRecommendations = async (params?: { limit?: number }) => {
  try {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    const url = `${CONFIG_API.RECOMMENDATIONS.INDEX}/public${query.toString() ? `?${query.toString()}` : ''}`
    const res = await axios.get(url)

    return res.data
  } catch (error) {
    return error
  }
}

export const getPersonalizedRecommendations = async (params?: { limit?: number }) => {
  try {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    const url = `${CONFIG_API.RECOMMENDATIONS.INDEX}${query.toString() ? `?${query.toString()}` : ''}`
    const res = await instanceAxios.get(url)

    return res.data
  } catch (error) {
    return error
  }
}
