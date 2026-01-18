import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import Alert from '../../components/common/Alert'
import toast from 'react-hot-toast'
import axios from 'axios'
import PasswordInput from '../../components/common/PasswordInput'
import { usePageTitle } from '../../hooks/usePageTitle'
import { isValidEmail } from '../../utils/validators'

const LoginPage = () => {
  usePageTitle('Login')

  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const emailValid = isValidEmail(email)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!emailValid) {
      setError('Please enter a valid email address.')
      return
    }
    try {
      setIsSubmitting(true)
      const requiresPasswordChange = await login(email, password)
      toast.success('Login successful.')
      if (requiresPasswordChange) {
        navigate('/first-login')
        return
      }
      navigate('/app/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message
        setError(message ?? 'Login failed. Please check your credentials.')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-muted">Login to Incident &amp; Operations Log System.</p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <Alert title="Unable to sign in" description={error} tone="error" />
        ) : null}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />
    
        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
        />
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-line" />
            Remember me
          </label>
          <Link className="text-primary-600 hover:text-primary-700" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" type="submit" isLoading={isSubmitting} disabled={!emailValid}>
          Login
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-ink-muted">
        <Link className="text-primary-600 hover:text-primary-700" to="/">
          Back to landing page
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
