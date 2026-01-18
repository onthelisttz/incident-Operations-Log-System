import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const NotFoundPage = () => {
  usePageTitle('Not found')

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-ink-muted">
          The page you are looking for does not exist.
        </p>
        <Link
          className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
