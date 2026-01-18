import api from './axios'
import type { ApiResponse, PaginatedResponse } from '../types/api.types'
import type { Incident } from '../types/incident.types'

export const listIncidents = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Incident>>('/incidents', { params })

export const createIncident = (payload: Record<string, unknown>) =>
  api.post<ApiResponse<Incident>>('/incidents', payload)

export const getIncident = (id: string) =>
  api.get<ApiResponse<Incident>>(`/incidents/${id}`)

export const deleteIncident = (id: string) => api.delete<ApiResponse<null>>(`/incidents/${id}`)

export const updateIncidentStatus = (
  id: string,
  payload: { status: string; comment: string; resolution_notes?: string },
) =>
  api.patch<ApiResponse<null>>(`/incidents/${id}/status`, {
    ...payload,
    notes: payload.resolution_notes,
  })

export const addIncidentComment = (id: string, payload: { comment: string; is_internal?: boolean }) =>
  api.post<ApiResponse<null>>(`/incidents/${id}/comments`, payload)

export const exportIncidents = (params?: Record<string, unknown>) =>
  api.get<Blob>('/incidents/export', { params, responseType: 'blob' })

export const assignIncident = (id: string, payload: { operator_id: number | null }) =>
  api.patch<ApiResponse<null>>(`/incidents/${id}/assign`, payload)

export const getIncidentUpdates = (id: string) =>
  api.get<ApiResponse<unknown[]>>(`/incidents/${id}/updates`)

export const listIncidentAttachments = (id: string) =>
  api.get<ApiResponse<unknown[]>>(`/incidents/${id}/attachments`)

export const uploadIncidentAttachment = (id: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ApiResponse<unknown>>(`/incidents/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const downloadAttachment = (attachmentId: number) =>
  api.get<Blob>(`/attachments/${attachmentId}/download`, { responseType: 'blob' })
