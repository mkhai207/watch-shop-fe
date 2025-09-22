import React, { ReactNode } from 'react'
import { usePermissions } from 'src/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  apiPath?: string
  method?: string
  module?: string
  action?: string
  subject?: string
  fallback?: ReactNode
  adminOnly?: boolean
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  apiPath,
  method,
  module,
  action,
  subject,
  fallback = null,
  adminOnly = false
}) => {
  const { hasPermission, hasModuleAccess, canAccess, isAdmin } = usePermissions()

  if (adminOnly && !isAdmin()) {
    return <>{fallback}</>
  }

  if (isAdmin()) {
    return <>{children}</>
  }

  if (apiPath && method) {
    return hasPermission(apiPath, method) ? <>{children}</> : <>{fallback}</>
  }

  if (module) {
    return hasModuleAccess(module) ? <>{children}</> : <>{fallback}</>
  }

  if (action && subject) {
    return canAccess(action, subject) ? <>{children}</> : <>{fallback}</>
  }

  // Mặc định là ẩn nếu không có điều kiện nào
  return <>{fallback}</>
}

export default PermissionGuard
