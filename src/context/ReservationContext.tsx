import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { recordEvent } from '../data/marketingAnalytics'
import { withStorageLock, writeStorage } from '../hooks/storage'
import type { Booking, BookingDraft } from '../types/reservation'
import { canManageBooking, getDiningTable, isValidVisit, tableState } from '../data/reservationAvailability'
import { loadBookings, reservationStorageKey } from '../data/reservationStorage'
import { experiences, occasions, reservationSettings } from '../data/reservations'

type BookingError = 'reservationStorage' | 'reservationUnavailable' | 'reservationExpired' | 'reservationCannotManage'
type BookingResult = { booking: Booking } | { error: BookingError }

const ReservationContext = createContext<{
  records: Booking[]
  save: (draft: BookingDraft, reference: string, editing: boolean) => Promise<BookingResult>
  cancel: (reference: string) => Promise<BookingResult>
} | null>(null)

export function createReference() {
  const value = Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `MRA-R-${value.toUpperCase()}`
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(loadBookings)

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === reservationStorageKey || event.key === null) setRecords(loadBookings())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function persist(next: Booking[], booking: Booking): BookingResult {
    if (!writeStorage(reservationStorageKey, next)) return { error: 'reservationStorage' }
    setRecords(next)
    return { booking }
  }

  async function save(draft: BookingDraft, reference: string, editing: boolean): Promise<BookingResult> {
    try {
      return await withStorageLock<BookingResult>(reservationStorageKey, () => {
        const latest = loadBookings()
        setRecords(latest)
        const existing = latest.find(({ id }) => id === reference)
        const now = new Date()
        if (existing && !editing) return { booking: existing }
        if (editing && (!existing || !canManageBooking(existing, now))) return { error: 'reservationCannotManage' }
        if (draft.time === null || !isValidVisit(draft.date, draft.time, now)) return { error: 'reservationExpired' }
        const table = getDiningTable(draft.tableId)
        if (!Number.isInteger(draft.guests) || draft.guests < 1 || draft.guests > reservationSettings.maxGuests || !occasions.includes(draft.occasion)) return { error: 'reservationUnavailable' }
        if (!table || tableState(table, draft.date, draft.time, draft.guests, latest, editing ? reference : undefined) !== 'available') return { error: 'reservationUnavailable' }
        const booking: Booking = {
          id: reference, date: draft.date, time: draft.time, guests: draft.guests, tableId: table.id, occasion: draft.occasion,
          duration: reservationSettings.durationMinutes, status: 'active',
          experiences: experiences.filter((experience) => draft.experiences.includes(experience)),
        }
        const result = persist(existing ? latest.map((entry) => entry.id === reference ? booking : entry) : [booking, ...latest], booking)
        if ('booking' in result && !editing) void recordEvent('reservation_completed', { reference }, reference)
        return result
      })
    } catch {
      return { error: 'reservationStorage' }
    }
  }

  async function cancel(reference: string): Promise<BookingResult> {
    try {
      return await withStorageLock<BookingResult>(reservationStorageKey, () => {
        const latest = loadBookings()
        setRecords(latest)
        const existing = latest.find(({ id }) => id === reference)
        if (!existing || !canManageBooking(existing)) return { error: 'reservationCannotManage' }
        const booking: Booking = { ...existing, status: 'cancelled' }
        return persist(latest.map((entry) => entry.id === reference ? booking : entry), booking)
      })
    } catch {
      return { error: 'reservationStorage' }
    }
  }

  return <ReservationContext.Provider value={{ records, save, cancel }}>{children}</ReservationContext.Provider>
}

export function useReservations() {
  const context = useContext(ReservationContext)
  if (!context) throw new Error('ReservationProvider is required')
  return context
}
