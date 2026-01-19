import Container from './Container'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-surface-muted py-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-ink">
            Incident & Operations Log System
            </p>
            <p className="mt-2 text-sm text-ink-subtle">
              Operational clarity for teams that need it most.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-ink-muted">
            <a className="hover:text-primary-600" href="#features">
              Features
            </a>
            <a className="hover:text-primary-600" href="#workflow">
              Workflow
            </a>
            <a className="hover:text-primary-600" href="#contact">
              Contact
            </a>
            <a className="hover:text-primary-600" href="/login">
              Login
            </a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-ink-subtle">
          Developed by Matheos Techs  © {currentYear}. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}

export default Footer
