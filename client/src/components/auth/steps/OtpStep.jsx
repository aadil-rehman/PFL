import OtpInput from '../OtpInput'
import { PRIMARY_BTN } from '../../ui/formStyles'

export default function OtpStep({ phone, otp, setOtp, onVerify, onBack, loading, error }) {
  const valid = otp.length === 6

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onVerify()
      }}
      className="flex flex-col gap-6"
    >
      <p className="text-center text-sm text-white/60">
        Enter the 6-digit code sent to{' '}
        <span className="font-semibold text-white">+91 {phone}</span>
      </p>

      <OtpInput value={otp} onChange={setOtp} length={6} />

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={!valid || loading} className={PRIMARY_BTN}>
        {loading ? 'Verifying…' : 'Verify & Continue'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-white/50 transition-colors hover:text-white/80"
      >
        ← Change number
      </button>
    </form>
  )
}
