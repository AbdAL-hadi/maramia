import { reservationSettings } from './reservations'
import type { Language } from '../types'

const { timeZone, horizonDays } = reservationSettings
const dubaiClock = new Intl.DateTimeFormat('en-GB', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

export function parseBookingDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const value = new Date(`${date}T00:00:00Z`)
  return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date ? value : null
}

export function dubaiNow(now = new Date()) {
  const parts = Object.fromEntries(dubaiClock.formatToParts(now).map(({ type, value }) => [type, value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: Number(parts.hour) * 60 + Number(parts.minute) }
}

export function addCalendarDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function bookingBounds(now = new Date()) {
  const { date } = dubaiNow(now)
  return { first: date, last: addCalendarDays(date, horizonDays) }
}

export function isFutureVisit(date: string, time: number, now = new Date()) {
  const current = dubaiNow(now)
  return Boolean(parseBookingDate(date)) && (date > current.date || (date === current.date && time > current.time))
}

// Calendar-only strings use UTC as a neutral carrier. Bookable times are Dubai wall-clock minutes.
export function dateLabel(date: string, language: Language, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-AE', { calendar: 'gregory', ...options, timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`))
}

export const fullDateOptions: Intl.DateTimeFormatOptions = { dateStyle: 'full' }

function clockString(time: number) {
  return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`
}

export function timeLabel(time: number, language: Language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    hour: 'numeric', minute: '2-digit', timeZone: 'UTC',
  }).format(new Date(`2000-01-01T${clockString(time)}:00Z`))
}

export function dubaiInstant(date: string, time: number) {
  const neutral = new Date(`${date}T${clockString(time)}:00Z`)
  const offset = new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(neutral).find(({ type }) => type === 'timeZoneName')?.value.slice(3)
  return new Date(`${date}T${clockString(time)}:00${offset || 'Z'}`)
}
