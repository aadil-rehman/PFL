import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Resets scroll to the top on every route change. Without this, navigating to a
// new page keeps the previous scroll position (e.g. landing at the footer).
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
