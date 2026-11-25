import type { DishSelection } from '../types/menu'
import type { SeatingZone } from '../types/reservation'
import { campaigns, campaignStatus, findCampaign } from './campaigns'
import type { QuizPreferences } from './marketingPreferences'
import { menuCatalog } from './menu'
import { resolveDish } from './orderMath'
import { diningTables } from './reservations'

const dishChoices: Record<QuizPreferences['food'], readonly string[]> = {
  traditional: ['chicken-musakhan', 'palestinian-maftoul', 'hummus', 'nabulsi-knafeh'],
  vegetarian: ['palestinian-maftoul', 'falafel', 'hummus', 'palestinian-moussaka'],
  grill: ['shish-tawouk', 'fattoush', 'hummus', 'mixed-grill'],
  mezze: ['hummus', 'falafel', 'moutabal', 'batata-harra'],
}

const budgetCount = { light: 2, balanced: 3, generous: 4 } as const
const budgetPerGuest = { light: 6500, balanced: 10000, generous: 15000 } as const

export function tableRecommendation(preferences: QuizPreferences) {
  const guests = Number(preferences.guests)
  const availableZone = (zone: SeatingZone) => diningTables.some((table) => table.zone === zone && table.capacity >= guests)
  const seating = availableZone(preferences.atmosphere) ? preferences.atmosphere : 'family'
  const matchingCampaign = preferences.occasion === 'business' ? 'business'
    : preferences.occasion === 'celebration' ? 'celebrations'
    : preferences.occasion === 'gathering' || guests >= 4 ? 'family'
    : preferences.food === 'mezze' ? 'mezze' : 'taste'
  const candidate = findCampaign(matchingCampaign)
  const campaign = candidate && campaignStatus(candidate) === 'active'
    ? candidate : campaigns.find((entry) => campaignStatus(entry) === 'active')
  const dishes: DishSelection[] = []
  let remaining = guests * budgetPerGuest[preferences.spend]
  for (const id of dishChoices[preferences.food]) {
    if (dishes.length === budgetCount[preferences.spend]) break
    const item = menuCatalog.find((dish) => dish.id === id && dish.available)
    if (!item) continue
    const selection = { itemId: id, variantId: item.variants[0]?.id ?? null }
    const resolved = resolveDish(selection)
    if (!resolved || !resolved.unitPrice) continue
    const quantity = Math.min(Math.ceil(guests / 2), Math.floor(remaining / resolved.unitPrice))
    if (quantity < 1) continue
    dishes.push({ ...selection, quantity, instructions: '' })
    remaining -= quantity * resolved.unitPrice
  }
  return { dishes, seating, occasion: preferences.occasion, campaign }
}
