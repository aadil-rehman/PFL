import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowToJoin from '../components/HowToJoin'
import Leaderboard from '../components/leaderboard/Leaderboard'
import ImpactMap from '../components/impact/ImpactMap'
import Footer from '../components/Footer'
import NoDonationBanner from '../components/NoDonationBanner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1a10]">
      <Navbar />
      <Hero />
      <HowToJoin />
      <ImpactMap />
      <Leaderboard />
      <Footer />
      <NoDonationBanner />
    </main>
  )
}
