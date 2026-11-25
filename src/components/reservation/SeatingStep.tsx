import { Check, Leaf, Users } from 'lucide-react'
import interior from '../../assets/interior.webp'
import { useLanguage } from '../../context/LanguageContext'
import { alternativeTimes, isValidVisit, rankTables, tableState } from '../../data/reservationAvailability'
import { diningTables, seatingZones } from '../../data/reservations'
import { dateLabel, fullDateOptions, timeLabel } from '../../data/reservationTime'
import { tableStateNames, zoneDescriptions, zoneNames } from '../../i18n/reservation'
import type { Booking, BookingDraft, DiningTable, TableState } from '../../types/reservation'
import { FloorPlan, tableNumber } from './FloorPlan'

const images = import.meta.glob<string>('../../assets/seating/*.webp', { eager: true, import: 'default' })

export function SeatingStep({ draft, records, now, ignoreId, change }: {
  draft: BookingDraft
  records: Booking[]
  now: Date
  ignoreId?: string
  change: (changes: Partial<BookingDraft>) => void
}) {
  const { language, t } = useLanguage()
  const time = draft.time
  const validTime = time !== null && isValidVisit(draft.date, time, now)
  const states = new Map<string, TableState>(diningTables.map((table) => [
    table.id, !validTime ? 'reserved' : tableState(table, draft.date, time, draft.guests, records, ignoreId),
  ]))
  const available = diningTables.filter((table) => states.get(table.id) === 'available')
  const ranked = rankTables(available, draft)
  const recommended = ranked[0]
  const selected = available.find((table) => table.id === draft.tableId)
  const inPreference = ranked.filter(({ table }) => draft.seating === 'any' || draft.seating === table.zone)
  const alternatives = ranked.filter(({ table }) => draft.seating !== 'any' && draft.seating !== table.zone)
  const alternateSlots = !available.length || !inPreference.length
    ? alternativeTimes(draft.date, draft.guests, records, now, time ?? undefined, ignoreId) : []

  function choose(table: DiningTable) {
    if (states.get(table.id) === 'available') change({ tableId: table.id })
  }

  function renderChoice(table: DiningTable) {
    const isSelected = draft.tableId === table.id
    return (
      <li key={table.id}>
        <button type="button" className="booking-list-choice" aria-pressed={isSelected} data-list-table={table.id} onClick={() => choose(table)}>
          <strong>{t('reservationTable')} <bdi>{tableNumber(table)}</bdi></strong>
          <span>{zoneNames[table.zone][language]}</span>
          <small><Users size={14} aria-hidden="true" />{table.capacity} {t('reservationCapacity')}</small>
          {isSelected && <Check size={16} aria-hidden="true" />}
        </button>
      </li>
    )
  }

  return (
    <div className="seating-step">
      <section aria-labelledby="seating-preference-title">
        <div className="seating-preference-heading">
          <h3 id="seating-preference-title">{t('reservationSeatingPreference')}</h3>
          <button className="booking-any-zone" type="button" aria-pressed={draft.seating === 'any'} onClick={() => change({ seating: 'any' })}>{t('reservationAnyZone')}</button>
        </div>
        <div className="seating-areas" role="group" aria-labelledby="seating-preference-title">
          {seatingZones.map((zone) => (
            <button className="seating-area" type="button" key={zone} aria-pressed={draft.seating === zone} onClick={() => change({ seating: zone })}>
              <img src={zone === 'main' ? interior : images[`../../assets/seating/${zone}.webp`] ?? interior} alt="" loading="lazy" decoding="async" />
              <span><strong>{zoneNames[zone][language]}</strong><small>{zoneDescriptions[zone][language]}</small></span>
              {draft.seating === zone && <Check className="seating-area-check" size={18} aria-hidden="true" />}
            </button>
          ))}
        </div>
        <p className="booking-hint">{t('reservationConceptImages')}</p>
      </section>
      <div className="seating-layout">
        <section className="booking-panel plan-panel" aria-labelledby="floor-heading">
          <h3 id="floor-heading">{t('reservationPlanTitle')}</h3>
          <p className="booking-hint">{t('reservationPlanHelp')}</p>
          <p className="booking-hint plan-scroll-hint">{t('reservationPlanScroll')}</p>
          <div className="plan-viewport" tabIndex={0} role="region" aria-label={t('reservationPlanTitle')}>
            <FloorPlan states={states} selected={draft.tableId} preference={draft.seating} onSelect={choose} />
          </div>
          <ul className="plan-legend" aria-label={t('reservationPlanLegend')}>
            <li><span className="legend-available" aria-hidden="true">○</span>{tableStateNames.available[language]}</li>
            <li><span className="legend-reserved" aria-hidden="true">×</span>{tableStateNames.reserved[language]}</li>
            <li><span className="legend-selected" aria-hidden="true">✓</span>{t('reservationSelected')}</li>
            <li><span className="legend-small" aria-hidden="true">–</span>{tableStateNames.tooSmall[language]}</li>
          </ul>
        </section>
        <div className="seating-sidebar">
          {recommended && recommended.table.id !== selected?.id && (
            <section className="booking-panel seating-recommended" aria-label={t('reservationRecommendation')}>
              <p className="eyebrow"><Leaf size={16} aria-hidden="true" />{t('reservationRecommendation')}</p>
              <h3>{t('reservationTable')} <bdi>{tableNumber(recommended.table)}</bdi></h3>
              <p>{t(recommended.reason)}</p>
              <button className="button button--line" type="button" onClick={() => choose(recommended.table)}>{t('reservationChooseRecommended')}</button>
            </section>
          )}
          <div aria-live="polite">
            {selected && (
              <section className="booking-panel seating-selection" aria-label={t('reservationSelected')}>
                <p className="eyebrow">{t('reservationSelected')}</p>
                <h3>{t('reservationTable')} <bdi>{tableNumber(selected)}</bdi></h3>
                <p>{zoneNames[selected.zone][language]} · {selected.capacity} {t('reservationCapacity')}</p>
                <p>{zoneDescriptions[selected.zone][language]}</p>
                {recommended?.table.id === selected.id && <p>{t(recommended.reason)}</p>}
                {time !== null && <p>{dateLabel(draft.date, language, fullDateOptions)} · {timeLabel(time, language)} · {t('reservationDubaiTime')}</p>}
                <p><Check size={16} aria-hidden="true" />{t('reservationTableAvailableAt')}</p>
              </section>
            )}
          </div>
          <section className="booking-panel seating-list" aria-labelledby="seating-list-heading">
            <h3 id="seating-list-heading">{t('reservationTableList')}</h3>
            {!inPreference.length && <p className="booking-hint">{t('reservationNoTables')}</p>}
            <div className="seating-list-scroll">
              {inPreference.length > 0 && <ul role="list">{inPreference.map(({ table }) => renderChoice(table))}</ul>}
              {alternatives.length > 0 && <><h4>{t('reservationOtherTables')}</h4><ul role="list">{alternatives.map(({ table }) => renderChoice(table))}</ul></>}
            </div>
            {alternateSlots.length > 0 && (
              <div className="alternative-slots">
                <strong>{t('reservationAlternatives')}</strong>
                {alternateSlots.map((alternative) => (
                  <button key={alternative} type="button" onClick={() => change({ time: alternative })}>{timeLabel(alternative, language)}</button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
