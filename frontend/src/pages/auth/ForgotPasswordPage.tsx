import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import toast from 'react-hot-toast'
import * as authApi from '../../api/auth.api'
import axios from 'axios'
import { usePageTitle } from '../../hooks/usePageTitle'
import { isValidEmail } from '../../utils/validators'

const ForgotPasswordPage = () => {
  usePageTitle('Forgot password')

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const emailValid = isValidEmail(email)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!emailValid) {
      setError('Please enter a valid email address.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await authApi.forgotPassword({ email })
      setSubmitted(true)
      setMessage(response.data.message ?? 'Reset email sent successfully.')
      toast.success(response.data.message ?? 'Reset email sent successfully.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message
        setError(apiMessage ?? 'Unable to send reset email. Please try again.')
      } else {
        setError('Unable to send reset email. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">Forgot password</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email and we will send a reset link.
        </p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert title="Request failed" description={error} tone="error" /> : null}
        {message ? <Alert title={message} tone="success" /> : null}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />
      
        <Button className="w-full" type="submit" isLoading={isSubmitting}>
          {submitted ? 'Resend email' : 'Send reset link'}
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

export default ForgotPasswordPage
