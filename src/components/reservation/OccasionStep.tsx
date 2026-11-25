import { useLanguage } from '../../context/LanguageContext'
import { availableAt, rankTables } from '../../data/reservationAvailability'
import { experiences, occasions } from '../../data/reservations'
import type { CopyKey } from '../../i18n/copy'
import { experienceNames, occasionNames } from '../../i18n/reservation'
import type { Booking, BookingDraft, ExperienceRequest, GuestDetails } from '../../types/reservation'
import { tableNumber } from './FloorPlan'
import { ReservationPairings } from './ReservationPairings'

type ContactField = 'name' | 'phone' | 'email'
export type GuestErrors = Partial<Record<ContactField, CopyKey>>

const contactFields: readonly { field: ContactField; label: CopyKey; type: string; autoComplete: string; max: number }[] = [
  { field: 'name', label: 'name', type: 'text', autoComplete: 'name', max: 100 },
  { field: 'phone', label: 'phone', type: 'tel', autoComplete: 'tel', max: 30 },
  { field: 'email', label: 'email', type: 'email', autoComplete: 'email', max: 254 },
]

export function OccasionStep({ draft, guest, errors, change, changeGuest, records, editId }: {
  draft: BookingDraft
  guest: GuestDetails
  errors: GuestErrors
  change: (changes: Partial<BookingDraft>) => void
  changeGuest: (field: keyof GuestDetails, value: string) => void
  records: Booking[]
  editId?: string
}) {
  const { language, t } = useLanguage()
  const preferred = draft.time === null ? undefined : rankTables(availableAt(draft.date, draft.time, draft.guests, records, editId), draft)[0]

  function toggleExperience(request: ExperienceRequest, checked: boolean) {
    change({ experiences: checked ? [...draft.experiences, request] : draft.experiences.filter((entry) => entry !== request) })
  }

  return (
    <div className="occasion-layout">
      <div className="occasion-fields">
        <div className="booking-panel">
          <label className="booking-field">
            <span>{t('reservationOccasionLabel')}</span>
            <select value={draft.occasion} onChange={(event) => change({ occasion: event.target.value as BookingDraft['occasion'] })}>
              {occasions.map((occasion) => <option key={occasion} value={occasion}>{occasionNames[occasion][language]}</option>)}
            </select>
          </label>
          <fieldset className="booking-experiences">
            <legend>{t('reservationExperience')}</legend>
            <p className="booking-hint">{t('reservationExperienceNote')}</p>
            <div>
              {experiences.map((request) => (
                <label key={request} className="booking-check">
                  <input type="checkbox" checked={draft.experiences.includes(request)} onChange={(event) => toggleExperience(request, event.target.checked)} />
                  <span>{experienceNames[request][language]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {!editId && (
          <div className="booking-panel">
            <h3>{t('reservationGuestDetails')}</h3>
            <p className="booking-hint">{t('reservationContactNote')}</p>
            <div className="booking-contact">
              {contactFields.map(({ field, label, type, autoComplete, max }) => (
                <label className="booking-field" key={field}>
                  <span>{t(label)}</span>
                  <input
                    id={`booking-contact-${field}`} type={type} autoComplete={autoComplete} maxLength={max} required
                    value={guest[field]} dir={type === 'text' ? 'auto' : 'ltr'} placeholder={type === 'tel' ? '+971 5X XXX XXXX' : undefined}
                    onChange={(event) => changeGuest(field, event.target.value)}
                    aria-invalid={errors[field] ? true : undefined} aria-describedby={errors[field] ? `booking-error-${field}` : undefined}
                  />
                  {errors[field] && <small className="field-error" id={`booking-error-${field}`}>{t(errors[field])}</small>}
                </label>
              ))}
              <label className="booking-field booking-notes">
                <span>{t('reservationRequests')}</span>
                <textarea value={guest.requests} dir="auto" maxLength={350} rows={3} onChange={(event) => changeGuest('requests', event.target.value)} />
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="occasion-sidebar">
        {preferred && preferred.table.id !== draft.tableId && preferred.reason !== 'recommendFit' && (
          <section className="booking-panel seating-recommended" aria-label={t('reservationRecommendation')}>
            <p className="eyebrow">{t('reservationRecommendation')}</p>
            <h3>{t('reservationTable')} <bdi>{tableNumber(preferred.table)}</bdi></h3>
            <p>{t(preferred.reason)}</p>
            <button type="button" className="button button--line" onClick={() => change({ tableId: preferred.table.id })}>{t('reservationChooseRecommended')}</button>
          </section>
        )}
        <ReservationPairings occasion={draft.occasion} />
      </div>
    </div>
  )
}
