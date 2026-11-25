import { Check } from 'lucide-react'
import { m } from 'framer-motion'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BookingSummary } from '../components/reservation/BookingSummary'
import { OccasionStep, type GuestErrors } from '../components/reservation/OccasionStep'
import { ReservationHero } from '../components/reservation/ReservationHero'
import { SeatingStep } from '../components/reservation/SeatingStep'
import { VisitStep } from '../components/reservation/VisitStep'
import { useLanguage } from '../context/LanguageContext'
import { createReference, useReservations } from '../context/ReservationContext'
import { isEmail, isUaePhone } from '../data/contactValidation'
import { availableAt, canManageBooking, isValidVisit } from '../data/reservationAvailability'
import { reservationPreferences } from '../data/reservationLinks'
import { useBookingClock } from '../hooks/useBookingClock'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { CopyKey } from '../i18n/copy'
import type { Booking, BookingDraft, GuestDetails } from '../types/reservation'

const steps = ['reservationVisit', 'reservationSeating', 'reservationOccasion', 'reservationReview'] as const
const emptyDraft: BookingDraft = { date: '', time: null, guests: 2, seating: 'any', tableId: '', occasion: 'casual', experiences: [] }
const emptyGuest: GuestDetails = { name: '', phone: '', email: '', requests: '' }

