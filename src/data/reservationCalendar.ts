import type { Booking } from '../types/reservation'
import { dubaiInstant } from './reservationTime'

function stamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, '\\$&')
}

function fold(line: string) {
  const encoder = new TextEncoder()
  let used = 0
  let result = ''
  for (const character of line) {
    const bytes = encoder.encode(character).length
    if (used + bytes > 75) {
      result += '\r\n '
      used = 1
    }
    result += character
    used += bytes
  }
  return result
}

export function downloadBookingCalendar(booking: Booking, title: string, notice: string) {
  const start = dubaiInstant(booking.date, booking.time)
  const finish = new Date(start.getTime() + booking.duration * 60_000)
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maramia UAE//Reservation Demo//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${booking.id}@maramia-uae.demo`, `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(finish)}`, 'STATUS:TENTATIVE',
    `SUMMARY:${escape(title)}`, `DESCRIPTION:${escape(`${notice}\n${booking.id}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ]
  const file = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `${booking.id}.ics`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
