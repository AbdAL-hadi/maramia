export type SeatingZone = 'main' | 'family' | 'terrace' | 'private'
export type SeatingPreference = SeatingZone | 'any'
export type Occasion = 'casual' | 'gathering' | 'birthday' | 'anniversary' | 'business' | 'celebration'
export type ExperienceRequest = 'decoration' | 'dessert' | 'quiet' | 'highChair' | 'accessible'
export type TableState = 'available' | 'reserved' | 'tooSmall'

export type DiningTable = {
  id: string
  number: number
  zone: SeatingZone
  capacity: 2 | 4 | 6 | 8 | 12
  x: number
  y: number
  shape: 'round' | 'square' | 'long'
}

export type BookingDraft = {
  date: string
  time: number | null
  guests: number
  seating: SeatingPreference
  tableId: string
  occasion: Occasion
  experiences: ExperienceRequest[]
}

export type Booking = Omit<BookingDraft, 'seating' | 'time'> & {
  id: string
  time: number
  duration: number
  status: 'active' | 'cancelled'
}

export type GuestDetails = {
  name: string
  phone: string
  email: string
  requests: string
}
