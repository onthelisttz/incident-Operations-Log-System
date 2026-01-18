import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useChangePassword } from '../../contexts/ChangePasswordContext'
import ConfirmDialog from '../common/ConfirmDialog'
import { getFileUrl } from '../../utils/urls'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { openChangePassword } = useChangePassword()
  const [open, setOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const handleLogout = async () => {
    await logout()
    setConfirmLogout(false)
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold ${isActive ? 'text-primary-600' : 'text-ink-muted'} hover:text-primary-600`

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const openLogoutConfirm = () => {
    setOpen(false)
    setMobileOpen(false)
    setConfirmLogout(true)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-[11px] font-bold tracking-wide text-white">
            IO
          </div>
          <span className="hidden text-sm font-semibold text-ink sm:inline">
            Incident &amp; Operations Log System
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/app/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/app/incidents" className={linkClass}>
              Incidents
            </NavLink>
            {user?.role === 'admin' ? (
              <NavLink to="/app/users" className={linkClass}>
                Users
              </NavLink>
            ) : null}
          </nav>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-line p-1.5 text-ink md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div className="relative hidden md:block" ref={menuRef}>
            <button
              className="flex items-center gap-3 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-primary-200"
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                {user?.role ?? 'user'}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 overflow-hidden">
                {user?.avatar ? (
                  <img
                    className="h-full w-full object-cover"
                    src={getFileUrl(user.avatar) ?? ''}
                    alt={user.name ?? 'User'}
                  />
                ) : (
                  user?.name?.slice(0, 1) ?? 'U'
                )}
              </span>
            </button>
            {open && !confirmLogout ? (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-line bg-surface p-3 shadow-xl">
                <div className="border-b border-line pb-3 text-xs text-ink-muted">
                  <p className="font-semibold text-ink">{user?.name ?? 'Signed in'}</p>
                  <p className="text-[11px]">{user?.role ?? ''}</p>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <NavLink
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                    to="/app/profile"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-xs" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 21C20 17.134 16.418 14 12 14C7.582 14 4 17.134 4 21"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </span>
                    Profile details
                  </NavLink>
                  <button
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                    onClick={() => {
                      setOpen(false)
                      openChangePassword()
                    }}
                    type="button"
                  >
                    <span className="text-xs" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect
                          x="5"
                          y="11"
                          width="14"
                          height="9"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M8 11V8.5C8 6.015 9.791 4 12 4C14.209 4 16 6.015 16 8.5V11"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    Change password
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-surface-muted hover:text-primary-600"
                    onClick={openLogoutConfirm}
                    type="button"
                  >
                    <span className="text-xs" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M10 17L6 12L10 7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 12H14C17.314 12 20 9.314 20 6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-line bg-surface px-6 py-4 md:hidden">
          <div className="mb-3 flex items-center justify-between text-sm font-medium text-ink-muted">
            <span className="text-xs font-semibold text-ink-subtle">Navigation</span>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-line p-2"
              onClick={() => setMobileOpen(false)}
              type="button"
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <NavLink to="/app/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/app/incidents" className={linkClass} onClick={() => setMobileOpen(false)}>
              Incidents
            </NavLink>
            {user?.role === 'admin' ? (
              <NavLink to="/app/users" className={linkClass} onClick={() => setMobileOpen(false)}>
                Users
              </NavLink>
            ) : null}
            <NavLink to="/app/profile" className={linkClass} onClick={() => setMobileOpen(false)}>
              Profile details
            </NavLink>
            <button
              className="text-left text-sm font-semibold text-ink-muted hover:text-primary-600"
              onClick={() => {
                setMobileOpen(false)
                openChangePassword()
              }}
              type="button"
            >
              Change password
            </button>
            <button
              className="text-left text-sm font-semibold text-ink-muted hover:text-primary-600"
              onClick={openLogoutConfirm}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        isOpen={confirmLogout}
        title="Confirm logout"
        description="Are you sure you want to logout from the system?"
        confirmLabel="Logout"
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
      />
    </header>
  )
}

export default Header
