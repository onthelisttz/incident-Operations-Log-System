import type { ReactNode } from 'react'

type AlertProps = {
  title: string
  description?: string
  tone?: 'error' | 'success' | 'info'
}

const toneStyles: Record<NonNullable<AlertProps['tone']>, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-success-50 bg-success-50 text-success-700',
  info: 'border-primary-100 bg-primary-50 text-primary-600',
}

const Alert = ({ title, description, tone = 'info' }: AlertProps) => {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${toneStyles[tone]}`}>
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1">{description}</p> : null}
    </div>
  )
}

export default Alert
