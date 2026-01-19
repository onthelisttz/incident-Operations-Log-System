import Container from './Container'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const Header = () => {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-surface/90 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold tracking-wide text-white">
            IO
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-ink">Incident &amp; Operations</p>
            <p className="text-xs text-ink-subtle">Log System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-muted md:flex">
            <a className="relative hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full" href="#features">
              Features
            </a>
            <a className="relative hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full" href="#workflow">
              Workflow
            </a>
            <a className="relative hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full" href="#contact">
              Contact
            </a>
            {isAuthenticated ? (
              <a
                className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary-200 hover:text-primary-600"
                href="/app/profile"
              >
                Profile
              </a>
            ) : (
            <a
              className="inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary-200 hover:text-primary-600"
              href="/login"
            >
              Login
            </a>
            )}
          </nav>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-line px-3 py-2 text-ink md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            type="button"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </Container>
      {open ? (
        <div className="border-t border-line bg-surface-muted px-6 py-4 md:hidden">
          <div className="mb-3 flex items-center justify-between text-sm font-medium text-ink-muted">
            <a
              className="relative inline-flex w-fit hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full"
              href="#features"
              onClick={() => setOpen(false)}
            >
              Features
            </a>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-line p-2"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-3 text-sm font-medium text-ink-muted">
            <a className="relative inline-flex w-fit hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full" href="#workflow" onClick={() => setOpen(false)}>
              Workflow
            </a>
            <a className="relative inline-flex w-fit hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full" href="#contact" onClick={() => setOpen(false)}>
              Contact
            </a>
            {isAuthenticated ? (
              <a
                className="relative inline-flex w-fit hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full"
                href="/app/profile"
                onClick={() => setOpen(false)}
              >
                Profile
              </a>
            ) : (
              <a
                className="relative inline-flex w-fit hover:text-primary-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-200 hover:after:w-full"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Login
              </a>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Header
