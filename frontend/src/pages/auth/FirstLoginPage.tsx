import { useState } from 'react'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import toast from 'react-hot-toast'
import PasswordInput from '../../components/common/PasswordInput'
import PasswordStrength from '../../components/common/PasswordStrength'
import { getPasswordStrength } from '../../utils/password'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import * as authApi from '../../api/auth.api'
import axios from 'axios'

const FirstLoginPage = () => {
  usePageTitle('First login')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const passwordStatus = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (!passwordStatus.isStrong) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!passwordsMatch) {
      setError('Password confirmation does not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await authApi.firstLoginPassword({
        password,
        password_confirmation: confirmPassword,
      })
      setMessage('Password updated. Please login again.')
      toast.success('Password updated.')
      navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message
        setError(apiMessage ?? 'Unable to update password.')
      } else {
        setError('Unable to update password.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">First login</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Welcome! Please change your password to continue.
        </p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert title={error} tone="error" /> : null}
        {message ? <Alert title={message} tone="success" /> : null}
        <PasswordInput
          label="New password"
          value={password}
          onChange={setPassword}
          required
        />
        <PasswordStrength password={password} />
        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
        />
        <Button
          className="w-full"
          type="submit"
          isLoading={isSubmitting}
        >
          Update password
        </Button>
      </form>
    </div>
  )
}

export default FirstLoginPage
