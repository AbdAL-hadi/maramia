import type { Occasion, SeatingZone } from '../types/reservation'
import { occasions, seatingZones } from './reservations'

export function reservationLink(seating?: SeatingZone, occasion?: Occasion) {
  const params = new URLSearchParams()
  if (seating) params.set('seating', seating)
  if (occasion) params.set('occasion', occasion)
  const query = params.toString()
  return query ? `/reservation?${query}` : '/reservation'
}

export function reservationPreferences(params: URLSearchParams) {
  return {
    seating: seatingZones.find((zone) => params.get('seating') === zone) ?? 'any' as const,
    occasion: occasions.find((occasion) => params.get('occasion') === occasion) ?? 'casual' as const,
  }
}
