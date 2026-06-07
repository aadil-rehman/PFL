const WORK_URL = 'https://workglobal.in/'

export default function Footer() {
  return (
    <footer id="mission" className="relative overflow-hidden border-t border-white/10 bg-[#0b1a10] px-6 pt-20 pb-28 md:px-12 scroll-mt-24">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-green-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          {/* Mission */}
          <div>
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-green-500/15 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300">
                Our Mission
              </span>
            </div>
            <h2 className="font-serif-display max-w-lg text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
              Loni breathes the world's worst air. We're changing that, one tree
              at a time. 🌱
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
              Our goal is simple: plant 1,00,000 trees across Loni and give this
              city the clean air it deserves. No donations, no middlemen, just
              ordinary people planting trees where they live.
            </p>
          </div>

          {/* Initiative by WORK */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-300/70">
              An initiative by
            </p>
            <p className="font-serif-display mt-1.5 text-2xl font-semibold text-white">
              WORK
            </p>
            <p className="text-xs text-white/40">
              World Organisation of Religions &amp; Knowledge
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              A charitable trust working to nurture compassion and build a
              connected society through peace, unity, service, knowledge, and
              cooperation, including the care of our environment.
            </p>
            <a
              href={WORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-xs font-bold text-[#0b1a10] transition-all duration-200 hover:bg-green-400 active:scale-95"
            >
              Read more about WORK →
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} HaritLoni · An initiative by{' '}
            <a
              href={WORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-300 transition-colors hover:text-green-200"
            >
              WORK
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
