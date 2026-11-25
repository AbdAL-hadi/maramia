import { campaignStatus, findCampaign } from './campaigns'
import { completedOrderStage, type LoyaltyPreferences } from './loyalty'
import { menuCatalog } from './menu'
import { resolveDish } from './orderMath'
import type { DishSelection } from '../types/menu'
import type { DemoOrder, OrderItem } from '../types/ordering'

export function reorderSelection(orderItem: OrderItem): DishSelection | null {
  const item = menuCatalog.find(({ id, available }) => available && id === orderItem.itemId)
  if (!item) return null
  const previousName = orderItem.variant
  const variant = item.variants.find((choice) => choice.id === orderItem.variantId)
    ?? (orderItem.variantId === undefined && previousName ? item.variants.find((choice) =>
      choice.name.en === previousName.en || choice.name.ar === previousName.ar) : undefined)
  const selection = { itemId: item.id, variantId: variant?.id ?? null, quantity: orderItem.quantity, instructions: '' }
  return resolveDish(selection) ? selection : null
}

export function recommendedForMember(orders: readonly DemoOrder[], preferences: LoyaltyPreferences) {
  const completed = orders.filter(({ stage }) => stage === completedOrderStage)
  const counts = new Map<string, number>()
  const categories = new Map<string, number>()
  for (const order of completed) {
    for (const line of order.items) {
      const item = menuCatalog.find(({ id }) => id === line.itemId)
      if (!item) continue
      counts.set(item.id, (counts.get(item.id) ?? 0) + line.quantity)
      categories.set(item.category, (categories.get(item.category) ?? 0) + line.quantity)
    }
  }
  const score = (item: typeof menuCatalog[number]) => {
    const history = Math.min(18, (counts.get(item.id) ?? 0) * 6) + Math.min(5, categories.get(item.category) ?? 0)
    const food = preferences.food
    const match = (food === 'traditional' && item.category === 'traditional')
      || (food === 'grill' && item.category === 'charcoal-grill') || (food === 'mezze' && item.category.endsWith('mezze'))
    return history + (match ? 12 : 0) + (item.isSignature ? 4 : 0)
  }
  const items = menuCatalog.filter((item) => item.available
    && (preferences.food !== 'vegetarian' || item.dietaryTags.includes('vegetarian')))
    .sort((a, b) => score(b) - score(a)).slice(0, 3)
  const preferred = preferences.atmosphere === 'family' ? 'family'
    : preferences.atmosphere === 'private' ? 'celebrations'
    : preferences.atmosphere === 'terrace' || preferences.food === 'mezze' ? 'mezze'
    : preferences.atmosphere === 'main' ? 'business' : 'taste'
  const candidate = findCampaign(preferred)
  const fallback = findCampaign('taste')
  const campaign = candidate && campaignStatus(candidate) === 'active' ? candidate
    : fallback && campaignStatus(fallback) === 'active' ? fallback : undefined
  return { items, campaign, completed }
}
