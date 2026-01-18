import axios from 'axios'
import api from './axios'
import type { ApiResponse } from '../types/api.types'
import type { LoginResponse, User } from '../types/auth.types'
import { sanctumBaseUrl } from '../utils/appConfig'

// Get CSRF cookie from Sanctum before making authenticated requests
export const getCsrfCookie = () =>
  axios.get(`${sanctumBaseUrl}/sanctum/csrf-cookie`, { withCredentials: true })

export const login = async (payload: { email: string; password: string }) => {
  // First, get the CSRF cookie
  await getCsrfCookie()
  // Then make the login request
  return api.post<ApiResponse<LoginResponse>>('/auth/login', payload)
}

export const logout = () => api.post<ApiResponse<null>>('/auth/logout')

export const me = () => api.get<ApiResponse<User>>('/auth/me')

export const changePassword = (payload: {
  current_password: string
  password: string
  password_confirmation: string
}) => api.post<ApiResponse<null>>('/auth/change-password', payload)

export const firstLoginPassword = (payload: {
  password: string
  password_confirmation: string
}) => api.post<ApiResponse<null>>('/auth/first-login-password', payload)

export const forgotPassword = (payload: { email: string }) =>
  api.post<ApiResponse<null>>('/auth/forgot-password', payload)

export const resetPassword = (payload: {
  email: string
  token: string
  password: string
  password_confirmation: string
}) =>
  api.post<ApiResponse<null>>('/auth/reset-password', payload)

export const updateProfile = (payload: FormData) =>
  api.put<ApiResponse<User>>('/auth/profile', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
