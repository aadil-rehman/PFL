import { useState } from 'react'
import { useAuth } from './auth/AuthContext'

const navLinks = [
  { label: 'Mission', href: '#mission' },
  { label: 'Join', href: '#join' },
  { label: 'Leaderboard', href: '#leaderboard' },
]

function scrollToSection(e, href) {
  if (!href.startsWith('#')) return
  e.preventDefault()
  const el = document.getElementById(href.slice(1))
  el?.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, user, openLogin, logout } = useAuth()

  const firstName = user?.name?.split(' ')[0] ?? 'Planter'

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15 text-green-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 4 13C4 8 8 4 18 4c1 9-3 13-7 14a4 4 0 0 1-7 0" />
            <path d="M2 21c0-4 4-9 9-11" />
          </svg>
        </span>
        <span className="text-2xl font-bold text-white">
          PollutionFree<span className="text-green-400">Loni</span>
        </span>
      </a>

      {/* Desktop right group — links + actions */}
      <div className="hidden md:flex items-center gap-10">
        <ul className="flex items-center gap-9">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="font-nav text-[15px] text-white/80 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {isLoggedIn ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold uppercase text-green-300">
              {firstName[0]}
            </span>
            <button
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={openLogin}
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Sign In
          </button>
        )}
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
              key={link.label}
              href={link.href}
              className="font-nav text-xs uppercase tracking-[0.2em] text-white/80 hover:text-white font-medium"
              onClick={(e) => {
                scrollToSection(e, link.href)
                setMenuOpen(false)
              }}
            >
              {link.label}
            </a>
          ))}
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout()
                setMenuOpen(false)
              }}
              className="text-left text-white/80 text-sm font-medium"
            >
              Logout ({firstName})
            </button>
          ) : (
            <button
              onClick={() => {
                openLogin()
                setMenuOpen(false)
              }}
              className="text-left text-white/80 text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
