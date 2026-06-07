import { useEffect, useState } from 'react'
import SidePanel from '../ui/SidePanel'
import PhoneStep from './steps/PhoneStep'
import OtpStep from './steps/OtpStep'
import DetailsStep from './steps/DetailsStep'
import { formatPhone } from './authStore'
import { sendOtp, register, verifyOtp } from '../../api/auth'

const EMPTY_DETAILS = { name: '', state: '', district: '', address: '' }

const HEADINGS = {
  phone: { title: 'Welcome to PollutionFreeLoni', sub: 'Log in or sign up with your mobile number.' },
  details: { title: 'Almost There', sub: 'Set up your planter profile to continue.' },
  otp: { title: 'Verify Your Number', sub: 'Enter the code we just sent you.' },
}

export default function LoginPanel({ open, onClose, onComplete }) {
  const [step, setStep] = useState('phone')
  // 'login'  -> existing user (phone → otp)
  // 'register' -> new user    (phone → details → otp)
  const [mode, setMode] = useState('login')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [details, setDetails] = useState(EMPTY_DETAILS)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset the flow after the panel closes (waits for slide-out animation)
  useEffect(() => {
    if (open) return
    const t = setTimeout(() => {
      setStep('phone')
      setMode('login')
      setPhone('')
      setOtp('')
      setDetails(EMPTY_DETAILS)
      setError('')
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [open])

  const fullPhone = formatPhone(phone)

  // Phone step → ask backend to send an OTP. A 404 means the number isn't
  // registered yet, so we route the user through the details/register flow.
  const handlePhoneSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await sendOtp(fullPhone)
      setMode('login')
      setOtp('')
      setStep('otp')
    } catch (err) {
      if (err.status === 404) {
        setMode('register')
        setStep('details')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Details step → register (this also sends the OTP for new users).
  const handleDetailsSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await register({ phone: fullPhone, ...details })
      setOtp('')
      setStep('otp')
    } catch (err) {
      // Already registered? Fall back to a normal login OTP.
      if (err.status === 400 && /already registered/i.test(err.message)) {
        try {
          await sendOtp(fullPhone)
          setMode('login')
          setStep('otp')
        } catch (e) {
          setError(e.message)
        }
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // OTP step → verify and finish login.
  const handleOtpSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await verifyOtp(fullPhone, otp)
      onComplete(data.user, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sequence = mode === 'register' ? ['phone', 'details', 'otp'] : ['phone', 'otp']
  const heading = HEADINGS[step]

  return (
    <SidePanel open={open} onClose={onClose} label="Login or sign up">
      {/* Header */}
      <div className="flex items-start justify-between px-7 pt-7">
        <div>
          <span className="rounded-md bg-green-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300">
            Account
          </span>
          <h2 className="font-serif-display mt-4 text-3xl font-semibold text-white">
            {heading.title}
          </h2>
          <p className="mt-1.5 text-sm text-white/60">{heading.sub}</p>
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

      {/* Step progress */}
      <div className="flex gap-2 px-7 pt-6">
        {sequence.map((s) => {
          const active = sequence.indexOf(s) <= sequence.indexOf(step)
          return (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                active ? 'bg-green-500' : 'bg-white/10'
              }`}
            />
          )
        })}
      </div>

      {/* Step body */}
      <div className="flex-1 overflow-y-auto px-7 py-8">
        {step === 'phone' && (
          <PhoneStep
            phone={phone}
            setPhone={setPhone}
            onSubmit={handlePhoneSubmit}
            loading={loading}
            error={error}
          />
        )}
        {step === 'details' && (
          <DetailsStep
            details={details}
            setDetails={setDetails}
            onSubmit={handleDetailsSubmit}
            loading={loading}
            error={error}
          />
        )}
        {step === 'otp' && (
          <OtpStep
            phone={phone}
            otp={otp}
            setOtp={setOtp}
            onVerify={handleOtpSubmit}
            onBack={() => {
              setError('')
              setStep('phone')
            }}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </SidePanel>
  )
}
