import { useState, useRef, useEffect } from 'react'
import heroBg from '../assets/heroo.png'
import { useSubmitPanel } from './submit/SubmitPanelContext'
import { fetchCampaignSummary } from '../api/plants'

const VIDEO_URL = 'https://ik.imagekit.io/insaan/app/work.mp4'

const nf = new Intl.NumberFormat('en-IN')

// Whole days remaining until the campaign deadline.
function daysRemaining(endDate) {
  const diffMs = Math.max(new Date(endDate).getTime() - Date.now(), 0)
  return Math.ceil(diffMs / 86400000)
}

// Animates a number from its current value up to `value` with an ease-out
// curve. Re-runs whenever `value` changes — so each stat counts up from 0 the
// first time the live data lands.
function CountUp({ value, duration = 1400 }) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const rafRef  = useRef(0)

  useEffect(() => {
    const from  = fromRef.current
    const start = performance.now()
    const ease  = (t) => 1 - Math.pow(1 - t, 3)

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setDisplay(from + (value - from) * ease(t))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = value
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return nf.format(Math.round(display))
}

export default function Hero() {
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const [summary, setSummary] = useState(null)
  const [, tick] = useState(0)
  const videoRef = useRef(null)
  const { openPanel } = useSubmitPanel()

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // Autoplay must start muted — browsers block sound until a user gesture.
    v.muted = true
    v.play().catch(() => {})
    const t = setTimeout(() => setPlaying(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const next = !v.muted
    v.muted = next
    if (!next) v.play().catch(() => {})
    setMuted(next)
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => {})
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
  }

  // Live campaign stats from the API.
  useEffect(() => {
    let active = true
    fetchCampaignSummary()
      .then((data) => { if (active) setSummary(data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Re-render every 30s so the countdown stays current (minute precision).
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const endDate = summary?.campaign?.endDate

  // Raw numbers (or null before data lands) — each tile counts up from 0 to these.
  const stats = [
    { value: summary?.treesPlanted ?? 0, label: 'Trees Planted' },
    { value: summary?.toGo ?? 0,         label: 'To Go' },
    { value: summary?.participants ?? 0, label: 'Participants' },
    { value: endDate ? daysRemaining(endDate) : null, label: 'Days Remaining' },
  ]

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${playing && !paused ? 'opacity-0' : 'opacity-100'}`}
        />
        <video
          ref={videoRef}
          src={VIDEO_URL}
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${playing && !paused ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* ── Centered content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 md:pt-16">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-green-400/40 bg-green-400/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.18em] text-green-300 uppercase">
            🌍 Pollution Free Loni Mission
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-devanagari text-5xl md:text-[4.25rem] font-normal text-white leading-[1.05] mb-6 tracking-tight">
          एक पौधा,<br />
          <span className="text-green-400">हर घर पौधा।</span>
        </h1>

        {/* Body */}
        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
          Loni is the{' '}
          <span className="text-white font-semibold">world's most polluted city</span> but one sapling from every home can change that.

        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={openPanel}
            className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-green-700 active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Plant My Tree
          </button>
          <button
            onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-white/85 hover:text-white font-medium px-6 py-3 rounded-full border border-white/25 hover:border-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/5 text-sm"
          >
            How to Join →
          </button>
        </div>
      </div>

      {/* ── Bottom stats bar ── */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center justify-center py-6 px-4 text-center ${i > 0 ? 'md:border-l border-white/10' : ''}`}
            >
              <p className="text-green-400 font-bold text-3xl md:text-4xl leading-none">
                {s.value === null ? '—' : <CountUp value={s.value} />}
              </p>
              <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Video controls (only once the video is playing) ── */}
      {playing && (
        <div className="absolute bottom-52 right-4 sm:bottom-28 sm:right-8 md:right-12 z-10 flex items-center gap-2 sm:gap-3">
          <button
            onClick={togglePlay}
            aria-label={paused ? 'Play video' : 'Pause video'}
            className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-green-500/50 hover:border-green-400/50"
          >
            <span className="text-sm sm:text-base">{paused ? '▶' : '⏸'}</span>
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-green-500/50 hover:border-green-400/50"
          >
            <span className="text-sm sm:text-base">{muted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      )}

    </section>
  )
}
