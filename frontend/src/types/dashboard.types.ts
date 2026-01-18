export type DashboardStats = {
  total_incidents: number
  open_incidents: number
  resolved_incidents: number
  avg_resolution_time: string
}

export type EscalationAlert = {
  id: number
  incident_number: string
  reason: string
  hours_open: number
}
