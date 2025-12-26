import axios from 'axios'
import { BASE_URL, CONFIG_API } from 'src/configs/api'
import { clearLocalUserData, getLocalUserData, setAccessToken } from '../storage'
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

            // const newAccessToken = response.data.data.accessToken
            const newAccessToken = response.data.accessToken
            if (newAccessToken) {
              setAccessToken(newAccessToken)
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

// import axios, { AxiosError, AxiosRequestConfig } from 'axios'
// import { BASE_URL, CONFIG_API } from 'src/configs/api'
// import { clearLocalUserData, getLocalUserData, setAccessToken } from '../storage'
// import React, { FC, useEffect } from 'react'
// import { NextRouter, useRouter } from 'next/router'
// import { UserDataType } from 'src/contexts/types'
// import { useAuth } from 'src/hooks/useAuth'

// /* ==============================
//  * Axios instance
//  * ============================== */
// const axiosInstance = axios.create({
//   baseURL: BASE_URL
// })

// /* ==============================
//  * Global helpers
//  * ============================== */
// let globalRouter: NextRouter | null = null
// let globalSetUser: ((data: UserDataType | null) => void) | null = null

// const handleRedirectLogin = () => {
//   if (!globalRouter || !globalSetUser) return

//   const returnUrl = globalRouter.asPath !== '/' ? globalRouter.asPath : undefined

//   globalSetUser(null)
//   clearLocalUserData()

//   globalRouter.push({
//     pathname: '/login',
//     query: returnUrl ? { returnUrl } : undefined
//   })
// }

// /* ==============================
//  * Request interceptor
//  * ONLY attach access token
//  * ============================== */
// axiosInstance.interceptors.request.use(config => {
//   const { accessToken } = getLocalUserData()

//   if (accessToken) {
//     config.headers = config.headers || {}
//     config.headers.Authorization = `Bearer ${accessToken}`
//   }

//   return config
// })

// /* ==============================
//  * Refresh control
//  * ============================== */
// let isRefreshing = false
// let refreshSubscribers: ((token: string) => void)[] = []

// const subscribeTokenRefresh = (cb: (token: string) => void) => {
//   refreshSubscribers.push(cb)
// }

// const onRefreshed = (token: string) => {
//   refreshSubscribers.forEach(cb => cb(token))
//   refreshSubscribers = []
// }

// /* ==============================
//  * Response interceptor
//  * Handle 401 + refresh token
//  * ============================== */
// axiosInstance.interceptors.response.use(
//   response => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       const { refreshToken } = getLocalUserData()

//       if (!refreshToken) {
//         handleRedirectLogin()

//         return Promise.reject(error)
//       }

//       if (isRefreshing) {
//         return new Promise(resolve => {
//           subscribeTokenRefresh(token => {
//             originalRequest.headers = originalRequest.headers || {}
//             originalRequest.headers.Authorization = `Bearer ${token}`
//             resolve(axiosInstance(originalRequest))
//           })
//         })
//       }

//       originalRequest._retry = true
//       isRefreshing = true

//       try {
//         const response = await axios.post(
//           `${CONFIG_API.AUTH.INDEX}/refresh`,
//           null,
//           {
//             headers: {
//               Authorization: `Bearer ${refreshToken}`
//             }
//           }
//         )

//         const newAccessToken = response.data?.data?.accessToken

//         if (!newAccessToken) {
//           handleRedirectLogin()

//           return Promise.reject(error)
//         }

//         // save new access token
//         setAccessToken(newAccessToken)

//         onRefreshed(newAccessToken)

//         originalRequest.headers = originalRequest.headers || {}
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

//         return axiosInstance(originalRequest)
//       } catch (refreshError) {
//         handleRedirectLogin()

//         return Promise.reject(refreshError)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     return Promise.reject(error)
//   }
// )

// /* ==============================
//  * React wrapper
//  * ============================== */
// type TAxiosInterceptorProps = {
//   children: React.ReactNode
// }

// export const AxiosInterceptor: FC<TAxiosInterceptorProps> = ({ children }) => {
//   const router = useRouter()
//   const { setUser } = useAuth()

//   useEffect(() => {
//     globalRouter = router
//     globalSetUser = setUser
//   }, [router, setUser])

//   return <>{children}</>
// }

// export default axiosInstance
// export { axiosInstance }
