import { FIELD, LABEL, PRIMARY_BTN } from '../../ui/formStyles'

export default function PhoneStep({ phone, setPhone, onSubmit, loading, error }) {
  const valid = phone.length === 10

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <div>
        <label className={LABEL}>Mobile Number</label>
        <div className="flex items-stretch gap-2">
          <span className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70">
            +91
          </span>
          <input
            autoFocus
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            className={FIELD}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">
          We'll send a one-time password to verify this number.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={!valid || loading} className={PRIMARY_BTN}>
        {loading ? 'Sending…' : 'Send OTP'}
      </button>
    </form>
  )
}
