import { useId, type KeyboardEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { diningTables } from '../../data/reservations'
import { tableStateNames, zoneNames } from '../../i18n/reservation'
import type { DiningTable, SeatingPreference, SeatingZone, TableState } from '../../types/reservation'

const rooms: readonly { zone: SeatingZone; left: number; top: number; width: number; height: number }[] = [
  { zone: 'main', left: 29, top: 28, width: 488, height: 251 },
  { zone: 'family', left: 29, top: 343, width: 359, height: 211 },
  { zone: 'terrace', left: 559, top: 28, width: 292, height: 292 },
  { zone: 'private', left: 437, top: 359, width: 414, height: 195 },
]

const plants = [
  [49, 56], [492, 56], [48, 255], [492, 255], [583, 58], [827, 57], [583, 199], [827, 299],
  [51, 369], [367, 529], [462, 385], [828, 527], [254, 605], [578, 605],
]

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g className="plan-tree" transform={`translate(${x} ${y})`}>
      <circle r="15" /><circle r="10" />
      <path d="M0 8V-7m0 10-5-4m5 2 6-5" />
    </g>
  )
}

export function tableNumber(table: DiningTable) {
  return String(table.number).padStart(2, '0')
}

function tableGeometry(table: DiningTable) {
  const w = table.shape === 'round' ? (table.capacity === 2 ? 40 : 48) : table.shape === 'square' ? 49 : 43 + table.capacity * 5
  const h = table.shape === 'round' ? w : table.shape === 'square' ? 39 : 40
  const seats = Array.from({ length: table.capacity }, (_, index) => {
    if (table.shape === 'round') {
      const angle = -Math.PI / 2 + index * 2 * Math.PI / table.capacity
      return { x: Math.cos(angle) * (w / 2 + 8), y: Math.sin(angle) * (h / 2 + 8) }
    }
    const perSide = table.capacity / 2
    return { x: ((index % perSide + 0.5) / perSide - 0.5) * w, y: (index < perSide ? -1 : 1) * (h / 2 + 9) }
  })
  return { w, h, seats }
}

export function FloorPlan({ states, selected, preference, onSelect }: {
  states: ReadonlyMap<string, TableState>
  selected: string
  preference: SeatingPreference
  onSelect: (table: DiningTable) => void
}) {
  const { t, language } = useLanguage()
  const hatch = useId()
  const tile = useId()
  const description = useId()
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  function onKey(event: KeyboardEvent<SVGGElement>, table: DiningTable) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(table)
  }

  return (
    <svg viewBox="0 0 880 648" className="restaurant-plan" role="group" aria-label={t('reservationPlanTitle')} aria-describedby={description}>
      <desc id={description}>{t('reservationPlanDescription')}</desc>
      <defs>
        <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#ecdfd5" /><path d="M0 0V6" stroke="#a17867" strokeWidth="1.3" />
        </pattern>
        <pattern id={tile} width="23" height="23" patternUnits="userSpaceOnUse"><path d="M0 23V0H23" fill="none" stroke="#a4ac91" strokeWidth=".7" opacity=".42" /></pattern>
      </defs>
      <rect x="13" y="13" width="854" height="622" rx="7" className="plan-boundary" />
      {rooms.map(({ zone, left, top, width, height }) => (
        <g key={zone} aria-hidden="true">
          <rect x={left} y={top} width={width} height={height} rx="8" className={`plan-room plan-room--${zone}${preference === zone ? ' plan-room--preferred' : ''}`} />
          {zone === 'terrace' && <rect x={left + 3} y={top + 3} width={width - 6} height={height - 6} rx="7" fill={`url(#${tile})`} />}
          <text x={left + width / 2} y={top + 33} className="plan-room-name" direction={dir}>{zoneNames[zone][language]}</text>
        </g>
      ))}
      <g aria-hidden="true" className="plan-architecture">
        <path d="M418 625V311H524M418 311H85M524 310V95M419 341H742" className="plan-corridor-line" />
        <path d="M265 280h31m357 40h51M178 343h44m384 16h56" className="plan-door" />
        <path d="M374 539v-65m77 68v-72M44 295h153m561 44h72" className="plan-detail-line" />
        <rect x="31" y="579" width="194" height="41" rx="4" className="plan-reception" />
        <text x="128" y="605" direction={dir}>{t('reservationReception')}</text>
        <path d="M366 628h106M370 628v-19m97 19v-19M419 627v-16m-7 7 7-7 7 7" className="plan-entrance-mark" />
        <text x="419" y="596" direction={dir}>{t('reservationEntrance')}</text>
        <text x="281" y="304" className="plan-corridor-label" direction={dir}>{t('reservationWalkway')}</text>
        {plants.map(([x, y]) => <Tree key={`${x}-${y}`} x={x} y={y} />)}
      </g>
      {diningTables.map((table) => {
        const state = states.get(table.id) ?? 'reserved'
        const active = selected === table.id && state === 'available'
        const { w, h, seats } = tableGeometry(table)
        const mode = active ? 'selected' : state
        const stateLabel = active ? t('reservationSelected') : tableStateNames[state][language]
        const label = `${t('reservationTable')} ${tableNumber(table)} · ${zoneNames[table.zone][language]} · ${t('reservationCapacity')} ${table.capacity} · ${stateLabel}`
        return (
          <g
            key={table.id} className={`plan-table plan-table--${mode}`}
            transform={`translate(${table.x} ${table.y})`} role="button" tabIndex={state === 'available' ? 0 : -1}
            aria-label={label} aria-pressed={active} aria-disabled={state !== 'available'}
            data-plan-table={table.id} data-table-state={mode}
            onClick={state === 'available' ? () => onSelect(table) : undefined}
            onKeyDown={state === 'available' ? (event) => onKey(event, table) : undefined}
          >
            <rect className="plan-table-hit" x={-w / 2 - 13} y={-h / 2 - 17} width={w + 26} height={h + 34} rx="11" fill="transparent" />
            <g aria-hidden="true">
              {seats.map((seat, index) => <rect className="plan-chair" key={index} x={seat.x - 5} y={seat.y - 4} rx="2" width="10" height="8" />)}
              <rect
                className="plan-table-top" x={-w / 2} y={-h / 2} width={w} height={h}
                rx={table.shape === 'round' ? w / 2 : 6} fill={state === 'reserved' ? `url(#${hatch})` : undefined}
              />
              <text y="-1" className="plan-table-number">{tableNumber(table)}</text>
              <text y="13" className="plan-table-capacity">{table.capacity}</text>
              {mode !== 'available' && (
                <g transform={`translate(${w / 2 + 2} ${-h / 2})`} className="plan-table-marker">
                  <circle r="8" />
                  {mode === 'selected' ? <path d="m-4 0 3 3 5-6" /> : mode === 'reserved' ? <path d="m-2.8 -2.8 5.6 5.6m0-5.6-5.6 5.6" /> : <path d="M-3 0h6" />}
                </g>
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}
