import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth.types'

type RoleRouteProps = {
  allowed: UserRole[]
}

const RoleRoute = ({ allowed }: RoleRouteProps) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default RoleRoute
