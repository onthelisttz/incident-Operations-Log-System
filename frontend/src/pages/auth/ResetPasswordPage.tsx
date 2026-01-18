import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import toast from 'react-hot-toast'
import * as authApi from '../../api/auth.api'
import PasswordInput from '../../components/common/PasswordInput'
import PasswordStrength from '../../components/common/PasswordStrength'
import { getPasswordStrength } from '../../utils/password'
import axios from 'axios'
import { usePageTitle } from '../../hooks/usePageTitle'

const ResetPasswordPage = () => {
  usePageTitle('Reset password')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const passwordStatus = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email || !token) {
      setError('Reset link is invalid or missing.')
      return
    }
    if (!passwordStatus.isStrong) {
      setError('Password is not strong enough.')
      return
    }
    if (!passwordsMatch) {
      setError('Password confirmation does not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await authApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      })
      setSubmitted(true)
      toast.success('Password updated successfully.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message
        setError(apiMessage ?? 'Unable to reset password. Please verify the details.')
      } else {
        setError('Unable to reset password. Please verify the details.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">Reset password</h1>
        <p className="mt-2 text-sm text-ink-muted">Set a new password to regain access.</p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert title="Reset failed" description={error} tone="error" /> : null}
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
        {submitted ? (
          <Alert title="Password updated" description="You can now login." tone="success" />
        ) : null}
        <Button
          className="w-full"
          type="submit"
          isLoading={isSubmitting}
        >
          Update password
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-ink-muted">
        <Link className="text-primary-600 hover:text-primary-700" to="/login">
          Back to login
        </Link>
      </div>
    </div>
  )
}

export default ResetPasswordPage
