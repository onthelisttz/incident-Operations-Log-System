export type DashboardStats = {
  total_incidents: number
  open_incidents: number
  resolved_incidents: number
  avg_resolution_time: string
  // Admin only
  total_users?: number
  active_users?: number
  inactive_users?: number
  user_roles?: {
    admin: number
    reporter: number
    operator: number
  }
  at_risk_count?: number
}

export type EscalationAlert = {
  id: number
  incident_number: string
  reason: string
  hours_open: number
  assigned_to: string
  risk_level: 'medium' | 'high' | 'critical'
}
