const steps = [
  {
    num: '01',
    icon: '🌱',
    title: 'Plant Something',
    desc: 'Put a tree, shrub, or sapling in the ground anywhere you can. Your garden, your school, a rooftop, or a corner of your street.',
  },
  {
    num: '02',
    icon: '📸',
    title: 'Snap a Photo',
    desc: 'Take a picture with your plant. Make it fun. Show your smile and your hands in the soil.',
  },
  {
    num: '03',
    icon: '📍',
    title: 'Add Location',
    desc: 'Tag where you planted. Your tree lands on our live map for the whole community to see.',
  },
  {
    num: '04',
    icon: '🏆',
    title: 'Climb the Board',
    desc: 'Every plant earns you points. The more you plant, the higher you rank and the prouder you stand.',
  },
]

export default function HowToJoin() {
  return (
    <section id="join" className="relative bg-[#f7f3e9] px-8 md:px-16 py-20 md:py-28 overflow-hidden scroll-mt-24">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative">
        {/* ── Heading block ── */}
        <div className="max-w-xl mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 w-fit rounded-full bg-green-200/70 px-4 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-green-800 uppercase">
              Simple Steps
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-serif-display text-5xl md:text-6xl font-semibold text-[#143524] leading-[1.08] mb-6 tracking-tight">
            How to Join<br />
            HaritLoni
          </h2>

          {/* Body */}
          <p className="text-[#5b6b60] text-base md:text-lg leading-relaxed max-w-md">
            No fees, no forms, no waiting. Plant something, capture the moment, and watch your name rise up the board.
          </p>
        </div>

        {/* ── Step cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="group relative bg-white/80 backdrop-blur-sm rounded-[1.25rem] p-7 ring-1 ring-green-900/5 shadow-[0_2px_20px_-8px_rgba(20,53,36,0.15)] transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(20,53,36,0.25)] hover:-translate-y-1.5"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-7 right-7 h-[3px] rounded-full bg-linear-to-r from-green-500 to-emerald-300 opacity-70 group-hover:opacity-100 group-hover:left-5 group-hover:right-5 transition-all duration-300" />

              {/* Number + connector */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-serif-display text-5xl font-semibold text-green-300/70 leading-none group-hover:text-green-400 transition-colors">
                  {step.num}
                </span>
                {i < steps.length - 1 && (
                  <span className="hidden lg:block text-green-300 text-xl translate-x-7 group-hover:translate-x-9 group-hover:text-green-500 transition-all duration-300">
                    →
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-100 to-emerald-50 ring-1 ring-green-200/60 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-2xl">{step.icon}</span>
              </div>

              {/* Title */}
              <h3 className="text-[#143524] font-bold text-lg mb-2">{step.title}</h3>

              {/* Description */}
              <p className="text-[#6b7a70] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