function ReservationWizard({ initial, preferences }: { initial?: Booking; preferences?: Pick<BookingDraft, 'seating' | 'occasion'> }) {
  const { t } = useLanguage()
  const { records, save } = useReservations()
  const now = useBookingClock()
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<BookingDraft>(() => initial ? {
    date: initial.date, time: initial.time, guests: initial.guests, seating: 'any', tableId: initial.tableId,
    occasion: initial.occasion, experiences: initial.experiences,
  } : { ...emptyDraft, ...preferences })
  const [guest, setGuest] = useState(emptyGuest)
  const [errors, setErrors] = useState<GuestErrors>({})
  const [step, setStep] = useState(0)
  const [notice, setNotice] = useState<CopyKey | null>(null)
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const reference = useRef(initial?.id)
  const heading = useRef<HTMLHeadingElement>(null)
  const editId = initial?.id

  function move(next: number) {
    setNotice(null)
    setStep(next)
    requestAnimationFrame(() => heading.current?.focus())
  }

  function change(changes: Partial<BookingDraft>) {
    setNotice(null)
    setDraft((previous) => {
      const updated = { ...previous, ...changes }
      if (changes.date === undefined && changes.time === undefined && changes.guests === undefined) return updated
      const time = updated.time
      if (time === null || !isValidVisit(updated.date, time, now)) return { ...updated, time: null, tableId: '' }
      const choices = availableAt(updated.date, time, updated.guests, records, editId)
      if (!choices.length) return { ...updated, time: null, tableId: '' }
      return choices.some((table) => table.id === updated.tableId) ? updated : { ...updated, tableId: '' }
    })
  }

  function changeGuest(field: keyof GuestDetails, value: string) {
    setGuest((previous) => ({ ...previous, [field]: value }))
    if (field !== 'requests') setErrors((previous) => ({ ...previous, [field]: undefined }))
    setNotice(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const time = draft.time
    if (time === null || !isValidVisit(draft.date, time, new Date())) {
      if (step !== 0) move(0)
      setNotice('reservationVisitError')
      return
    }
    const choices = availableAt(draft.date, time, draft.guests, records, editId)
    if (step === 0) {
      if (!choices.length) setNotice('reservationVisitError')
      else move(1)
      return
    }
    if (!choices.some((table) => table.id === draft.tableId)) {
      if (step !== 1) move(1)
      setNotice('reservationTableWarning')
      return
    }
    if (step === 2 && !initial) {
      const nextErrors: GuestErrors = {}
      if (!guest.name.trim()) nextErrors.name = 'requiredField'
      if (!isUaePhone(guest.phone)) nextErrors.phone = 'phoneError'
      const email = document.getElementById('booking-contact-email')
      if (!isEmail(guest.email) || (email instanceof HTMLInputElement && email.validity.typeMismatch)) nextErrors.email = 'emailError'
      const first = Object.keys(nextErrors)[0]
      setErrors(nextErrors)
      if (first) {
        setNotice('reviewErrors')
        requestAnimationFrame(() => document.getElementById(`booking-contact-${first}`)?.focus())
        return
      }
    }
    if (step < 3) {
      move(step + 1)
      return
    }
    submitting.current = true
    setPending(true)
    reference.current ??= createReference()
    const result = await save(draft, reference.current, Boolean(initial))
    if ('booking' in result) {
      navigate(`/reservation/${result.booking.id}`, { replace: true })
      return
    }
    if (result.error === 'reservationUnavailable') move(1)
    if (result.error === 'reservationExpired') move(0)
    setNotice(result.error)
    setPending(false)
    submitting.current = false
  }

  return (
    <div className="reservation-page">
      <ReservationHero photo title={t(initial ? 'reservationEditHeading' : 'reservationHeading')} intro={t(initial ? 'reservationEditIntro' : 'reservationIntro')} manage />
      <div className="container reservation-content">
        <nav className="reservation-progress" aria-label={t('reservationSteps')}>
          <ol role="list">
            {steps.map((label, index) => (
              <li key={label} className={index <= step ? 'reservation-step-reached' : undefined}>
                <button type="button" aria-current={index === step ? 'step' : undefined} disabled={index >= step || pending} onClick={() => move(index)}>
                  <span aria-hidden="true">{index < step ? <Check size={16} /> : index + 1}</span>{t(label)}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <form className="reservation-wizard" id="reservation-wizard" aria-labelledby="reservation-step-title" noValidate onSubmit={submit}>
          <h2 id="reservation-step-title" tabIndex={-1} ref={heading}>{t(steps[step])}</h2>
          <m.div key={step} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            {step === 0 && <VisitStep {...{ draft, records, now, change }} ignoreId={editId} />}
            {step === 1 && <SeatingStep {...{ draft, records, now, change }} ignoreId={editId} />}
            {step === 2 && <OccasionStep {...{ draft, guest, errors, change, changeGuest, records, editId }} />}
            {step === 3 && (
              <div className="booking-panel booking-review">
                <BookingSummary details={draft} guest={initial ? undefined : guest} />
                <p className="booking-hint">{t('reservationExperienceNote')}</p>
              </div>
            )}
          </m.div>
          {notice && <p className="booking-error" role="alert">{t(notice)}</p>}
          <div className="reservation-actions wizard-actions">
            {step > 0 && <button className="button button--line" type="button" onClick={() => move(step - 1)} disabled={pending}>{t('reservationBack')}</button>}
            <button className="button button--forest" type="submit" disabled={pending}>
              {t(pending ? 'reservationSaving' : step === 3 ? (initial ? 'reservationSave' : 'reservationConfirm') : 'reservationNext')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ReservationPage({ editing = false }: { editing?: boolean }) {
  const { reference } = useParams()
  const [params] = useSearchParams()
  const { records } = useReservations()
  const { t } = useLanguage()
  if (!editing) {
    const preferences = reservationPreferences(params)
    return <ReservationWizard key={`${preferences.seating}-${preferences.occasion}`} preferences={preferences} />
  }
  const booking = records.find(({ id }) => id === reference)
  if (booking && canManageBooking(booking)) return <ReservationWizard key={booking.id} initial={booking} />
  return (
    <div className="reservation-page">
      <ReservationHero title={t('reservationMissing')} intro={t('reservationCannotManage')} />
      <div className="container reservation-content"><Link className="button button--forest" to="/reservation/manage">{t('reservationManage')}</Link></div>
    </div>
  )
}
