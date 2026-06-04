import { useState } from 'react'
import PhotoUpload from './PhotoUpload'

const PLANT_TYPES = [
  'Neem', 'Peepal', 'Banyan', 'Mango', 'Tulsi', 'Ashoka', 'Guava', 'Other',
]

const EMPTY = { name: '', city: '', plantType: '', count: 1, photo: null }

export default function SubmitPanel({ open, onClose }) {
  const [form, setForm] = useState(EMPTY)

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire up to the entries API
    console.log('Submitting entry:', form)
    onClose()
  }

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-green-400/60 focus:bg-white/[0.07]'
  const labelClass =
    'mb-1.5 block text-xs font-semibold tracking-wide text-white/60'

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Submit your tree planting entry"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#10271a] shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7">
          <div>
            <span className="rounded-md bg-green-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300">
              Submit Your Entry
            </span>
            <h2 className="font-serif-display mt-4 flex items-center gap-2 text-3xl font-semibold text-white">
              I Planted a Tree <span>🌳</span>
            </h2>
            <p className="mt-1.5 text-sm text-white/60">
              Upload your proof and get on the leaderboard instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form (scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-7 py-6"
        >
          <PhotoUpload
            file={form.photo}
            onFile={(photo) => setForm((f) => ({ ...f, photo }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Your Name</label>
              <input
                value={form.name}
                onChange={set('name')}
                placeholder="Rahul Sharma"
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>City / Village</label>
              <input
                value={form.city}
                onChange={set('city')}
                placeholder="Loni, UP"
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Plant Type</label>
              <select
                value={form.plantType}
                onChange={set('plantType')}
                className={`${fieldClass} appearance-none`}
                required
              >
                <option value="" disabled>Select plant…</option>
                {PLANT_TYPES.map((p) => (
                  <option key={p} value={p} className="bg-[#10271a]">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Number of Plants</label>
              <input
                type="number"
                min="1"
                value={form.count}
                onChange={set('count')}
                className={fieldClass}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-auto flex items-center justify-center gap-2 rounded-full bg-green-500 px-7 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-green-400 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98]"
          >
            🌱 Submit My Entry & Get on Leaderboard
          </button>
        </form>
      </aside>
    </div>
  )
}
