import { CONFIG_API } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TParamsGetReportDashboard } from 'src/types/report'

export const getReportDashboard = async (data: {
  params: TParamsGetReportDashboard
  paramsSerializer?: (params: any) => string
}) => {
  try {
    const res = await instanceAxios.get(`${CONFIG_API.REPORT.INDEX}/revenue`, {
      params: data.params,
      paramsSerializer: data.paramsSerializer
    })

    return res.data
  } catch (error) {
    return error
  }
}
