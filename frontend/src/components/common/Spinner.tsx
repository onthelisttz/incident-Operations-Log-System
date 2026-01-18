type SpinnerProps = {
  className?: string
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 ${
          className ?? ''
        }`}
      />
    </div>
  )
}

export default Spinner
