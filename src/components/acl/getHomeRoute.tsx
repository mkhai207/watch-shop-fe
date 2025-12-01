/**
 *  Set Home URL based on User Roles
 */

const getHomeRoute = (role: string) => {
  if (role === 'CUSTOMER') return '/'
  else return '/manage-system/dashboard'
}

export default getHomeRoute
