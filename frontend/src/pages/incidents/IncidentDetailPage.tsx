import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SelectInput from '../../components/common/SelectInput'
import Input from '../../components/common/Input'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import * as incidentsApi from '../../api/incidents.api'
import type { Incident } from '../../types/incident.types'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../hooks/useAuth'
import * as usersApi from '../../api/users.api'
import { sanctumBaseUrl, storageBaseUrl } from '../../utils/appConfig'

const statusClassMap: Record<string, string> = {
  open: 'bg-status-open-bg text-status-open-text',
  investigating: 'bg-status-investigating-bg text-status-investigating-text',
  resolved: 'bg-status-resolved-bg text-status-resolved-text',
  closed: 'bg-success-50 text-success-700',
}

const severityClassMap: Record<string, string> = {
  low: 'bg-severity-low-bg text-severity-low-text',
  medium: 'bg-severity-medium-bg text-severity-medium-text',
  high: 'bg-severity-high-bg text-severity-high-text',
  critical: 'bg-severity-critical-bg text-severity-critical-text',
}

const priorityClassMap: Record<string, string> = {
  low: 'bg-priority-low-bg text-priority-low-text',
  normal: 'bg-priority-normal-bg text-priority-normal-text',
  high: 'bg-priority-high-bg text-priority-high-text',
  urgent: 'bg-priority-urgent-bg text-priority-urgent-text',
}

const statusSteps = ['open', 'investigating', 'resolved', 'closed'] as const

const getNextStatuses = (current: string) => {
  switch (current) {
    case 'open':
      return [{ label: 'Investigating', value: 'investigating' }]
    case 'investigating':
      return [{ label: 'Resolved', value: 'resolved' }]
    case 'resolved':
      return [{ label: 'Closed', value: 'closed' }]
    default:
      return []
  }
}

