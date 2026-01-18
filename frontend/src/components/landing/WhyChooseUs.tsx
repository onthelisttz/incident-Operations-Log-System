import Container from './Container'

const reasons = [
  {
    title: 'Role-based access',
    description: 'Admins, operators, and reporters each have tailored access.',
  },
  {
    title: 'Clear incident workflow',
    description: 'Move from open to closed with visible status transitions.',
  },
  {
    title: 'Trusted notifications',
    description: 'Email alerts keep stakeholders updated at key moments.',
  },
  {
    title: 'Export-ready reporting',
    description: 'Download filtered CSV reports for audits and reviews.',
  },
]

const WhyChooseUs = () => {
  return (
    <section className="bg-surface-muted py-16 sm:py-20" id="why-us">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Why choose us
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Built around operational clarity, accountability, and faster resolution.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-ink">{reason.title}</h3>
              <p className="mt-3 text-sm text-ink-muted">{reason.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default WhyChooseUs
