import Container from './Container'

const workflowSteps = [
  {
    step: '01',
    title: 'Open',
    description: 'Reported incidents start here and wait for assignment.',
  },
  {
    step: '02',
    title: 'Investigating',
    description: 'Operators capture updates and begin remediation.',
  },
  {
    step: '03',
    title: 'Resolved',
    description: 'Fixes are applied and shared for confirmation.',
  },
  {
    step: '04',
    title: 'Closed',
    description: 'Issues are confirmed and archived for reporting.',
  },
]

const Workflow = () => {
  return (
    <section className="bg-surface-muted py-16 sm:py-20" id="workflow">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Clear incident workflow
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Follow each issue from first report to closure.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step) => (
            <article
              key={step.step}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-sm font-semibold text-primary-600">
                {step.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Workflow
