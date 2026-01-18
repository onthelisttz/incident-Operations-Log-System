import { useState } from 'react'
import Button from '../common/Button'
import Alert from '../common/Alert'
import * as authApi from '../../api/auth.api'
import toast from 'react-hot-toast'
import PasswordInput from '../common/PasswordInput'
import PasswordStrength from '../common/PasswordStrength'
import { getPasswordStrength } from '../../utils/password'

type ChangePasswordFormProps = {
  onSuccess?: () => void
}

const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const passwordStatus = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')
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
      await authApi.changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmPassword,
      })
      setMessage('Password updated successfully.')
      toast.success('Password changed.')
      onSuccess?.()
    } catch {
      setError('Unable to change password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? <Alert title="Password update failed" description={error} tone="error" /> : null}
      {message ? <Alert title={message} tone="success" /> : null}
      <PasswordInput
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        required
      />
      <PasswordInput
        label="New password"
        value={password}
        onChange={setPassword}
        required
      />
      <PasswordStrength password={password} />
   
      <PasswordInput
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
      />
   
      <Button type="submit" isLoading={isSubmitting}>
        Update password
      </Button>
    </form>
  )
}

export default ChangePasswordForm
