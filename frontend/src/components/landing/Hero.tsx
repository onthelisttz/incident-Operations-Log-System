import Container from './Container'
import { useAuth } from '../../hooks/useAuth'

const Hero = () => {
  const { isAuthenticated } = useAuth()
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
            Incident &amp; Operations Log System
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Incident Management <br />
            <span className="text-primary-600">Made Simple</span>
          </h1>
          <p className="mt-5 text-base text-ink-muted sm:text-lg">
            Centralize reporting, assignments, and updates in one system so your team
            can keep operations running smoothly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {!isAuthenticated ? (
              <a
                className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700"
                href="/login"
              >
                Login to System
              </a>
            ) : null}
            <a
              className="inline-flex items-center rounded-full bg-primary-50 px-6 py-3 text-sm font-semibold text-primary-600 transition hover:bg-primary-100"
              href="#features"
            >
              Explore Features
            </a>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-ink">Role-Based Access</p>
              <p className="text-sm text-ink-subtle">Admin, Operator, Reporter</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Incident Lifecycle</p>
              <p className="text-sm text-ink-subtle">Open → Closed</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">CSV Export</p>
              <p className="text-sm text-ink-subtle">Filtered data downloads</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-gradient-to-br from-primary-100/70 via-surface to-surface p-6 shadow-xl">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-status-open-bg px-3 py-1 text-xs font-semibold text-status-open-text">
                Open
              </span>
              <span className="rounded-full bg-status-investigating-bg px-3 py-1 text-xs font-semibold text-status-investigating-text">
                Investigating
              </span>
              <span className="rounded-full bg-status-resolved-bg px-3 py-1 text-xs font-semibold text-status-resolved-text">
                Resolved
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Operational Overview</h2>
                <p className="mt-2 text-sm text-ink-subtle">
                  Stay aligned with real-time incident status updates and clear ownership
                  across teams.
                </p>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
                    Priority
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    Critical, High, Medium, Low
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
                    Attachments
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    Evidence and supporting files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default Hero