const StatusFlow = ({ current }: { current: string }) => {
  const currentIndex = statusSteps.indexOf(current as (typeof statusSteps)[number])
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {statusSteps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 font-semibold capitalize ${index <= currentIndex ? 'bg-primary-100 text-primary-700' : 'bg-surface-muted text-ink-muted'
              }`}
          >
            {step}
          </span>
          {index < statusSteps.length - 1 ? <span className="text-ink-subtle">→</span> : null}
        </div>
      ))}
    </div>
  )
}

const IncidentDetailPage = () => {
  usePageTitle('Incident details')

  const { id } = useParams()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [status, setStatus] = useState('open')
  const [comment, setComment] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [operators, setOperators] = useState<{ id: number; name: string }[]>([])
  const [operatorValue, setOperatorValue] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [isLoadingOperators, setIsLoadingOperators] = useState(false)
  const [attachments, setAttachments] = useState<
    {
      id: number
      file_name?: string
      name?: string
      file_path?: string
      url?: string
      created_at?: string
    }[]
  >([])
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false)
  const [newAttachments, setNewAttachments] = useState<File[]>([])
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const incidentRequestRef = useRef(false)
  const updatesRequestRef = useRef(false)
  const [updates, setUpdates] = useState<
    {
      id: number
      action_type: { value: string; label: string; icon?: string } | string
      previous_value?: string | null
      new_value?: string | null
      comment?: string | null
      description?: string | null
      is_internal?: boolean
      created_at?: string
      user?: { id: number; name: string }
    }[]
  >([])
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const loadIncident = async (force = false) => {
    if (!id) return
    if (incidentRequestRef.current && !force) return
    incidentRequestRef.current = true
    setIsLoading(true)
    setError('')
    try {
      const response = await incidentsApi.getIncident(id)
      setIncident(response.data.data)
      const nextStatuses = getNextStatuses(response.data.data.status.value)
      setStatus(nextStatuses[0]?.value ?? '')
      setOperatorValue(response.data.data.assigned_to?.id ? String(response.data.data.assigned_to.id) : '')
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this incident.')
      } else if (err.response?.status === 404) {
        setError('Incident not found.')
      } else {
        setError('Unable to load incident details.')
        toast.error('Unable to load incident details.')
      }
    } finally {
      setIsLoading(false)
      incidentRequestRef.current = false
    }
  }

  useEffect(() => {
    void loadIncident()
  }, [id])

  useEffect(() => {
    if (user?.role !== 'admin') return
    const loadOperators = async () => {
      try {
        setIsLoadingOperators(true)
        const response = await usersApi.getOperators()
        setOperators(response.data.data)
      } catch {
        toast.error('Unable to load operators.')
      } finally {
        setIsLoadingOperators(false)
      }
    }
    void loadOperators()
  }, [user?.role])

  const loadUpdates = async (force = false) => {
    if (!id) return
    if (updatesRequestRef.current && !force) return
    updatesRequestRef.current = true
    setIsLoadingUpdates(true)
    try {
      const response = await incidentsApi.getIncidentUpdates(id)
      setUpdates(response.data.data ?? [])
    } catch {
      toast.error('Unable to load activity timeline.')
    } finally {
      setIsLoadingUpdates(false)
      updatesRequestRef.current = false
    }
  }

  useEffect(() => {
    void loadUpdates()
  }, [id])

  useEffect(() => {
    if (!id) return
    const loadAttachments = async () => {
      setIsLoadingAttachments(true)
      try {
        const response = await incidentsApi.listIncidentAttachments(id)
        setAttachments(response.data.data ?? [])
      } catch {
        toast.error('Unable to load attachments.')
      } finally {
        setIsLoadingAttachments(false)
      }
    }
    void loadAttachments()
  }, [id])

  const handleStatusUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return
    if (!comment.trim()) {
      toast.error('Please add an update note.')
      return
    }
    if ((status === 'resolved' || status === 'closed') && !resolutionNotes.trim()) {
      toast.error('Resolution notes are required for this status.')
      return
    }
    setIsSubmitting(true)
    try {
      await incidentsApi.updateIncidentStatus(id, {
        status,
        comment,
        resolution_notes: resolutionNotes || undefined,
      })
      await Promise.all([loadIncident(true), loadUpdates(true)])
      toast.success('Status updated.')
    } catch {
      toast.error('Unable to update status.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssign = async () => {
    if (!id) return
    setIsAssigning(true)
    try {
      await incidentsApi.assignIncident(id, {
        operator_id: operatorValue ? Number(operatorValue) : null,
      })
      await loadIncident(true)
      toast.success('Assignment updated.')
    } catch {
      toast.error('Unable to update assignment.')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !commentText.trim()) return
    setIsCommenting(true)
    try {
      await incidentsApi.addIncidentComment(id, { comment: commentText, is_internal: isInternal })
      setCommentText('')
      setIsInternal(false)
      await loadUpdates(true)
      setTimeout(() => timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      toast.success('Comment added.')
    } catch {
      toast.error('Unable to add comment.')
    } finally {
      setIsCommenting(false)
    }
  }

  const visibleUpdates = useMemo(() => {
    const filtered =
      user?.role === 'admin' || user?.role === 'operator'
        ? updates
        : updates.filter((update) => !update.is_internal)
    const getTime = (value?: string | null) => {
      if (!value) return 0
      const parsed = Date.parse(value)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    return [...filtered].sort((a, b) => {
      const aTime = getTime(a.created_at)
      const bTime = getTime(b.created_at)
      if (bTime !== aTime) return bTime - aTime
      return (b.id ?? 0) - (a.id ?? 0)
    })
  }, [updates, user?.role])

  const formatValue = (value?: unknown) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    if (typeof value === 'object') {
      const record = value as { label?: string; value?: string }
      if (record.label) return record.label
      if (record.value) return record.value
    }
    return JSON.stringify(value)
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString()
  }

  const handleUploadAttachments = async () => {
    if (!id || !newAttachments.length) return
    try {
      await Promise.all(newAttachments.map((file) => incidentsApi.uploadIncidentAttachment(id, file)))
      setNewAttachments([])
      const response = await incidentsApi.listIncidentAttachments(id)
      setAttachments(response.data.data ?? [])
      toast.success('Attachments uploaded.')
    } catch {
      toast.error('Unable to upload attachments.')
    }
  }

  const handleAttachmentDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files ?? [])
    setNewAttachments(files)
  }

  const handleAttachmentDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  const handleDownload = async (attachmentId: number, name?: string) => {
    try {
      const response = await incidentsApi.downloadAttachment(attachmentId)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const anchor = link
      anchor.href = url
      anchor.download = name ?? `attachment-${attachmentId}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Unable to download attachment.')
    }
  }

  const getAttachmentViewUrl = (attachment: {
    id: number
    file_name?: string
    name?: string
    url?: string
    file_path?: string
  }) => {
    if (attachment.url) {
      if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
        return attachment.url
      }
      return `${sanctumBaseUrl}${attachment.url.startsWith('/') ? '' : '/'}${attachment.url}`
    }
    const fileName = attachment.file_name ?? attachment.name ?? attachment.file_path?.split('/').pop()
    if (fileName) {
      return `${storageBaseUrl}/${fileName}`
    }
    return `${sanctumBaseUrl}/attachments/${attachment.id}/download`
  }

  if (isLoading) {
    return <LoadingState label="Loading incident details..." />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link className="text-sm font-semibold text-primary-600 hover:text-primary-700" to="/app/incidents">
          ← Back to Incidents
        </Link>
        <EmptyState title="Access Denied" description={error} />
      </div>
    )
  }

  if (!incident) {
    return <EmptyState title="Incident not found" description="We could not find this incident." />
  }

  return (
    <div className="space-y-6">
      <Link className="text-sm font-semibold text-primary-600 hover:text-primary-700" to="/app/incidents">
        ← Back to Incidents
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {incident.incident_number}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{incident.title}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-ink-subtle">Status</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[incident.status.value] ?? 'bg-surface-muted text-ink-muted'}`}
            >
              {incident.status.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-ink-subtle">Severity</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClassMap[incident.severity.value] ?? 'bg-surface-muted text-ink-muted'}`}
            >
              {incident.severity.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-ink-subtle">Priority</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClassMap[incident.priority.value] ?? 'bg-surface-muted text-ink-muted'}`}
            >
              {incident.priority.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Incident details">
          <div className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-xs uppercase tracking-wide text-ink-subtle">Description</p>
              <p className="mt-3 text-sm text-ink">{incident.description}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <dl className="divide-y divide-line text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Category</dt>
                  <dd className="font-semibold text-ink">{incident.category}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Reporter</dt>
                  <dd className="font-semibold text-ink">
                    {incident.reported_by?.name ?? incident.reporter?.name ?? '-'}
                  </dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Reported at</dt>
                  <dd className="font-semibold text-ink">{formatDateTime(incident.created_at)}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Last updated</dt>
                  <dd className="font-semibold text-ink">{formatDateTime(incident.updated_at)}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Due date</dt>
                  <dd className="font-semibold text-ink">{formatDateTime(incident.due_date)}</dd>
                </div>
                {incident.resolved_at ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <dt className="text-xs uppercase tracking-wide text-ink-subtle">Resolved at</dt>
                    <dd className="font-semibold text-ink">
                      {formatDateTime(incident.resolved_at)}
                    </dd>
                  </div>
                ) : null}
                {incident.closed_at ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <dt className="text-xs uppercase tracking-wide text-ink-subtle">Closed at</dt>
                    <dd className="font-semibold text-ink">{formatDateTime(incident.closed_at)}</dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Severity</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${severityClassMap[incident.severity.value] ?? 'bg-surface-muted text-ink-muted'}`}
                    >
                      {incident.severity.label}
                    </span>
                  </dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-subtle">Priority</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityClassMap[incident.priority.value] ?? 'bg-surface-muted text-ink-muted'}`}
                    >
                      {incident.priority.label}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            {incident.resolution_notes ? (
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs uppercase tracking-wide text-ink-subtle">Resolution notes</p>
                <p className="mt-3 text-sm text-ink">{incident.resolution_notes}</p>
              </div>
            ) : null}
          </div>
        </Card>
        <Card
          title={user?.role === 'reporter' ? 'Track status' : 'Status & assignment'}
          subtitle={user?.role === 'reporter' ? 'Track progress and ownership' : 'Update progress and ownership'}
        >
          {user?.role === 'admin' ? (
            <div className="mb-6 space-y-4">
              <SelectInput
                label="Assigned operator"
                value={operatorValue}
                onChange={setOperatorValue}
                isLoading={isLoadingOperators}
                options={[
                  { label: 'Unassigned', value: '' },
                  ...operators.map((operator) => ({
                    label: operator.name,
                    value: String(operator.id),
                  })),
                ]}
              />
              <div className="flex justify-end">
                <Button type="button" isLoading={isAssigning} onClick={handleAssign}>
                  Save assignment
                </Button>
              </div>
            </div>
          ) : null}
          {user?.role === 'admin' || user?.role === 'operator' ? (
            <form className="space-y-4" onSubmit={handleStatusUpdate}>
              {!getNextStatuses(incident.status.value).length ? (
                <p className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink-muted">
                  This incident is already closed.
                </p>
              ) : null}
              <StatusFlow current={incident.status.value} />
              {getNextStatuses(incident.status.value).length ? (
                <>
                  <SelectInput
                    label="Next status"
                    value={status}
                    onChange={setStatus}
                    required
                    options={getNextStatuses(incident.status.value)}
                  />
                  <Input
                    label="Update note"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Describe the update"
                    required
                  />
                  {status === 'resolved' || status === 'closed' ? (
                    <label className="block text-sm font-medium text-ink">
                      <span>
                        Resolution notes
                        <span className="text-rose-500"> *</span>
                      </span>
                      <textarea
                        className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        rows={3}
                        value={resolutionNotes}
                        onChange={(event) => setResolutionNotes(event.target.value)}
                        required
                      />
                    </label>
                  ) : null}
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isSubmitting}>
                      Update status
                    </Button>
                  </div>
                </>
              ) : null}
              {!getNextStatuses(incident.status.value).length ? (
                <p className="text-xs text-ink-muted">
                  Status changes are locked when an incident is closed.
                </p>
              ) : null}
            </form>
          ) : (
            <div className="space-y-3">
              <StatusFlow current={incident.status.value} />
            </div>
          )}
        </Card>
      </div>

      <Card title="Activity timeline">
        <div ref={timelineRef} />
        {isLoadingUpdates ? (
          <LoadingState label="Loading activity..." />
        ) : visibleUpdates.length === 0 ? (
          <div className="text-sm text-ink-muted">No activity yet. Updates will appear here.</div>
        ) : (
          <div className="space-y-4">
            {visibleUpdates.map((update) => (
              <div key={update.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-ink">
                    {formatValue(update.action_type) ? formatValue(update.action_type) : 'Update'}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {update.created_at ? new Date(update.created_at).toLocaleString() : '-'}
                  </div>
                </div>
                {update.description ? (
                  <p className="mt-2 text-xs text-ink-subtle">{update.description}</p>
                ) : null}
                {update.comment ? (
                  <p className="mt-2 text-ink-muted">{formatValue(update.comment)}</p>
                ) : null}
                {update.previous_value || update.new_value ? (
                  <p className="mt-2 text-xs text-ink-muted">
                    {update.previous_value ? `From: ${formatValue(update.previous_value)}` : ''}
                    {update.previous_value && update.new_value ? ' → ' : ''}
                    {update.new_value ? `To: ${formatValue(update.new_value)}` : ''}
                  </p>
                ) : null}
                {update.user?.name ? (
                  <p className="mt-2 text-xs text-ink-subtle">By {update.user.name}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Attachments">
        {isLoadingAttachments ? (
          <LoadingState label="Loading attachments..." />
        ) : attachments.length === 0 ? (
          <div className="text-sm text-ink-muted">No attachments yet.</div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface p-3 text-sm">
                <div>
                  <div className="text-ink font-semibold">
                    {attachment.file_name ?? attachment.name ?? `Attachment ${attachment.id}`}
                  </div>
                  <div className="mt-1 text-xs text-ink-subtle">
                    {attachment.uploader?.name ??
                      attachment.uploaded_by?.name ??
                      attachment.user?.name ??
                      'Unknown'}
                    {' · '}
                    {attachment.created_at ? new Date(attachment.created_at).toLocaleString() : '-'}
                    {attachment.file_size_human ? ` · ${attachment.file_size_human}` : ''}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getAttachmentViewUrl(attachment) ? (
                    <a
                      className="inline-flex items-center rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-muted hover:text-primary-600"
                      href={getAttachmentViewUrl(attachment)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleDownload(attachment.id, attachment.file_name ?? attachment.name ?? undefined)
                    }
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label
          className="relative mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-muted px-4 py-6 text-center text-sm text-ink-muted hover:border-primary-200"
          onDrop={handleAttachmentDrop}
          onDragOver={handleAttachmentDragOver}
        >
          <span className="text-sm font-semibold text-ink">Add attachments (optional)</span>
          <span>Drag & drop images or PDFs, or click to browse</span>
          <span className="text-xs text-ink-subtle">PNG, JPG, PDF</span>
          <input
            className="absolute inset-0 cursor-pointer opacity-0"
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(event) => setNewAttachments(Array.from(event.target.files ?? []))}
          />
          {newAttachments.length ? (
            <div className="text-xs text-ink">
              {newAttachments.length} file(s) selected
            </div>
          ) : null}
        </label>
        <div className="mt-3 flex justify-end">
          <Button type="button" onClick={handleUploadAttachments} disabled={!newAttachments.length}>
            Upload attachments
          </Button>
        </div>
      </Card>

      <Card title="Add comment">
        <form className="space-y-4" onSubmit={handleAddComment}>
          <label className="block text-sm font-medium text-ink">
            <span>
              Comment
              <span className="text-rose-500"> *</span>
            </span>
            <textarea
              className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
              rows={4}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write your update..."
              required
            />
          </label>
          {user?.role === 'admin' || user?.role === 'operator' ? (
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={() => setIsInternal((prev) => !prev)}
              />
              Internal note (visible to operators/admins)
            </label>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" isLoading={isCommenting}>
              Post comment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default IncidentDetailPage
