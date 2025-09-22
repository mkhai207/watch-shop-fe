import { AbilityBuilder, Ability } from '@casl/ability'

export type Subjects = string
export type Actions = 'access' | 'read' | 'create' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any

export type Permission = {
  id: number
  name: string
  api_path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  module: string
}

export type RequiredPermission = {
  api_path: string
  method: string
}

export type ACLObj = {
  action: Actions
  subject: string
  roles: string[] // Danh sách role được phép (backward compatibility)
  requiredPermissions?: RequiredPermission[] // Danh sách permissions cụ thể cần thiết
}

// Helper function để map HTTP method sang CASL action
const mapMethodToAction = (method: string): Actions => {
  switch (method.toLowerCase()) {
    case 'get':
      return 'read'
    case 'post':
      return 'create'
    case 'put':
    case 'patch':
      return 'update'
    case 'delete':
      return 'delete'
    default:
      return 'access'
  }
}

// Helper function để map module sang subject
const mapModuleToSubject = (module: string): string => {
  const moduleSubjectMap: Record<string, string> = {
    auth: 'Auth',
    users: 'User',
    categories: 'Category',
    brands: 'Brand',
    products: 'Product',
    sizes: 'Size',
    colors: 'Color',
    variants: 'ProductVariant',
    carts: 'Cart',
    orders: 'Order',
    payment: 'Payment',
    discounts: 'Discount',
    reviews: 'Review',
    upload: 'Upload',
    'user-interactions': 'UserInteraction',
    permissions: 'Permission'
  }

  return moduleSubjectMap[module] || module
}

const defineRulesFor = (role: string, permissions: Permission[] = []) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  if (role === 'ADMIN') {
    // Admin có quyền truy cập tất cả
    can('access', 'all')
    can(['read', 'create', 'update', 'delete'], 'all')
  } else if (permissions.length > 0) {
    // Tạo rules dựa trên permissions cụ thể từ backend
    permissions.forEach(permission => {
      const action = mapMethodToAction(permission.method)
      const subject = mapModuleToSubject(permission.module)

      // Grant permission for specific action and subject
      can(action, subject)

      // Also grant general access
      can('access', subject)
    })

    // Luôn cho phép truy cập các trang cơ bản
    can('access', ['Dashboard', 'Profile', 'Settings'])
  } else {
    // Fallback cho các role khác (Customer, Staff, etc.)
    // Chỉ cho phép truy cập các trang cơ bản
    can('access', ['Dashboard', 'Profile', 'Auth'])

    if (role === 'CUSTOMER') {
      can(['read', 'create', 'update'], ['Product', 'Cart', 'Order', 'Review'])
      can('read', ['Category', 'Brand'])
    } else if (role === 'STAFF') {
      can(['read', 'update'], ['Product', 'Order', 'User'])
      can('read', ['Category', 'Brand', 'Review'])
    }
  }

  return rules
}

export const buildAbilityFor = (role: string, permissions: Permission[] = []): AppAbility => {
  return new AppAbility(defineRulesFor(role, permissions), {
    detectSubjectType: (object: any) => object?.type || 'all'
  })
}

// Helper function để check permission cụ thể
export const hasPermission = (permissions: Permission[], apiPath: string, method: string): boolean => {
  return permissions.some(
    permission => permission.api_path === apiPath && permission.method.toLowerCase() === method.toLowerCase()
  )
}

// Helper function để check module access
export const hasModuleAccess = (permissions: Permission[], module: string): boolean => {
  return permissions.some(permission => permission.module === module)
}

// Helper function để lấy permissions theo module
export const getPermissionsByModule = (permissions: Permission[], module: string): Permission[] => {
  return permissions.filter(permission => permission.module === module)
}

// Helper function để tạo ACL object với required permissions
export const createACLObj = (
  action: Actions = 'access',
  subject: string = 'all',
  roles: string[] = ['ADMIN'],
  requiredPermissions?: RequiredPermission[]
): ACLObj => {
  return {
    action,
    subject,
    roles,
    requiredPermissions
  }
}

export const defaultACLObj: ACLObj = {
  action: 'access',
  subject: 'all',
  roles: ['ADMIN']
}

export default defineRulesFor
 