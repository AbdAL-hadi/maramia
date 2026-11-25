import { useEffect, useState } from 'react'

export function useBookingClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(interval)
  }, [])
  return now
}
