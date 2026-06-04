import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import NoDonationBanner from '../components/NoDonationBanner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1a10]">
      <Navbar />
      <Hero />
      <NoDonationBanner />
    </main>
  )
}
