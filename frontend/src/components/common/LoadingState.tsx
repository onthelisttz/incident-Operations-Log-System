import Spinner from './Spinner'

type LoadingStateProps = {
  label?: string
}

const LoadingState = ({ label = 'Loading...' }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface-muted px-6 py-10 text-sm text-ink-muted">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

export default LoadingState
