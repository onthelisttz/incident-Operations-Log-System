type EmptyStateProps = {
  title: string
  description?: string
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-line bg-surface-muted p-8 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm text-ink-muted">{description}</p> : null}
    </div>
  )
}

export default EmptyState
