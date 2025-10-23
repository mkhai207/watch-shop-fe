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
        first_name?: string
        last_name?: string
        phone_number?: string
        gender?: string
        date_of_birth?: string
        address?: string
        status?: string
        role_id?: number
        age_group?: string
        gender_preference?: string
        price_range_preference?: string
        brand_preferences?: string[]
        category_preferences?: string[]
        style_preferences?: string[]
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
