import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
}

const Card = ({ title, subtitle, children }: CardProps) => {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      {title ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          {subtitle ? <p className="text-sm text-ink-muted">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export default Card
