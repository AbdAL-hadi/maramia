import type { Booking, BookingDraft, DiningTable, Occasion, TableState } from '../types/reservation'
import { diningTables, mockTableHolds, reservationSettings } from './reservations'
import { bookingBounds, isFutureVisit, parseBookingDate } from './reservationTime'

export const slotGroups = reservationSettings.sessions.map(({ label, start, end }) => ({
  label,
  times: Array.from({ length: Math.max(0, 1 + Math.floor((end - start - reservationSettings.durationMinutes) / reservationSettings.slotMinutes)) },
    (_, index) => start + index * reservationSettings.slotMinutes),
}))
const sessionTimes = slotGroups.flatMap(({ times }) => times)
const tablesById = new Map(diningTables.map((table) => [table.id, table]))

export function getDiningTable(id: string) {
  return tablesById.get(id)
}

export function isValidVisit(date: string, time: number, now: Date) {
  const bounds = bookingBounds(now)
  return sessionTimes.includes(time) && date >= bounds.first && date <= bounds.last && isFutureVisit(date, time, now)
}

export function dateKey(date: string) {
  return parseBookingDate(date)?.getUTCDay() ?? -1
}

export function tableState(
  table: DiningTable, date: string, time: number, guests: number, bookings: readonly Booking[], ignoreId?: string,
): TableState {
  if (table.capacity < guests) return 'tooSmall'
  const end = time + reservationSettings.durationMinutes
  const overlaps = (start: number, duration: number) => start < end && start + duration > time
  const weekday = dateKey(date)
  const held = mockTableHolds.some((hold) =>
    (!hold.weekdays || hold.weekdays.includes(weekday)) && hold.tableIds.includes(table.id) && overlaps(hold.start, hold.duration))
  if (held || bookings.some((booking) => booking.id !== ignoreId && booking.status === 'active' && booking.date === date && booking.tableId === table.id && overlaps(booking.time, booking.duration))) return 'reserved'
  return 'available'
}

const celebrations: readonly Occasion[] = ['birthday', 'anniversary', 'celebration']

export const seatingReasons = {
  requested: 'recommendRequested',
  private: 'recommendPrivate',
  family: 'recommendFamily',
  fit: 'recommendFit',
} as const

export function rankTables(available: readonly DiningTable[], draft: BookingDraft) {
  const privateOccasion = celebrations.includes(draft.occasion) || draft.occasion === 'business'
  const familyVisit = draft.guests >= 5 || draft.occasion === 'gathering'

  return available.map((table) => {
    const requested = draft.seating === table.zone
    const privateFit = privateOccasion && table.zone === 'private'
    const familyFit = familyVisit && table.zone === 'family'
    const seats = table.capacity - draft.guests
    return {
      table, score: seats * 4 - (requested ? 48 : 0) - (privateFit ? 31 : 0) - (familyFit ? 15 : 0),
      reason: seatingReasons[requested ? 'requested' : privateFit ? 'private' : familyFit ? 'family' : 'fit'],
    }
  }).sort((a, b) => a.score - b.score || a.table.capacity - b.table.capacity || a.table.number - b.table.number)
}

export function availableAt(date: string, time: number, guests: number, bookings: readonly Booking[], ignoreId?: string) {
  return diningTables.filter((table) => tableState(table, date, time, guests, bookings, ignoreId) === 'available')
}

export function alternativeTimes(date: string, guests: number, bookings: readonly Booking[], now: Date, time?: number, ignoreId?: string) {
  return sessionTimes.filter((slot) => slot !== time && isValidVisit(date, slot, now) && availableAt(date, slot, guests, bookings, ignoreId).length > 0)
    .sort((a, b) => time === undefined ? a - b : Math.abs(a - time) - Math.abs(b - time) || a - b).slice(0, 3)
}

export function canManageBooking(booking: Booking, now = new Date()) {
  return booking.status === 'active' && isFutureVisit(booking.date, booking.time, now)
}
