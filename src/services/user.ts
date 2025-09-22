import instanceAxios from 'src/helpers/axios'
import { CONFIG_API } from 'src/configs/api'
import qs from 'qs'

export const getUserByEmail = async (params: { email: string }) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.USER.INDEX}/get-users`, {
      params,
      paramsSerializer: params => qs.stringify(params, { encode: false })
    })

    return res.data
  } catch (error) {
    return error
  }
}
