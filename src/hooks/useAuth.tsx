import { useContext, useCallback } from 'react'
import { AuthContext } from 'src/contexts/AuthContext'
import { getUsers, createUser, updateUser, deleteUser } from 'src/services/auth'
import { TGetUsersResponse, TRegisterAuth } from 'src/types/auth'

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const fetchUsers = useCallback(async (): Promise<TGetUsersResponse> => {
    return await getUsers()
  }, [])

  const createNewUser = useCallback(async (userData: TRegisterAuth) => {
    return await createUser(userData)
  }, [])

  const updateUserProfile = useCallback(
    async (
      id: string,
      userData: {
        fullname?: string
        phone?: string
        avatar?: string
        birthday?: string
        gender?: string
        active?: boolean
        role_id?: number
      }
    ) => {
      return await updateUser(id, userData)
    },
    []
  )

  const deleteUserProfile = useCallback(async (id: string) => {
    return await deleteUser(id)
  }, [])

  return {
    ...context,
    fetchUsers,
    createNewUser,
    updateUserProfile,
    deleteUserProfile
  }
}
