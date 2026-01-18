import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import SelectInput from '../../components/common/SelectInput'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import * as usersApi from '../../api/users.api'
import toast from 'react-hot-toast'
import { usePageTitle } from '../../hooks/usePageTitle'

const CreateUserPage = () => {
  usePageTitle('Create user')

  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'reporter',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await usersApi.createUser(form)
      toast.success('User created and welcome email sent.')
      navigate('/app/users')
    } catch {
      setError('Unable to create user. Please verify the details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Create user</h1>
        <p className="mt-2 text-sm text-ink-muted">Add a new user to the system.</p>
      </div>
      <Card>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          {error ? <Alert title="Unable to create user" description={error} tone="error" /> : null}
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            required
          />
          <SelectInput
            label="Role"
            value={form.role}
            onChange={(value) => handleChange('role', value)}
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
            onChange={(event) => handleChange('phone', event.target.value)}
            placeholder="+255..."
          />
          <Button type="submit" isLoading={isSubmitting}>
            Create user
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CreateUserPage
