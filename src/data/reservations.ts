import type { DiningTable, ExperienceRequest, Occasion, SeatingZone } from '../types/reservation'

export const reservationSettings = {
  timeZone: 'Asia/Dubai',
  horizonDays: 60,
  durationMinutes: 90,
  slotMinutes: 30,
  maxGuests: 12,
  sessions: [
    { label: 'reservationLunch', start: 12 * 60, end: 15 * 60 },
    { label: 'reservationDinner', start: 18 * 60, end: 22 * 60 + 30 },
  ],
} as const

export const seatingZones = ['main', 'family', 'terrace', 'private'] as const satisfies readonly SeatingZone[]
export const occasions = ['casual', 'gathering', 'birthday', 'anniversary', 'business', 'celebration'] as const satisfies readonly Occasion[]
export const experiences = ['decoration', 'dessert', 'quiet', 'highChair', 'accessible'] as const satisfies readonly ExperienceRequest[]

const floorLayout = [
  ['main', 2, 124, 114, 'round'],
  ['main', 2, 262, 114, 'round'],
  ['main', 4, 400, 114, 'square'],
  ['main', 4, 124, 216, 'square'],
  ['main', 4, 262, 216, 'square'],
  ['main', 6, 400, 216, 'long'],
  ['family', 4, 93, 414, 'square'],
  ['family', 4, 205, 414, 'square'],
  ['family', 6, 320, 414, 'long'],
  ['family', 6, 140, 507, 'long'],
  ['family', 8, 275, 507, 'long'],
  ['terrace', 2, 635, 101, 'round'],
  ['terrace', 2, 766, 101, 'round'],
  ['terrace', 4, 635, 184, 'round'],
  ['terrace', 4, 766, 184, 'round'],
  ['terrace', 4, 635, 270, 'round'],
  ['terrace', 6, 766, 270, 'long'],
  ['private', 6, 503, 459, 'long'],
  ['private', 8, 632, 459, 'long'],
  ['private', 12, 766, 459, 'long'],
] as const satisfies readonly (readonly [SeatingZone, DiningTable['capacity'], number, number, DiningTable['shape']])[]

export const diningTables: readonly DiningTable[] = floorLayout.map(([zone, capacity, x, y, shape], index) => {
  const number = index + 1
  return { id: `T${String(number).padStart(2, '0')}`, number, zone, capacity, x, y, shape }
})

type MockHold = { weekdays?: readonly number[]; tableIds: readonly string[]; start: number; duration: number }

// Repeating holds make the demonstration deterministic across dates and devices.
// Weekdays follow JavaScript's calendar numbering, with Sunday as zero.
export const mockTableHolds: readonly MockHold[] = [
  { tableIds: ['T02', 'T07', 'T14'], start: 12 * 60, duration: 90 },
  { tableIds: diningTables.map(({ id }) => id), start: 14 * 60 + 30, duration: 30 },
  { weekdays: [0, 2, 4], tableIds: ['T04', 'T12', 'T18'], start: 18 * 60, duration: 90 },
  { weekdays: [1, 3, 5, 6], tableIds: ['T05', 'T11', 'T20'], start: 18 * 60 + 30, duration: 90 },
]

export const occasionDishes: Readonly<Record<Occasion, readonly string[]>> = {
  casual: ['hummus', 'chicken-musakhan', 'lemon-mint'],
  gathering: ['falafel', 'mixed-grill', 'palestinian-maftoul'],
  birthday: ['mixed-grill', 'nabulsi-knafeh', 'lemon-mint'],
  anniversary: ['moutabal', 'spiced-sea-bass', 'nabulsi-knafeh'],
  business: ['fattoush', 'shish-tawouk', 'palestinian-coffee'],
  celebration: ['chicken-musakhan', 'mixed-grill', 'nabulsi-knafeh'],
}
