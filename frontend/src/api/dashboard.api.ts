import api from './axios'
import type { ApiResponse } from '../types/api.types'
import type { DashboardStats, EscalationAlert } from '../types/dashboard.types'

export const getStats = () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats')

export const getEscalationAlerts = () =>
  api.get<ApiResponse<EscalationAlert[]>>('/dashboard/escalation-alerts')
