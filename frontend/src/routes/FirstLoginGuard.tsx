import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const FirstLoginGuard = () => {
  const { user, requiresPasswordChange } = useAuth()

  if (user?.is_first_login || requiresPasswordChange) {
    return <Navigate to="/first-login" replace />
  }

  return <Outlet />
}

export default FirstLoginGuard
