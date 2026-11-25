import { Clock3, Users } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { alternativeTimes, availableAt, isValidVisit, slotGroups } from '../../data/reservationAvailability'
import { reservationSettings } from '../../data/reservations'
import { timeLabel } from '../../data/reservationTime'
import type { Booking, BookingDraft } from '../../types/reservation'
import { DatePicker } from './DatePicker'

export function VisitStep({ draft, now, records, ignoreId, change }: {
  draft: BookingDraft
  now: Date
  records: Booking[]
  ignoreId?: string
  change: (changes: Partial<BookingDraft>) => void
}) {
  const { t, language } = useLanguage()
  const alternatives = draft.date ? alternativeTimes(draft.date, draft.guests, records, now, draft.time ?? undefined, ignoreId) : []
  let hasUnavailable = false
  const groups = draft.date ? slotGroups.map(({ label, times }) => ({
    label,
    slots: times.map((time) => {
      const future = isValidVisit(draft.date, time, now)
      const available = future && availableAt(draft.date, time, draft.guests, records, ignoreId).length > 0
      hasUnavailable ||= future && !available
      return { time, future, available }
    }),
  })) : []

  return (
    <div className="reservation-visit-grid">
      <DatePicker value={draft.date} now={now} onChange={(date) => change({ date })} />
      <div className="booking-panel visit-options">
        <label className="booking-field">
          <span><Users size={19} aria-hidden="true" />{t('reservationGuests')}</span>
          <select value={draft.guests} onChange={(event) => change({ guests: Number(event.target.value) })}>
            {Array.from({ length: reservationSettings.maxGuests }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select>
        </label>
        <div className="visit-time-heading">
          <h3>{t('reservationTime')}</h3>
          <p><Clock3 size={16} aria-hidden="true" />{t('reservationDubaiTime')} · {reservationSettings.durationMinutes} {t('minutes')}</p>
        </div>
        {!draft.date && <p className="booking-hint">{t('reservationPickDate')}</p>}
        {groups.map(({ label, slots }) => (
          <div key={label} className="booking-session" role="group" aria-label={t(label)}>
            <h4>{t(label)}</h4>
            <div className="booking-slots">
              {slots.map(({ time, future, available }) => (
                <button key={time} className="booking-slot" type="button" disabled={!available} data-visit-time={time} aria-pressed={draft.time === time}
                  onClick={() => change({ time })}>
                  <span>{timeLabel(time, language)}</span>
                  {!available && <small>{t(future ? 'reservationFull' : 'reservationPast')}</small>}
                </button>
              ))}
            </div>
          </div>
        ))}
        {draft.date && !groups.some(({ slots }) => slots.some(({ available }) => available)) && <p className="booking-hint">{t('reservationNoTimes')}</p>}
        {hasUnavailable && alternatives.length > 0 && (
          <div className="alternative-slots" role="group" aria-label={t('reservationAlternatives')}>
            <strong>{t('reservationAlternatives')}</strong>
            {alternatives.map((time) => <button key={time} type="button" onClick={() => change({ time })}>{timeLabel(time, language)}</button>)}
          </div>
        )}
      </div>
    </div>
  )
}
