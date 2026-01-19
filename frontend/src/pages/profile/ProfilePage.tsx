import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import toast from 'react-hot-toast'
import { useChangePassword } from '../../contexts/ChangePasswordContext'
import { isValidPhoneNumber } from '../../utils/validators'
import { usePageTitle } from '../../hooks/usePageTitle'
import { getFileUrl } from '../../utils/urls'
import * as authApi from '../../api/auth.api'
import axios from 'axios'

const ProfilePage = () => {
  usePageTitle('Profile')

  const { user, logout, refreshUser } = useAuth()
  const { openChangePassword } = useChangePassword()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [avatarName, setAvatarName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const phoneValid = isValidPhoneNumber(form.phone)
  const initialForm = useMemo(
    () => ({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    }),
    [user?.name, user?.email, user?.phone],
  )
  const hasChanges =
    form.name !== initialForm.name ||
    form.email !== initialForm.email ||
    form.phone !== initialForm.phone ||
    Boolean(avatarFile)

  const handleSave = async () => {
    setError('')
    if (!phoneValid) {
      setError('Phone number format is invalid.')
      return
    }
    setIsSubmitting(true)
    setMessage('')
    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('email', form.email)
      if (form.phone) {
        payload.append('phone', form.phone)
      }
      if (avatarFile) {
        payload.append('avatar', avatarFile)
      }
      const response = await authApi.updateProfile(payload)
      const updatedUser = response.data.data
      if (updatedUser) {
        setForm({
          name: updatedUser.name ?? '',
          email: updatedUser.email ?? '',
          phone: updatedUser.phone ?? '',
        })
        setAvatarPreview(getFileUrl(updatedUser.avatar))
      }
      await refreshUser()
      setAvatarFile(null)
      setAvatarName('')
      setMessage(response.data.message ?? 'Profile updated successfully.')
      toast.success('Profile saved.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message
        setError(apiMessage ?? 'Unable to update profile.')
      } else {
        setError('Unable to update profile.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleAvatarChange = (file?: File) => {
    setAvatarError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Only image files are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Maximum file size is 2 MB.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarName(file.name)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    handleAvatarChange(event.dataTransfer.files?.[0])
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Profile</h1>
        <p className="mt-2 text-sm text-ink-muted">Manage your account details.</p>
      </div>
      <Card title="Profile information" subtitle="Keep your details up to date.">

        <div>
          {error ? <Alert title={error} tone="error" /> : null}
          {message ? <Alert title={message} tone="success" /> : null}
        </div>
        <form className="grid gap-6 md:grid-cols-2">

          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-muted px-4 py-6 text-center text-sm text-ink-muted hover:border-primary-200"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <span className="text-sm font-semibold text-ink">Avatar (optional)</span>
            <span>Drag & drop an image, or click to browse</span>
            <span className="text-xs text-ink-subtle">PNG, JPG up to 2 MB</span>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => handleAvatarChange(event.target.files?.[0])}
            />
            {avatarName ? <span className="text-xs text-ink">{avatarName}</span> : null}
            {avatarError ? <span className="text-xs text-rose-600">{avatarError}</span> : null}
            {avatarPreview || user?.avatar ? (
              <img
                className="mt-2 h-16 w-16 rounded-full object-cover"
                src={avatarPreview ?? getFileUrl(user?.avatar) ?? ''}
                alt="Avatar preview"
              />
            ) : null}
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button
              type="button"
              isLoading={isSubmitting}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={openChangePassword}>
              Change password
            </Button>
            <Button type="button" variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ProfilePage
