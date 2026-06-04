import { useState, useRef, useEffect } from 'react'
import heroBg from '../assets/heroo.png'

const VIDEO_URL = 'https://ik.imagekit.io/insaan/app/work.mp4'

export default function Hero() {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
    const t = setTimeout(() => setPlaying(true), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${playing ? 'opacity-0' : 'opacity-100'}`}
        />
        <video
          ref={videoRef}
          src={VIDEO_URL}
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${playing ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* ── Left content — vertically centred ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-green-400/40 bg-green-400/10 rounded-full px-3 py-1 w-fit mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-[0.18em] text-green-300 uppercase">
            Pollution Free Loni Mission
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-[3.75rem] font-black text-white leading-[1.3] mb-5 tracking-tight">
          एक पौधा,<br />
          <span className="text-green-400">हर घर पौधा।</span>
        </h1>

        {/* Divider */}
        <div className="w-12 h-0.5 bg-green-500 rounded-full mb-5" />

        {/* Body */}
        <p className="text-white/70 text-sm md:text-[15px] leading-relaxed mb-8 max-w-sm">
          Loni is the <span className="text-white font-semibold">world's most polluted city.</span> We're changing that: one tree at a time. Join us in planting{' '}
          <span className="text-green-400 font-semibold">1,00,000 trees</span> and give Loni the future it deserves.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 text-white font-bold px-7 py-3.5 rounded-full transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 text-sm tracking-wide">
            🌱 Plant My Tree
          </button>
          <button className="flex items-center gap-2 text-white/75 hover:text-white font-medium px-6 py-3.5 rounded-full border border-white/20 hover:border-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/5 text-sm">
            See the Mission →
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { value: '7,348', label: 'Trees Planted' },
            { value: '2,658', label: 'Participants' },
            { value: '9 days', label: 'Remaining' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-bold text-base leading-none">{s.value}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Play / Pause ── */}
      <button
        onClick={() => {
          const v = videoRef.current
          if (!v) return
          if (playing) {
            v.pause()
            setPlaying(false)
          } else {
            v.muted = false
            v.play().then(() => setPlaying(true)).catch(() => {})
          }
        }}
        className="absolute bottom-8 right-8 md:right-12 z-10 flex items-center gap-3 group"
      >
        <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-semibold group-hover:text-white/70 transition-colors">
          {playing ? 'Pause' : 'Play Video'}
        </span>
        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-green-500/50 group-hover:border-green-400/50 transition-all">
          <span className="text-white text-xs ml-0.5">{playing ? '⏸' : '▶'}</span>
        </div>
      </button>

    </section>
  )
}
