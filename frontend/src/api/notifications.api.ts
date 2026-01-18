import api from './axios'
import type { ApiResponse } from '../types/api.types'

export type NotificationItem = {
  id: string
  type: string
  data: Record<string, unknown>
  read_at?: string | null
  created_at?: string
}

export const listNotifications = () =>
  api.get<ApiResponse<NotificationItem[]>>('/notifications')
