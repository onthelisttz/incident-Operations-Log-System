import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  tone?: 'neutral' | 'primary' | 'success'
}

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-surface-muted text-ink-muted',
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success-50 text-success-700',
}

const Badge = ({ children, tone = 'neutral' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[tone]}`}>
      {children}
    </span>
  )
}

export default Badge
