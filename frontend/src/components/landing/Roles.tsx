import Container from './Container'

const roles = [
  {
    title: 'Admin',
    description: 'Manages users, settings, and system-wide oversight.',
  },
  {
    title: 'Operator',
    description: 'Owns investigations, updates status, and resolves incidents.',
  },
  {
    title: 'Reporter',
    description: 'Creates incidents and tracks updates on submissions.',
  },
]

const Roles = () => {
  return (
    <section className="py-16 sm:py-20" id="roles">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Roles with clear responsibilities
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Each role gets the right tools to keep incidents moving.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-ink">{role.title}</h3>
              <p className="mt-3 text-sm text-ink-muted">{role.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Roles
