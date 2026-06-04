import { useState } from 'react'

const navLinks = ['How It Works', 'Plant Now', 'Leaderboard', 'Prizes']

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold text-white">
          Green<span className="text-green-400">Wave</span>
        </span>
        <span className="text-xl">🌱</span>
      </a>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm text-white/80 hover:text-white transition-colors font-medium"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-3">
        <a
          href="#"
          className="text-sm text-white/80 hover:text-white font-medium transition-colors"
        >
          Sign In
        </a>
        <button className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-400 transition-colors">
          <span className="text-white text-lg leading-none">≡</span>
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white text-2xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0b1a10]/95 backdrop-blur-sm border-t border-white/10 flex flex-col px-6 py-4 gap-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-white/80 hover:text-white text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <a href="#" className="text-white/80 text-sm font-medium">Sign In</a>
        </div>
      )}
    </nav>
  )
}
