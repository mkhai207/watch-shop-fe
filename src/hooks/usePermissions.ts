import { useContext } from 'react'
import { useAuth } from './useAuth'
import { AbilityContext } from 'src/components/acl/Can'
import { TPermission } from 'src/types/auth'

export const usePermissions = () => {
  const { user } = useAuth()
  const ability = useContext(AbilityContext)
  const permissions = user?.permissions ?? []

  // Kiểm tra quyền cụ thể theo API path và method
  const hasPermission = (apiPath: string, method: string): boolean => {
    return permissions.some(
      (permission: TPermission) =>
        permission.api_path === apiPath && permission.method.toLowerCase() === method.toLowerCase()
    )
  }

  // Kiểm tra quyền theo module
  const hasModuleAccess = (module: string): boolean => {
    return permissions.some((permission: TPermission) => permission.module === module)
  }

  // Kiểm tra quyền theo CASL ability
  const canAccess = (action: string, subject: string): boolean => {
    return ability?.can(action, subject) ?? false
  }

  // Kiểm tra có phải admin không
  const isAdmin = (): boolean => {
    return user?.role?.code === 'ADMIN'
  }

  // Lấy danh sách permissions theo module
  const getPermissionsByModule = (module: string): TPermission[] => {
    return permissions.filter((permission: TPermission) => permission.module === module)
  }

  return {
    permissions,
    hasPermission,
    hasModuleAccess,
    canAccess,
    isAdmin,
    getPermissionsByModule
  }
}
