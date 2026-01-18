import api from './axios'
import type { ApiResponse } from '../types/api.types'
import type { DashboardStats, EscalationAlert } from '../types/dashboard.types'

export const getStats = () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats')

export const getStatusDistribution = () =>
  api.get<ApiResponse<{ name: string; value: number; color: string }[]>>(
    '/dashboard/status-distribution',
  )

export const getSeverityBreakdown = () =>
  api.get<ApiResponse<{ name: string; value: number; color: string }[]>>(
    '/dashboard/severity-breakdown',
  )

export const getCategoryBreakdown = () =>
  api.get<ApiResponse<{ name: string; value: number }[]>>('/dashboard/category-breakdown')

export const getIncidentTrends = (days = 30) =>
  api.get<ApiResponse<{ date: string; count: number }[]>>('/dashboard/trends', { params: { days } })

export const getOperatorPerformance = () =>
  api.get<ApiResponse<any[]>>('/dashboard/operator-performance')

export const getEscalationAlerts = () =>
  api.get<ApiResponse<EscalationAlert[]>>('/dashboard/escalation-alerts')

export const getRecentIncidents = (limit = 4) =>
  api.get<ApiResponse<any[]>>('/dashboard/recent-incidents', { params: { limit } })
