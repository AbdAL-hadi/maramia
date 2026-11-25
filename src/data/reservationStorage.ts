import { readStorage } from '../hooks/storage'
import type { Booking } from '../types/reservation'
import { getDiningTable } from './reservationAvailability'
import { experiences, occasions, reservationSettings } from './reservations'
import { parseBookingDate } from './reservationTime'

export const reservationStorageKey = 'maramia.reservations.v1'

function numberIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

export function loadBookings(): Booking[] {
  const stored = readStorage<unknown>(reservationStorageKey, [])
  if (!Array.isArray(stored)) return []
  const records = new Map<string, Booking>()
  for (const record of stored) {
    if (!record || typeof record !== 'object' || typeof record.id !== 'string' || !/^MRA-R-[A-F0-9]{12}$/.test(record.id)) continue
    if (typeof record.date !== 'string' || !parseBookingDate(record.date) || !numberIn(record.time, 0, 1439) || !numberIn(record.duration, 1, 1440 - record.time)) continue
    if (!numberIn(record.guests, 1, reservationSettings.maxGuests) || typeof record.tableId !== 'string') continue
    const table = getDiningTable(record.tableId)
    if (!table || table.capacity < record.guests || !occasions.includes(record.occasion)) continue
    if (record.status !== 'active' && record.status !== 'cancelled') continue
    const requested = Array.isArray(record.experiences) ? record.experiences : []
    records.set(record.id, {
      id: record.id, date: record.date, time: record.time, duration: record.duration, guests: record.guests,
      tableId: record.tableId, status: record.status, occasion: record.occasion,
      experiences: experiences.filter((experience) => requested.includes(experience)),
    })
  }
  return Array.from(records.values())
}
