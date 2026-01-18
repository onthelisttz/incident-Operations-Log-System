import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold tracking-wide text-white">
              IO
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
