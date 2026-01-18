import Container from './Container'

const ContactInfo = () => {
  return (
    <section className="py-16 sm:py-20" id="contact">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
              Contact info
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">
              Matheos Techs
            </h2>
            <p className="mt-3 text-sm text-ink-muted sm:text-base">
              Reach us on WhatsApp for inquiries, onboarding, or support.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              className="inline-flex items-center rounded-full bg-success-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-success-700"
              href="https://api.whatsapp.com/send/?phone=255758727575&text&type=phone_number&app_absent=0"
              rel="noreferrer"
              target="_blank"
            >
              Chat on WhatsApp
            </a>
            <p className="text-sm font-semibold text-ink-muted">+255 758 727 575</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default ContactInfo
