const stats = [
  { icon: '🌱', value: '7,348', label: 'Trees Planted' },
  { icon: '👥', value: '2,658', label: 'To Go' },
  { icon: '🏆', value: '1,284', label: 'Participants' },
  { icon: '📅', value: '9d 14:21', label: 'Days Remaining' },
]

export default function StatsBar() {
  return (
    <div className="relative z-10 mx-4 md:mx-12 -mt-16 mb-8">
      <div className="bg-[#0f2318]/90 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div>
              <p className="text-green-400 font-bold text-xl leading-tight">{stat.value}</p>
              <p className="text-white/50 text-xs uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
