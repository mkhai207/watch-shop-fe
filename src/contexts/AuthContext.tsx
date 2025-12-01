// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'
import { loginAuth } from 'src/services/auth'
import { CONFIG_API } from 'src/configs/api'
import { clearLocalUserData, setLocalUserData } from 'src/helpers/storage'
import instanceAxios from 'src/helpers/axios'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'src/stores'
import { getCartItemsAsync } from 'src/stores/apps/cart/action'
import getHomeRoute from 'src/components/acl/getHomeRoute'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  const dispatch: AppDispatch = useDispatch()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
      if (storedToken) {
        setLoading(true)
        await instanceAxios
          .get(CONFIG_API.AUTH.AUTH_ME)
          .then(async response => {
            setLoading(false)
            setUser({ ...response.data.user })

            // Load cart immediately when authenticated on app init
            dispatch(getCartItemsAsync())
          })
          .catch(() => {
            // Silent logout without forced redirect to login
            clearLocalUserData()
            setUser(null)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    loginAuth({ userName: params.userName, password: params.password })
      .then(async response => {
        params.rememberMe
          ? setLocalUserData(JSON.stringify(response.user), response.tokens.access.token, response.tokens.refresh.token)
          : null
        const returnUrl = router.query.returnUrl
        setUser({ ...response.user })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.user)) : null

        const homeRoute = getHomeRoute(response.user.role.code.toUpperCase() || '/')
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : homeRoute

        // Load cart right after successful login
        dispatch(getCartItemsAsync())

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    clearLocalUserData()
    router.push('/')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
