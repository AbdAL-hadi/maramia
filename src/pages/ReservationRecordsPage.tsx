import { CalendarDays, CheckCircle2 } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { BookingSummary } from '../components/reservation/BookingSummary'
import { ReservationHero } from '../components/reservation/ReservationHero'
import { VisitRewards } from '../components/loyalty/VisitRewards'
import { ReservationPairings } from '../components/reservation/ReservationPairings'
import { tableNumber } from '../components/reservation/FloorPlan'
import { useLanguage } from '../context/LanguageContext'
import { useReservations } from '../context/ReservationContext'
import { canManageBooking, getDiningTable } from '../data/reservationAvailability'
import { downloadBookingCalendar } from '../data/reservationCalendar'
import { dateLabel, fullDateOptions, timeLabel } from '../data/reservationTime'
import { useBookingClock } from '../hooks/useBookingClock'
import type { CopyKey } from '../i18n/copy'
import { zoneNames } from '../i18n/reservation'
import type { Booking } from '../types/reservation'

function stateKey(booking: Booking, now: Date): CopyKey {
  if (booking.status === 'cancelled') return 'reservationCancelled'
  return canManageBooking(booking, now) ? 'reservationActive' : 'reservationPastVisit'
}

function RecordCard({ booking, now }: { booking: Booking; now: Date }) {
  const { language, t } = useLanguage()
  const { cancel } = useReservations()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<CopyKey | null>(null)
  const [cancelledHere, setCancelledHere] = useState(false)
  const confirmButton = useRef<HTMLButtonElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const locked = useRef(false)
  const canManage = canManageBooking(booking, now)
  const table = getDiningTable(booking.tableId)
  const base = `/reservation/${booking.id}`

  async function confirmCancel() {
    if (locked.current) return
    locked.current = true
    setPending(true)
    const result = await cancel(booking.id)
    if ('error' in result) setError(result.error)
    else {
      setConfirming(false)
      setCancelledHere(true)
      requestAnimationFrame(() => heading.current?.focus())
    }
    setPending(false)
    locked.current = false
  }

  return (
    <article className="booking-panel booking-record" id={`booking-${booking.id}`} tabIndex={-1}>
      <div className="booking-record-header">
        <div>
          <p className="eyebrow"><bdi>{booking.id}</bdi></p>
          <h2 ref={heading} tabIndex={-1}>{dateLabel(booking.date, language, fullDateOptions)}</h2>
        </div>
        <span className={`booking-status${canManage ? ' booking-status--active' : ''}`} role={cancelledHere ? 'status' : undefined}>{t(stateKey(booking, now))}</span>
      </div>
      <p>{timeLabel(booking.time, language)} · {t('reservationDubaiTime')} · {t('reservationGuestCount')} {booking.guests}</p>
      {table && <p>{t('reservationTable')} <bdi>{tableNumber(table)}</bdi> · {zoneNames[table.zone][language]}</p>}
      <div className="reservation-actions">
        <Link className="button button--line" to={base}>{t('reservationDetails')}</Link>
        {canManage && <Link className="button button--forest" to={`${base}/edit`}>{t('reservationEdit')}</Link>}
        {canManage && !confirming && (
          <button type="button" className="booking-cancel-link" ref={cancelButton} onClick={() => {
            setConfirming(true)
            setError(null)
            requestAnimationFrame(() => confirmButton.current?.focus())
          }}>{t('reservationCancel')}</button>
        )}
      </div>
      {confirming && canManage && (
        <div className="booking-cancel-prompt" role="group" aria-label={t('reservationCancel')}>
          <p>{t('reservationCancelQuestion')}</p>
          <div className="reservation-actions">
            <button type="button" className="button button--line" ref={confirmButton} disabled={pending} onClick={confirmCancel}>{t('reservationConfirmCancel')}</button>
            <button type="button" className="button button--line" disabled={pending} onClick={() => {
              setConfirming(false)
              requestAnimationFrame(() => cancelButton.current?.focus())
            }}>{t('reservationKeep')}</button>
          </div>
        </div>
      )}
      {error && <p className="booking-error" role="alert">{t(error)}</p>}
    </article>
  )
}

export function ReservationManager() {
  const { t } = useLanguage()
  const { records } = useReservations()
  const now = useBookingClock()
  const { hash } = useLocation()
  useLayoutEffect(() => {
    if (!hash.startsWith('#booking-')) return
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      target?.focus({ preventScroll: true })
      target?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash])
  return (
    <div className="reservation-page">
      <ReservationHero title={t('reservationManage')} intro={t('reservationManageText')} />
      <div className="container reservation-content reservation-records">
        <div><Link className="button button--forest" to="/reservation">{t('reservationNew')}</Link></div>
        {records.length ? records.map((booking) => <RecordCard key={booking.id} booking={booking} now={now} />)
          : <p className="booking-panel">{t('reservationEmpty')}</p>}
      </div>
    </div>
  )
}

export function ReservationConfirmation() {
  const { reference } = useParams()
  const { records } = useReservations()
  const { t } = useLanguage()
  const now = useBookingClock()
  const booking = records.find(({ id }) => id === reference)
  return (
    <div className="reservation-page">
      <ReservationHero
        title={t(!booking ? 'reservationMissing' : booking.status === 'cancelled' ? 'reservationCancelled' : 'reservationConfirmed')}
        intro={t(booking ? 'reservationSavedText' : 'reservationManageText')}
      />
      <div className="container reservation-content reservation-confirmation">
        {!booking ? <Link className="button button--forest" to="/reservation/manage">{t('reservationManage')}</Link> : (
          <>
            <section className="booking-panel" aria-labelledby="saved-booking-details">
              <div className="booking-details-heading">
                <h2 id="saved-booking-details">{t('reservationDetails')}</h2>
                {booking.status === 'active' && <CheckCircle2 size={26} strokeWidth={1.5} aria-hidden="true" />}
              </div>
              <p className="booking-state-label">{t('reservationStatus')} · <strong>{t(stateKey(booking, now))}</strong></p>
              <BookingSummary details={booking} booking={booking} />
              <div className="reservation-actions">
                <Link className="button button--forest" to={`/reservation/manage#booking-${booking.id}`}>{t('reservationManageOne')}</Link>
                <Link className="button button--line" to="/menu">{t('reservationViewMenu')}</Link>
                {canManageBooking(booking, now) && (
                  <button className="button button--line" type="button" onClick={() => downloadBookingCalendar(booking, t('reservationCalendarTitle'), t('reservationSavedText'))}>
                    <CalendarDays size={17} aria-hidden="true" />{t('reservationCalendar')}
                  </button>
                )}
              </div>
            </section>
            <ReservationPairings occasion={booking.occasion} promotion />
            <VisitRewards key={booking.id} booking={booking} now={now} />
          </>
        )}
      </div>
    </div>
  )
}
