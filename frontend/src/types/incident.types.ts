export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentPriority = 'low' | 'normal' | 'high' | 'urgent'

export type Incident = {
  id: number
  incident_number: string
  title: string
  description: string
  status: {
    value: IncidentStatus
    label: string
    color: string
  }
  severity: {
    value: IncidentSeverity
    label: string
    color: string
  }
  priority: {
    value: IncidentPriority
    label: string
    color: string
  }
  category: string
  due_date?: string | null
  resolved_at?: string | null
  closed_at?: string | null
  resolution_notes?: string | null
  updated_at?: string | null
  reported_by?: {
    id: number
    name: string
  }
  reporter?: {
    id: number
    name: string
    email?: string
  }
  assigned_to?: {
    id: number
    name: string
  } | null
  created_at_formatted?: string
  created_at?: string
  time_elapsed?: string
  attachments?: {
    id: number
    file_name?: string
    name?: string
    file_path?: string
    url?: string
    created_at?: string
    uploaded_by?: { id: number; name: string }
    uploader?: { id: number; name: string }
    user?: { id: number; name: string }
    file_size_human?: string
  }[]
}
