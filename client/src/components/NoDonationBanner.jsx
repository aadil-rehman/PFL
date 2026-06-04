import { useState } from 'react'

export default function NoDonationBanner() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Expanded panel — slides up */}
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-[#0f2318] border border-b-0 border-green-500/30 rounded-t-2xl px-8 py-3 text-center">
          <p className="text-green-400 text-[11px] font-semibold">
            🌱 Plant a tree — that's all we need.
          </p>
          <p className="text-white/40 text-[10px] mt-1">
            This is a community mission, not a charity.
          </p>
        </div>
      </div>

      {/* Tab */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-[#0f2318] border border-b-0 border-green-500/30 rounded-t-xl px-6 py-2 shadow-2xl hover:bg-green-950/60 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <p className="text-white/80 text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap">
          We don't accept donations
        </p>
        <span className="text-white/30 text-[10px] ml-1">{open ? '▼' : '▲'}</span>
      </button>
    </div>
  )
}
