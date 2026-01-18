import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth.types'

type RoleRouteProps = {
  allowed: UserRole[]
}

const RoleRoute = ({ allowed }: RoleRouteProps) => {
  const { user } = useAuth()

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}

export default RoleRoute
