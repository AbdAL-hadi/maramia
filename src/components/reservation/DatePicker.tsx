import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { addCalendarDays, bookingBounds, dateLabel, fullDateOptions } from '../../data/reservationTime'

function monthStart(date: string) {
  return `${date.slice(0, 7)}-01`
}

function addMonths(date: string, months: number) {
  const first = new Date(`${monthStart(date)}T00:00:00Z`)
  first.setUTCMonth(first.getUTCMonth() + months)
  return first.toISOString().slice(0, 10)
}

export function DatePicker({ value, onChange, now }: { value: string; onChange: (date: string) => void; now: Date }) {
  const { t, language } = useLanguage()
  const id = useId()
  const calendar = useRef<HTMLDivElement>(null)
  const { first, last } = bookingBounds(now)
  const [anchor, setAnchor] = useState(value && value >= first && value <= last ? value : first)
  const month = monthStart(anchor)
  const previous = addMonths(month, -1)
  const next = addMonths(month, 1)
  const weekdays = Array.from({ length: 7 }, (_, index) => dateLabel(addCalendarDays('2024-01-01', index), language, { weekday: 'short' }))
  const startPadding = (new Date(`${month}T00:00:00Z`).getUTCDay() + 6) % 7
  const dayCount = Number(addCalendarDays(next, -1).slice(-2))
  const days = Array.from({ length: dayCount }, (_, index) => addCalendarDays(month, index))
  const rovingDate = anchor >= first && anchor <= last ? anchor : days.find((date) => date >= first && date <= last)
  const PreviousIcon = language === 'ar' ? ChevronRight : ChevronLeft
  const NextIcon = language === 'ar' ? ChevronLeft : ChevronRight

  function changeMonth(date: string) {
    setAnchor(date < first ? first : date)
  }

  function moveDate(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const rtl = language === 'ar' ? -1 : 1
    const steps = { ArrowLeft: -rtl, ArrowRight: rtl, ArrowUp: -7, ArrowDown: 7 }
    if (!Object.hasOwn(steps, event.key)) return
    event.preventDefault()
    const target = addCalendarDays(date, steps[event.key as keyof typeof steps])
    if (target < first || target > last) return
    setAnchor(target)
    requestAnimationFrame(() => calendar.current?.querySelector<HTMLButtonElement>(`[data-visit-date="${target}"]`)?.focus())
  }

  return (
    <section className="booking-panel calendar-panel" aria-labelledby={id}>
      <h3 id={id}>{t('reservationDate')}</h3>
      <div className="calendar-month">
        <button type="button" className="calendar-arrow" disabled={previous < monthStart(first)} aria-label={t('previousMonth')} onClick={() => changeMonth(previous)}>
          <PreviousIcon size={19} aria-hidden="true" />
        </button>
        <strong aria-live="polite">{dateLabel(month, language, { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className="calendar-arrow" disabled={next > last} aria-label={t('nextMonth')} onClick={() => changeMonth(next)}>
          <NextIcon size={19} aria-hidden="true" />
        </button>
      </div>
      <div className="calendar-grid" ref={calendar} role="group" aria-labelledby={id}>
        {weekdays.map((day, index) => <span className="calendar-weekday" aria-hidden="true" key={index}>{day}</span>)}
        {Array.from({ length: startPadding }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
        {days.map((day) => (
          <button
            type="button" className="calendar-day" key={day} data-visit-date={day}
            disabled={day < first || day > last} aria-label={dateLabel(day, language, fullDateOptions)}
            aria-current={day === first ? 'date' : undefined} aria-pressed={value === day}
            tabIndex={day === rovingDate ? 0 : -1}
            onKeyDown={(event) => moveDate(event, day)}
            onClick={() => { setAnchor(day); onChange(day) }}
          >
            {dateLabel(day, language, { day: 'numeric' })}
          </button>
        ))}
      </div>
      {value && <p className="calendar-selection">{dateLabel(value, language, fullDateOptions)}</p>}
    </section>
  )
}
