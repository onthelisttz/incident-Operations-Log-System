import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import AuthLayout from '../components/layout/AuthLayout'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import FirstLoginGuard from './FirstLoginGuard'
import LoginPage from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import FirstLoginPage from '../pages/auth/FirstLoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import IncidentListPage from '../pages/incidents/IncidentListPage'
import IncidentDetailPage from '../pages/incidents/IncidentDetailPage'
import CreateIncidentPage from '../pages/incidents/CreateIncidentPage'
import UserListPage from '../pages/users/UserListPage'
import ProfilePage from '../pages/profile/ProfilePage'
import NotFoundPage from '../pages/NotFoundPage'
import UnauthorizedPage from '../pages/error/UnauthorizedPage'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/home" replace />} />
        <Route path="/app/home" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/first-login" element={<FirstLoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<FirstLoginGuard />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="incidents" element={<IncidentListPage />} />
              <Route element={<RoleRoute allowed={['reporter']} />}>
                <Route path="incidents/new" element={<CreateIncidentPage />} />
              </Route>
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route element={<RoleRoute allowed={['admin']} />}>
                <Route path="users" element={<UserListPage />} />
                <Route path="users/new" element={<Navigate to="/app/users" replace />} />
                <Route path="users/:id" element={<Navigate to="/app/users" replace />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
