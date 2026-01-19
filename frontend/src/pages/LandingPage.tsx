import Footer from '../components/landing/Footer'
import Header from '../components/landing/Header'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import Workflow from '../components/landing/Workflow'
import Roles from '../components/landing/Roles'
import ContactInfo from '../components/landing/ContactInfo'
import { usePageTitle } from '../hooks/usePageTitle'

const LandingPage = () => {
  usePageTitle('Home')

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Roles />
        <ContactInfo />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
