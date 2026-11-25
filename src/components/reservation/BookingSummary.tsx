import { useLanguage } from '../../context/LanguageContext'
import { getDiningTable } from '../../data/reservationAvailability'
import { dateLabel, fullDateOptions, timeLabel } from '../../data/reservationTime'
import { reservationSettings } from '../../data/reservations'
import { aedCurrency } from '../../data/menuFilters'
import { experienceNames, occasionNames, zoneNames } from '../../i18n/reservation'
import type { Booking, BookingDraft, GuestDetails } from '../../types/reservation'
import { tableNumber } from './FloorPlan'

type SummaryDetails = Pick<BookingDraft, 'date' | 'time' | 'guests' | 'tableId' | 'occasion' | 'experiences'>

export function BookingSummary({ details, booking, guest }: { details: SummaryDetails; booking?: Booking; guest?: GuestDetails }) {
  const { language, t } = useLanguage()
  const table = getDiningTable(details.tableId)
  const duration = booking?.duration ?? reservationSettings.durationMinutes
  return (
    <div className="booking-summary">
      <dl>
        {booking && <div><dt>{t('reservationReference')}</dt><dd><bdi data-testid="booking-reference">{booking.id}</bdi></dd></div>}
        <div><dt>{t('reservationDate')}</dt><dd>{dateLabel(details.date, language, fullDateOptions)}</dd></div>
        {details.time !== null && <div><dt>{t('reservationTime')}</dt><dd>{timeLabel(details.time, language)} · {t('reservationDubaiTime')}</dd></div>}
        <div><dt>{t('reservationDuration')}</dt><dd>{duration} {t('minutes')}</dd></div>
        <div><dt>{t('reservationGuestCount')}</dt><dd>{details.guests}</dd></div>
        {table && <>
          <div><dt>{t('reservationTable')}</dt><dd><bdi>{tableNumber(table)}</bdi></dd></div>
          <div><dt>{t('reservationZone')}</dt><dd>{zoneNames[table.zone][language]}</dd></div>
        </>}
        <div><dt>{t('reservationOccasionLabel')}</dt><dd>{occasionNames[details.occasion][language]}</dd></div>
        <div><dt>{t('reservationExperience')}</dt><dd>{details.experiences.length ? details.experiences.map((request) => experienceNames[request][language]).join(language === 'ar' ? '، ' : ', ') : t('reservationNoRequests')}</dd></div>
        <div><dt>{t('reservationCharges')}</dt><dd><bdi>{aedCurrency[language].format(0)}</bdi></dd></div>
      </dl>
      {guest && (
        <dl aria-label={t('reservationGuestDetails')}>
          <div><dt>{t('name')}</dt><dd dir="auto">{guest.name.trim()}</dd></div>
          <div><dt>{t('phone')}</dt><dd><bdi dir="ltr">{guest.phone.trim()}</bdi></dd></div>
          <div><dt>{t('email')}</dt><dd><bdi dir="ltr">{guest.email.trim()}</bdi></dd></div>
          {guest.requests.trim() && <div><dt>{t('reservationRequests')}</dt><dd dir="auto">{guest.requests.trim()}</dd></div>}
        </dl>
      )}
    </div>
  )
}
