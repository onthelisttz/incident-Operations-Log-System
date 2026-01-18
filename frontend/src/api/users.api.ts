import api from './axios'
import type { ApiResponse, PaginatedResponse } from '../types/api.types'
import type { UserSummary } from '../types/user.types'

export const listUsers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<UserSummary>>('/users', { params })

export const createUser = (payload: Record<string, unknown>) =>
  api.post<ApiResponse<UserSummary>>('/users', payload)

export const resetUserPassword = (id: number) =>
  api.post<ApiResponse<null>>(`/users/${id}/reset-password`)

export const toggleUserStatus = (id: number) =>
  api.patch<ApiResponse<UserSummary>>(`/users/${id}/toggle-status`)

export const deleteUser = (id: number) => api.delete<ApiResponse<null>>(`/users/${id}`)

export const updateUser = (id: number, payload: Record<string, unknown>) =>
  api.put<ApiResponse<UserSummary>>(`/users/${id}`, payload)

export const exportUsers = (params?: Record<string, unknown>) =>
  api.get<Blob>('/users/export', { params, responseType: 'blob' })

export const getOperators = () => api.get<ApiResponse<{ id: number; name: string }[]>>('/users/operators')
