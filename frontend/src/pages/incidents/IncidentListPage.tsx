import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import SelectInput from '../../components/common/SelectInput'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import * as incidentsApi from '../../api/incidents.api'
import type { Incident } from '../../types/incident.types'
import toast from 'react-hot-toast'
import { usePageTitle } from '../../hooks/usePageTitle'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import * as usersApi from '../../api/users.api'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import DatePicker from 'react-datepicker'

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

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
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

const IncidentListPage = () => {
  usePageTitle('Incidents')

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [statusTarget, setStatusTarget] = useState<Incident | null>(null)
  const [assignTarget, setAssignTarget] = useState<Incident | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null)
  const [statusValue, setStatusValue] = useState('')
  const [statusComment, setStatusComment] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [operators, setOperators] = useState<{ id: number; name: string }[]>([])
  const [selectedOperator, setSelectedOperator] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [isLoadingOperators, setIsLoadingOperators] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { user } = useAuth()
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    priority: '',
    search: '',
    from_date: '',
    to_date: '',
  })

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const loadIncidents = useCallback(async () => {
    setIsLoading(true)
    const response = await incidentsApi.listIncidents({ page, per_page: perPage, ...filters })
    setIncidents(response.data.data)
    setTotal(response.data.meta.total)
    setPerPage(response.data.meta.per_page)
    setIsLoading(false)
  }, [page, perPage, filters])

  useEffect(() => {
    void loadIncidents()
  }, [loadIncidents])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(total, page * perPage)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await incidentsApi.exportIncidents({
        status: filters.status || undefined,
        severity: filters.severity || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      })
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `incidents-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Incidents export downloaded.')
    } catch {
      toast.error('Unable to export incidents.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenStatusModal = (incident: Incident) => {
    setStatusTarget(incident)
    const nextStatuses = getNextStatuses(incident.status.value)
    setStatusValue(nextStatuses[0]?.value ?? '')
    setStatusComment('')
    setResolutionNotes('')
  }

  const handleUpdateStatus = async () => {
    if (!statusTarget || !statusValue || !statusComment.trim()) {
      toast.error('Please provide a status and update note.')
      return
    }
    if ((statusValue === 'resolved' || statusValue === 'closed') && !resolutionNotes.trim()) {
      toast.error('Resolution notes are required for this status.')
      return
    }
    setIsUpdatingStatus(true)
    try {
      await incidentsApi.updateIncidentStatus(String(statusTarget.id), {
        status: statusValue,
        comment: statusComment,
        resolution_notes: resolutionNotes || undefined,
      })
      await loadIncidents()
      setStatusTarget(null)
      toast.success('Status updated.')
    } catch {
      toast.error('Unable to update status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleOpenAssignModal = async (incident: Incident) => {
    setAssignTarget(incident)
    setSelectedOperator(incident.assigned_to?.id ? String(incident.assigned_to.id) : '')
    if (!operators.length) {
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
  }

  const handleAssign = async () => {
    if (!assignTarget) return
    setIsAssigning(true)
    try {
      await incidentsApi.assignIncident(String(assignTarget.id), {
        operator_id: selectedOperator ? Number(selectedOperator) : null,
      })
      await loadIncidents()
      toast.success('Assignment updated.')
      setAssignTarget(null)
    } catch {
      toast.error('Unable to update assignment.')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteIncident = async () => {
    if (!deleteTarget) return
    try {
      await incidentsApi.deleteIncident(String(deleteTarget.id))
      await loadIncidents()
      toast.success('Incident deleted.')
    } catch {
      toast.error('Unable to delete incident.')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Incidents</h1>
          <p className="mt-2 text-sm text-ink-muted">Track and manage incident reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" isLoading={isExporting} onClick={handleExport}>
            Export CSV
          </Button>
          {user?.role === 'reporter' ? (
            <Link to="/app/incidents/new">
              <Button type="button">Create incident</Button>
            </Link>
          ) : null}
        </div>
      </div>

      <Card>
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectInput
            label="Status"
            options={[
              { label: 'All', value: '' },
              { label: 'Open', value: 'open' },
              { label: 'Investigating', value: 'investigating' },
              { label: 'Resolved', value: 'resolved' },
              { label: 'Closed', value: 'closed' },
            ]}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          />
          <SelectInput
            label="Severity"
            options={[
              { label: 'All', value: '' },
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Critical', value: 'critical' },
            ]}
            value={filters.severity}
            onChange={(value) => setFilters({ ...filters, severity: value })}
          />
          <SelectInput
            label="Priority"
            options={[
              { label: 'All', value: '' },
              { label: 'Low', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ]}
            value={filters.priority}
            onChange={(value) => setFilters({ ...filters, priority: value })}
          />
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
            <label className="block w-full text-sm font-medium text-ink">
              <span>From</span>
              <div className="relative mt-2">
                <DatePicker
                  selected={filters.from_date ? new Date(filters.from_date) : null}
                  onChange={(date) =>
                    setFilters({
                      ...filters,
                      from_date: date ? date.toISOString().slice(0, 10) : '',
                    })
                  }
                  open={fromOpen}
                  onInputClick={() => setFromOpen(true)}
                  onClickOutside={() => setFromOpen(false)}
                  onSelect={() => setFromOpen(false)}
                  closeOnSelect
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                wrapperClassName="w-full"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2 pr-10 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                {filters.from_date ? (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-primary-600"
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, from_date: '' })
                      setFromOpen(false)
                    }}
                    aria-label="Clear from date"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </label>
            <label className="block w-full text-sm font-medium text-ink">
              <span>To</span>
              <div className="relative mt-2">
                <DatePicker
                  selected={filters.to_date ? new Date(filters.to_date) : null}
                  onChange={(date) =>
                    setFilters({
                      ...filters,
                      to_date: date ? date.toISOString().slice(0, 10) : '',
                    })
                  }
                  open={toOpen}
                  onInputClick={() => setToOpen(true)}
                  onClickOutside={() => setToOpen(false)}
                  onSelect={() => setToOpen(false)}
                  closeOnSelect
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                wrapperClassName="w-full"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2 pr-10 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                {filters.to_date ? (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-primary-600"
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, to_date: '' })
                      setToOpen(false)
                    }}
                    aria-label="Clear to date"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </label>
            <label className="block w-full text-sm font-medium text-ink">
              <span>Search</span>
              <div className="relative mt-2">
                <input
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2 pr-10 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Search incidents"
                  value={filters.search}
                  onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                />
                {filters.search ? (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-primary-600"
                    type="button"
                    onClick={() => setFilters({ ...filters, search: '' })}
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </label>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading incidents..." />
      ) : incidents.length === 0 ? (
        <EmptyState title="No incidents found" description="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Severity</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Assigned</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} className="border-t border-line">
                  <td className="px-5 py-4 font-semibold text-primary-600">
                    <Link to={`/app/incidents/${incident.id}`}>{incident.incident_number}</Link>
                  </td>
                  <td className="px-5 py-4 text-ink">{incident.title}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClassMap[incident.severity.value] ?? 'bg-surface-muted text-ink-muted'}`}
                    >
                      {incident.severity.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[incident.status.value] ?? 'bg-surface-muted text-ink-muted'}`}
                    >
                      {incident.status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClassMap[incident.priority.value] ?? 'bg-surface-muted text-ink-muted'}`}
                    >
                      {incident.priority.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">
                    {incident.assigned_to?.name ?? 'Unassigned'}
                  </td>
                  <td className="px-5 py-4 text-ink-muted">
                    {incident.created_at_formatted ?? formatDateTime(incident.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative" ref={openMenuId === incident.id ? menuRef : null}>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted hover:text-primary-600"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === incident.id ? null : incident.id))
                        }
                        type="button"
                        aria-label="Open actions"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.6" fill="currentColor" />
                          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                          <circle cx="19" cy="12" r="1.6" fill="currentColor" />
                        </svg>
                      </button>
                      {openMenuId === incident.id ? (
                        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-line bg-surface p-2 text-sm shadow-lg">
                          <Link
                            className="block rounded-lg px-3 py-2 text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                            to={`/app/incidents/${incident.id}`}
                            onClick={() => setOpenMenuId(null)}
                          >
                            View details
                          </Link>
                          {user?.role === 'admin' ? (
                            <button
                              className="w-full rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                              onClick={() => {
                                handleOpenAssignModal(incident)
                                setOpenMenuId(null)
                              }}
                              type="button"
                            >
                              Assign operator
                            </button>
                          ) : null}
                          {user?.role === 'admin' || user?.role === 'operator' ? (
                            <button
                              className="w-full rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                              onClick={() => {
                                handleOpenStatusModal(incident)
                                setOpenMenuId(null)
                              }}
                              type="button"
                            >
                              Update status
                            </button>
                          ) : null}
                          {user?.role === 'admin' ? (
                            <button
                              className="w-full rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                setDeleteTarget(incident)
                                setOpenMenuId(null)
                              }}
                              type="button"
                            >
                              Delete incident
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line px-5 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              perPage={perPage}
              from={from}
              to={to}
              hasNextPage={page < totalPages}
              hasPreviousPage={page > 1}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
      <Modal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} title="Update status">
        {statusTarget ? (
          <div className="space-y-4">
            {!getNextStatuses(statusTarget.status.value).length ? (
              <p className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink-muted">
                This incident is already closed.
              </p>
            ) : null}
            <StatusFlow current={statusTarget.status.value} />
            {getNextStatuses(statusTarget.status.value).length ? (
              <>
                <SelectInput
                  label="Next status"
                  value={statusValue}
                  onChange={setStatusValue}
                  required
                  options={getNextStatuses(statusTarget.status.value)}
                />
                <Input
                  label="Update note"
                  value={statusComment}
                  onChange={(event) => setStatusComment(event.target.value)}
                  required
                />
                {statusValue === 'resolved' || statusValue === 'closed' ? (
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
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setStatusTarget(null)}>
                    Cancel
                  </Button>
                  <Button type="button" isLoading={isUpdatingStatus} onClick={handleUpdateStatus}>
                    Update status
                  </Button>
                </div>
              </>
            ) : null}
            {!getNextStatuses(statusTarget.status.value).length ? (
              <p className="text-xs text-ink-muted">
                Status changes are locked when an incident is closed.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
      <Modal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} title="Assign operator">
        <div className="space-y-4">
          <SelectInput
            label="Operator"
            value={selectedOperator}
            onChange={setSelectedOperator}
            isLoading={isLoadingOperators}
            options={[
              { label: 'Unassigned', value: '' },
              ...operators.map((operator) => ({ label: operator.name, value: String(operator.id) })),
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
            <Button type="button" isLoading={isAssigning} onClick={handleAssign}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete incident"
        description="This incident will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteIncident}
      />
    </div>
  )
}

export default IncidentListPage
