// /* eslint-disable @typescript-eslint/no-unused-vars */
// // ** React Imports
// import { ReactNode } from 'react'

// // ** Types
// import { buildAbilityFor, type ACLObj, type AppAbility } from 'src/configs/acl'
// import { AbilityContext } from '../acl/Can'
// import { useRouter } from 'next/router'
// import { useAuth } from 'src/hooks/useAuth'
// import BlankLayout from 'src/views/layouts/BlankLayout'
// import NotAuthorized from 'src/pages/401'

// interface AclGuardProps {
//   children: ReactNode
//   authGuard?: boolean
//   guestGuard?: boolean
//   aclAbilities: ACLObj
// }

// const AclGuard = (props: AclGuardProps) => {
//   // ** Props
//   const { aclAbilities, children, guestGuard = false, authGuard = true } = props

//   const auth = useAuth()
//   const permissionUser = auth.user?.role.permissions ?? []
//   const router = useRouter()

//   let ability: AppAbility

//   if (auth.user && !ability) {
//     ability = buildAbilityFor(permissionUser, aclAbilities.subject)
//   }

//   // if guest guard or no guard is tru or any error page
//   if (guestGuard || router.route === '/500' || router.route === '/404' || !authGuard) {
//     if (auth.user && ability) {
//       return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
//     } else {
//       return children
//     }
//   }

//   if (ability && auth.user && ability.can(aclAbilities.action, aclAbilities.subject)) {
//     return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
//   }

//   return (
//     <BlankLayout>
//       <NotAuthorized />
//     </BlankLayout>
//   )
// }

// export default AclGuard

// ------------------------------------------------------------------phân quyền theo role-----------------------------------------------------------

// import { ReactNode } from 'react'
// import { useRouter } from 'next/router'
// import { useAuth } from 'src/hooks/useAuth'
// import BlankLayout from 'src/views/layouts/BlankLayout'
// import NotAuthorized from 'src/pages/401'
// import { buildAbilityFor, type ACLObj, type AppAbility } from 'src/configs/acl'
// import { AbilityContext } from '../acl/Can'

// interface AclGuardProps {
//   children: ReactNode
//   authGuard?: boolean
//   guestGuard?: boolean
//   aclAbilities: ACLObj
// }

// const AclGuard = (props: AclGuardProps) => {
//   const { aclAbilities, children, guestGuard = false, authGuard = true } = props
//   const auth = useAuth()
//   const router = useRouter()

//   // Lấy role.code từ user
//   const roleCode = auth.user?.role?.code ?? ''
//   let ability: AppAbility

//   // Tạo ability dựa trên role.code
//   if (auth.user && !ability) {
//     ability = buildAbilityFor(roleCode)
//   }

//   // Nếu là guestGuard, hoặc trang lỗi (404, 500), hoặc không yêu cầu authGuard
//   if (guestGuard || router.route === '/500' || router.route === '/404' || !authGuard) {
//     if (auth.user && ability) {
//       return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
//     }

//     return children
//   }

//   // Kiểm tra quyền dựa trên role.code và aclAbilities.roles
//   if (ability && auth.user && aclAbilities.roles.includes(roleCode)) {
//     return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
//   }

//   return (
//     <BlankLayout>
//       <NotAuthorized />
//     </BlankLayout>
//   )
// }

// export default AclGuard

// -------------------------------------------------------------- phân quyền theo api-----------------------------------------------------------

import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { buildAbilityFor, type ACLObj, type AppAbility } from 'src/configs/acl'
import { useAuth } from 'src/hooks/useAuth'
import NotAuthorized from 'src/pages/401'
import BlankLayout from 'src/views/layouts/BlankLayout'
import { AbilityContext } from '../acl/Can'

interface AclGuardProps {
  children: ReactNode
  authGuard?: boolean
  guestGuard?: boolean
  aclAbilities: ACLObj
}

const AclGuard = (props: AclGuardProps) => {
  const { aclAbilities, children, guestGuard = false, authGuard = true } = props
  const auth = useAuth()
  const router = useRouter()

  // Lấy thông tin user và permissions
  const user = auth.user
  const roleCode = user?.role?.code ?? ''
  const permissions = user?.role?.permissions ?? []
  let ability: AppAbility

  // Tạo ability dựa trên permissions thực tế từ backend
  if (user && !ability) {
    ability = buildAbilityFor(roleCode, permissions)
  }

  // Nếu là guestGuard, hoặc trang lỗi (404, 500), hoặc không yêu cầu authGuard
  if (guestGuard || router.route === '/500' || router.route === '/404' || !authGuard) {
    if (user && ability) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    }

    return children
  }

  // Kiểm tra quyền truy cập
  if (ability && user) {
    // Kiểm tra theo role (backward compatibility)
    const hasRoleAccess = aclAbilities.roles.includes(roleCode)

    // Kiểm tra theo permissions cụ thể
    const hasPermissionAccess = aclAbilities.requiredPermissions
      ? aclAbilities.requiredPermissions.some(reqPermission =>
          permissions.some(
            userPermission =>
              userPermission.api_path === reqPermission.api_path && userPermission.method === reqPermission.method
          )
        )
      : true // Nếu không có requiredPermissions thì chỉ check role

    // Cho phép truy cập nếu có quyền theo role HOẶC theo permissions
    if (hasRoleAccess || hasPermissionAccess) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    }
  }

  return (
    <BlankLayout>
      <NotAuthorized />
    </BlankLayout>
  )
}

export default AclGuard
