import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import { ChangePasswordProvider } from '../../contexts/ChangePasswordContext'

const AppLayout = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/unauthorized') {
      sessionStorage.setItem('last_route', location.pathname)
    }
  }, [location.pathname])

  return (
    <ChangePasswordProvider>
      <div className="flex min-h-screen flex-col bg-surface text-ink">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <Outlet />
        </main>
        <footer className="border-t border-line bg-surface-muted py-6">
          <div className="mx-auto w-full max-w-6xl px-6 text-center text-xs text-ink-subtle">
            Developed by Matheos Techs © {new Date().getFullYear()}. All rights reserved.
          </div>
        </footer>
      </div>
    </ChangePasswordProvider>
  )
}

export default AppLayout
