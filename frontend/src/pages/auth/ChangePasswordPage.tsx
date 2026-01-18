import ChangePasswordForm from '../../components/auth/ChangePasswordForm'

const ChangePasswordPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Change password</h1>
      <p className="mt-2 text-sm text-ink-muted">Update your current password.</p>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  )
}

export default ChangePasswordPage
