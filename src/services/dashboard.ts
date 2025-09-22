import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'

export const getRevenueFromTo = async (from: string, to: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.DASHBOARD.INDEX}/revenue-from-to`, {
      params: { from, to }
    })

    return res.data
  } catch (error) {
    return error
  }
}

export const getDailyRevenue = async (from: string, to: string) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.DASHBOARD.INDEX}/get-daily-revenue`, {
      params: { from, to }
    })

    return res.data
  } catch (error) {
    return error
  }
}
