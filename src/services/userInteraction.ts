import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'

export const createUserInteraction = async (data: { product_id: string; interaction_type: number }) => {
  try {
    const res = await instanceAxios.post(`${CONFIG_API.USER_INTERACTION.INDEX}/create`, data)

    return res.data
  } catch (error) {
    return error
  }
}
