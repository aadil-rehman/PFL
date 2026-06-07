import { useRef } from 'react'

// Segmented OTP input. `length` boxes, auto-advances and supports paste/backspace.
export default function OtpInput({ value, onChange, length = 4 }) {
  const refs = useRef([])

  const setDigit = (i, digit) => {
    const next = value.split('')
    next[i] = digit
    onChange(next.join('').slice(0, length))
  }

  const handleChange = (i, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) return
    setDigit(i, digit)
    if (i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (value[i]) {
        setDigit(i, '')
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
        setDigit(i - 1, '')
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(digits)
    refs.current[Math.min(digits.length, length - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-white outline-none transition-colors focus:border-green-400/60 focus:bg-white/[0.07]"
        />
      ))}
    </div>
  )
}
