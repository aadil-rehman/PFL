import { useCallback, useEffect, useState } from 'react'
import { SubmitPanelContext } from './SubmitPanelContext'
import SubmitPanel from './SubmitPanel'

export default function SubmitPanelProvider({ children }) {
  const [open, setOpen] = useState(false)

  const openPanel = useCallback(() => setOpen(true), [])
  const closePanel = useCallback(() => setOpen(false), [])

  // Lock body scroll + close on Escape while the panel is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closePanel()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, closePanel])

  return (
    <SubmitPanelContext.Provider value={{ open, openPanel, closePanel }}>
      {children}
      <SubmitPanel open={open} onClose={closePanel} />
    </SubmitPanelContext.Provider>
  )
}
