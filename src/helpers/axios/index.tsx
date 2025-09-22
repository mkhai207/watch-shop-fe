import axios from 'axios'
import { BASE_URL, CONFIG_API } from 'src/configs/api'
import { clearLocalUserData, getLocalUserData } from '../storage'
import { jwtDecode } from 'jwt-decode'
import React, { FC } from 'react'
import { NextRouter, useRouter } from 'next/router'
import { UserDataType } from 'src/contexts/types'
import { useAuth } from 'src/hooks/useAuth'

const instanceAxios = axios.create({ baseURL: BASE_URL })

// Global variables to store router and setUser
let globalRouter: NextRouter | null = null
let globalSetUser: ((data: UserDataType | null) => void) | null = null

type TAxiosInteceptor = {
  children: React.ReactNode
}

const handleRedirectLogin = () => {
  if (!globalRouter || !globalSetUser) return

  if (globalRouter.asPath !== '/') {
    globalRouter.push({
      pathname: '/login',
      query: { returnUrl: globalRouter.asPath }
    })
  } else {
    globalRouter.push('/login')
  }
  globalSetUser(null)
  clearLocalUserData()
}

// Set up interceptor once
const requestInterceptor = instanceAxios.interceptors.request.use(async config => {
  const { accessToken, refreshToken } = getLocalUserData()
  if (accessToken) {
    const decodedAccessToken: any = jwtDecode(accessToken)

    if (decodedAccessToken.exp > Date.now() / 1000) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    } else {
      if (refreshToken) {
        const decodedRefreshToken: any = jwtDecode(refreshToken)

        if (decodedRefreshToken.exp > Date.now() / 1000) {
          // call api to refresh access token
          console.log('url', `${CONFIG_API.AUTH.INDEX}/auth/refresh`)
          try {
            const response = await axios.get(`${CONFIG_API.AUTH.INDEX}/refresh`, {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            })
            console.log('res', { response })
            const newAccessToken = response.data.data.accessToken
            if (newAccessToken) {
              config.headers['Authorization'] = `Bearer ${newAccessToken}`
            } else {
              handleRedirectLogin()
            }
          } catch (e) {
            console.log('error:', e)
            handleRedirectLogin()
          }
        } else {
          handleRedirectLogin()
        }
      } else {
        handleRedirectLogin()
      }
    }
  } else {
    handleRedirectLogin()

    return Promise.reject(new axios.Cancel('No access token'))
  }

  return config
})

const AxiosInterceptor: FC<TAxiosInteceptor> = ({ children }) => {
  const router = useRouter()
  const { setUser } = useAuth()

  // Update global variables
  React.useEffect(() => {
    globalRouter = router
    globalSetUser = setUser
  }, [router, setUser])

  return <>{children}</>
}

instanceAxios.interceptors.response.use(response => {
  return response
})

export default instanceAxios
export { AxiosInterceptor }
export const axiosInstance = instanceAxios
