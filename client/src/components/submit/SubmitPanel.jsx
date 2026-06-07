import { useEffect, useRef, useState } from 'react'
import PhotoUpload from './PhotoUpload'
import SidePanel from '../ui/SidePanel'
import { FIELD, LABEL } from '../ui/formStyles'
import { useAuth } from '../auth/AuthContext'
import { useSubmitPanel } from './SubmitPanelContext'
import { submitPlant } from '../../api/plants'

const PLANT_TYPES = [
  'Neem', 'Peepal', 'Banyan', 'Mango', 'Tulsi', 'Ashoka', 'Guava', 'Other',
]

const EMPTY = { name: '', city: '', plantType: '', count: 1, photo: null }

export default function SubmitPanel({ open, onClose }) {
  const { isLoggedIn, token, user, openLogin } = useAuth()
  const { openPanel } = useSubmitPanel()

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  // Set when a logged-out user hits submit; we resume once they log in.
  const pendingAuthRef = useRef(false)

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  // Prefill name / city from the logged-in profile when those fields are blank.
  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => ({
      ...f,
      name: f.name || user.name || '',
      city: f.city || user.district || user.state || '',
    }))
  }, [user])

  const doSubmit = async (token) => {
    setSubmitting(true)
    setError('')
    try {
      await submitPlant(
        {
          photo: form.photo,
          plantName: form.plantType,
          quantity: form.count,
          district: form.city, // free-text area; server slugifies it for the map
        },
        token,
      )
      setDone(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.photo) {
      setError('Please upload a photo of your plant.')
      return
    }
    setError('')

    // Not logged in → gate behind login, then resume from the effect below.
    if (!isLoggedIn) {
      pendingAuthRef.current = true
      onClose()
      openLogin()
      return
    }

    doSubmit(token)
  }

  // Resume the submission after the user finishes logging in.
  useEffect(() => {
    if (!pendingAuthRef.current || !isLoggedIn || !token) return
    pendingAuthRef.current = false
    openPanel() // bring the submit panel back into view
    doSubmit(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, token])

  const handleClose = () => {
    onClose()
    // Reset once the slide-out animation has finished.
    setTimeout(() => {
      if (done) setForm(EMPTY)
      setDone(false)
      setError('')
    }, 300)
  }

  const fieldClass = FIELD
  const labelClass = LABEL

  return (
    <SidePanel open={open} onClose={handleClose} label="Submit your tree planting entry">
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
              Add your photo and claim your place on the leaderboard.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-7 py-12 text-center">
            <span className="text-5xl">🎉</span>
            <h3 className="font-serif-display text-2xl font-semibold text-white">
              You're on the leaderboard!
            </h3>
            <p className="max-w-xs text-sm text-white/60">
              Your tree is verified and counted. Thank you for helping Loni breathe again.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 rounded-full bg-green-500 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-green-400"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form (scrollable) */
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
                <label className={labelClass}>Area / Locality</label>
                <input
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Tila Shahbazpur, Loni"
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

            {error && (
              <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-auto flex items-center justify-center gap-2 rounded-full bg-green-500 px-7 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-green-400 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-green-500 disabled:hover:shadow-none"
            >
              {submitting
                ? 'Counting your tree…'
                : isLoggedIn
                  ? '🌱 Count My Tree & Rank Me'
                  : '🌱 Log In & Count My Tree'}
            </button>
          </form>
        )}
    </SidePanel>
  )
}
