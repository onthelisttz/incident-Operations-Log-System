import Container from './Container'

const features = [
  {
    title: 'Track Incidents',
    description: 'Create, categorize, and prioritize incidents with a clear audit trail.',
  },
  {
    title: 'Assign & Manage',
    description: 'Route incidents to operators and keep ownership transparent.',
  },
  {
    title: 'Real-Time Updates',
    description: 'Keep stakeholders informed with status changes and timeline notes.',
  },
  {
    title: 'Reports & Export',
    description: 'Export filtered data to CSV for reporting and compliance.',
  },
]

const Features = () => {
  return (
    <section className="py-16 sm:py-20" id="features">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Built for incident operations
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Everything you need to keep incidents visible, owned, and resolved.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm text-ink-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Features
