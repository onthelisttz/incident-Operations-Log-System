import { getPasswordStrength } from '../../utils/password'

type PasswordStrengthProps = {
  password: string
}

const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
const barClasses = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-600']

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const { score } = getPasswordStrength(password)
  const level = Math.min(score, 4)

  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-surface-muted">
        <div
          className={`h-2 rounded-full transition-all ${barClasses[level]}`}
          style={{ width: `${(level / 4) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-ink-muted">Password strength: {labels[level]}</p>
    </div>
  )
}

export default PasswordStrength
