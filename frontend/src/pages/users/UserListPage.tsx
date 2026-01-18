import { useEffect, useRef, useState } from 'react'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import SelectInput from '../../components/common/SelectInput'
import Button from '../../components/common/Button'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import * as usersApi from '../../api/users.api'
import type { UserSummary } from '../../types/user.types'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { usePageTitle } from '../../hooks/usePageTitle'
import Alert from '../../components/common/Alert'
import axios from 'axios'
import { isValidEmail, isValidPhoneNumber } from '../../utils/validators'
import { getFileUrl } from '../../utils/urls'
import Spinner from '../../components/common/Spinner'

const UserListPage = () => {
  usePageTitle('Users')

  const [users, setUsers] = useState<UserSummary[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({ search: '', role: '', status: '' })
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({})
  const { user: currentUser } = useAuth()
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null)
  const [statusTarget, setStatusTarget] = useState<UserSummary | null>(null)
  const [editTarget, setEditTarget] = useState<UserSummary | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<UserSummary | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'reporter',
    phone: '',
  })
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const formEmailValid = isValidEmail(form.email)
  const formPhoneValid = isValidPhoneNumber(form.phone)

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const response = await usersApi.listUsers({ page, per_page: perPage, ...filters })
      setUsers(response.data.data)
      setTotal(response.data.meta.total)
      setPerPage(response.data.meta.per_page)
      setIsLoading(false)
    }
    void load()
  }, [page, perPage, filters])

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

  const handleToggleStatus = async (user: UserSummary) => {
    if (currentUser?.id === user.id) {
      toast.error("You can't block your own account.")
      return
    }
    setActionLoading((prev) => ({ ...prev, [user.id]: 'toggle' }))
    try {
      const response = await usersApi.toggleUserStatus(user.id)
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, ...response.data.data } : item)),
      )
      toast.success(user.is_active ? 'User blocked.' : 'User unblocked.')
    } catch {
      toast.error('Unable to update user status.')
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: '' }))
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    setActionLoading((prev) => ({ ...prev, [deleteTarget.id]: 'delete' }))
    try {
      await usersApi.deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      toast.success('User deleted.')
    } catch {
      toast.error('Unable to delete user.')
    } finally {
      setActionLoading((prev) => ({ ...prev, [deleteTarget.id]: '' }))
      setDeleteTarget(null)
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setForm({ name: '', email: '', role: 'reporter', phone: '' })
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (user: UserSummary) => {
    setModalMode('edit')
    setEditTarget(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    setFormError('')
    if (!formEmailValid) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (!formPhoneValid) {
      setFormError('Phone number format is invalid.')
      return
    }
    setIsSaving(true)
    try {
      if (modalMode === 'create') {
        const response = await usersApi.createUser(form)
        setUsers((prev) => [response.data.data, ...prev])
        toast.success(response.data.message ?? 'User created successfully.')
      } else if (modalMode === 'edit' && editTarget) {
        const response = await usersApi.updateUser(editTarget.id, form)
        setUsers((prev) =>
          prev.map((item) => (item.id === editTarget.id ? { ...item, ...response.data.data } : item)),
        )
        toast.success(response.data.message ?? 'User updated successfully.')
      }
      setModalOpen(false)
      setEditTarget(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message
        setFormError(message ?? 'Unable to save user.')
      } else {
        setFormError('Unable to save user.')
      }
    } finally {
      setIsSaving(false)
      setConfirmUpdate(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await usersApi.exportUsers({
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
      })
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Users export downloaded.')
    } catch {
      toast.error('Unable to export users.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">User management</h1>
          <p className="mt-2 text-sm text-ink-muted">Manage users and roles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <span className="inline-flex items-center gap-2">
                <span className="scale-75">
                  <Spinner />
                </span>
                Exporting...
              </span>
            ) : (
              'Export CSV'
            )}
          </Button>
          <Button type="button" onClick={openCreateModal}>
            Add user
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Search users"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
          <SelectInput
            label="Role"
            value={filters.role}
            onChange={(value) => setFilters({ ...filters, role: value })}
            options={[
              { label: 'All roles', value: '' },
              { label: 'Admin', value: 'admin' },
              { label: 'Operator', value: 'operator' },
              { label: 'Reporter', value: 'reporter' },
            ]}
          />
          <SelectInput
            label="Status"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            options={[
              { label: 'All statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Blocked', value: 'blocked' },
            ]}
          />
        </div>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-5 py-4 font-semibold text-ink">{user.name}</td>
                  <td className="px-5 py-4 text-ink-muted">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-primary-100 text-primary-600'
                          : user.role === 'operator'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-surface-muted text-ink-muted'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.is_active ? 'bg-success-50 text-success-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted hover:text-primary-600"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === user.id ? null : user.id))
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
                      {openMenuId === user.id ? (
                        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-surface p-2 text-sm shadow-lg">
                          <button
                            className="w-full rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                            onClick={() => {
                              setDetailsTarget(user)
                              setOpenMenuId(null)
                            }}
                            type="button"
                          >
                            View details
                          </button>
                          <button
                            className="w-full rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                            onClick={() => {
                              openEditModal(user)
                              setOpenMenuId(null)
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="w-full rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-surface-muted hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              setStatusTarget(user)
                              setOpenMenuId(null)
                            }}
                            disabled={actionLoading[user.id] === 'toggle' || currentUser?.id === user.id}
                            type="button"
                            title={currentUser?.id === user.id ? 'You cannot block your own account' : undefined}
                          >
                            {user.is_active ? 'Block user' : 'Unblock user'}
                          </button>
                          <button
                            className="w-full rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              setDeleteTarget(user)
                              setOpenMenuId(null)
                            }}
                            disabled={actionLoading[user.id] === 'delete' || currentUser?.id === user.id}
                            type="button"
                            title={currentUser?.id === user.id ? 'You cannot delete your own account' : undefined}
                          >
                            Delete
                          </button>
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
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete user"
        description={
          deleteTarget ? (
            <span>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This user
              will be permanently deleted and this action cannot be undone.
            </span>
          ) : undefined
        }
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        confirmLoading={deleteTarget ? actionLoading[deleteTarget.id] === 'delete' : false}
      />
      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        title={statusTarget?.is_active ? 'Block user' : 'Unblock user'}
        description={
          statusTarget ? (
            <span>
              Are you sure you want to {statusTarget.is_active ? 'block' : 'unblock'}{' '}
              <strong>{statusTarget.name}</strong>?
            </span>
          ) : undefined
        }
        confirmLabel={statusTarget?.is_active ? 'Block' : 'Unblock'}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => statusTarget && handleToggleStatus(statusTarget)}
        confirmLoading={statusTarget ? actionLoading[statusTarget.id] === 'toggle' : false}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setConfirmUpdate(false)
          setEditTarget(null)
        }}
        title={modalMode === 'create' ? 'Create user' : 'Update user'}
      >
        {formError ? <Alert title={formError} tone="error" /> : null}
        <div className="mt-4 grid gap-4">
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
      
          <SelectInput
            label="Role"
            value={form.role}
            onChange={(value) => setForm({ ...form, role: value })}
            required
            options={[
              { label: 'Reporter', value: 'reporter' },
              { label: 'Operator', value: 'operator' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="+255..."
          />
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            {modalMode === 'edit' ? (
              <Button type="button" onClick={() => setConfirmUpdate(true)}>
                Save changes
              </Button>
            ) : (
              <Button type="button" isLoading={isSaving} onClick={handleSubmit}>
                Create user
              </Button>
            )}
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={confirmUpdate}
        title="Update user"
        description="Are you sure you want to update this user?"
        confirmLabel="Update"
        onClose={() => setConfirmUpdate(false)}
        onConfirm={handleSubmit}
        confirmLoading={isSaving}
      />
  <Modal
  isOpen={Boolean(detailsTarget)}
  onClose={() => setDetailsTarget(null)}
  title="User details"
>
  {detailsTarget ? (
    <div className="space-y-6">
      {/* Profile Header Section */}
      <div className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-indigo-50 text-indigo-600 shadow-md ring-1 ring-gray-100">
          {detailsTarget.avatar ? (
            <img
              className="h-full w-full object-cover"
              src={getFileUrl(detailsTarget.avatar) ?? ''}
              alt={detailsTarget.name}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold uppercase tracking-wide">
              {detailsTarget.name?.slice(0, 1) ?? 'U'}
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            User Profile
          </p>
          <p className="text-xl font-bold text-gray-900">
            {detailsTarget.name}
          </p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {detailsTarget.email}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Phone Card */}
        <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Phone
          </div>
          <p className="text-base font-semibold text-gray-900">
            {detailsTarget.phone ?? <span className="font-normal text-gray-400">Not provided</span>}
          </p>
        </div>

        {/* Role Card */}
        <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Role
          </div>
          <p className="text-base font-semibold text-gray-900 capitalize">
            {detailsTarget.role}
          </p>
        </div>

        {/* Status Card (Full Width) */}
        <div className="col-span-1 sm:col-span-2 group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Status
          </div>
          <div className="flex items-center">
            {detailsTarget.is_active ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                <span className="mr-2 h-2 w-2 rounded-full bg-rose-600"></span>
                Blocked
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null}
</Modal>
    </div>
  )
}

export default UserListPage
