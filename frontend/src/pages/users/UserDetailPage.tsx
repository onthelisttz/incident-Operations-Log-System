import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import SelectInput from '../../components/common/SelectInput'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePageTitle } from '../../hooks/usePageTitle'

const UserDetailPage = () => {
  usePageTitle('User details')

  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'reporter',
    phone: '',
  })

  const handleSave = () => {
    setIsSubmitting(true)
    setMessage('')
    setTimeout(() => {
      toast.success('User details saved.')
      setMessage('Changes saved successfully.')
      setIsSubmitting(false)
    }, 400)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">User details</h1>
        <p className="mt-2 text-sm text-ink-muted">Update user profile and role.</p>
      </div>
      <Card>
        <form className="grid gap-6">
          {message ? <Alert title={message} tone="success" /> : null}
          <Input
            label="Full name"
            placeholder="User name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="user@company.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <SelectInput
            label="Role"
            value={form.role}
            onChange={(value) => setForm({ ...form, role: value })}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Operator', value: 'operator' },
              { label: 'Reporter', value: 'reporter' },
            ]}
          />
          <Input
            label="Phone"
            placeholder="+255 ..."
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <Button type="button" isLoading={isSubmitting} onClick={handleSave}>
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default UserDetailPage
