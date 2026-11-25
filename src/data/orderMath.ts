import { menuCatalog } from './menu'
import { campaignStatus, promotionCampaign } from './campaigns'
import { deliveryServices, freeDelivery, pickupSlots, promotions } from './ordering'
import { rewardAccess, type LoyaltyMembership, type Reward, type RewardAccess } from './loyalty'
import type { DishSelection } from '../types/menu'
import type { Fulfillment, OrderAmounts } from '../types/ordering'

export const maxLineQuantity = 20
export const maxInstructions = 250
export const maxCartLines = 75

const itemsById = new Map(menuCatalog.filter((item) => item.available).map((item) => [item.id, item]))

export function resolveDish(selection: Pick<DishSelection, 'itemId' | 'variantId'>) {
  const item = itemsById.get(selection.itemId)
  if (!item) return null
  const variant = item.variants.find((entry) => entry.id === selection.variantId) ?? null
  if (item.variants.length ? !variant : selection.variantId !== null) return null
  return { item, variant, unitPrice: Math.round((variant?.priceAED ?? item.priceAED) * 100) }
}

export function getDeliveryService(id: string) {
  return Object.hasOwn(deliveryServices, id) ? deliveryServices[id] : null
}

export function getPickupSlot(id: string) {
  return Object.hasOwn(pickupSlots, id) ? pickupSlots[id] : null
}

export function getPromotion(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase()
  const promotion = Object.hasOwn(promotions, normalized) ? promotions[normalized] : null
  const campaign = promotionCampaign(normalized)
  if (!promotion?.active || (campaign && campaignStatus(campaign) !== 'active')) return { status: 'invalid', discount: 0 } as const
  if (!subtotal || subtotal < promotion.minimum) return { status: 'minimum', discount: 0, minimum: promotion.minimum } as const
  const discount = promotion.kind === 'percent' ? Math.round(subtotal * promotion.value / 100) : promotion.value
  return { status: 'applied', discount: Math.min(discount, subtotal), code: normalized } as const
}

export function calculateSubtotal(selections: readonly DishSelection[]) {
  return selections.reduce((sum, selection) => sum + (resolveDish(selection)?.unitPrice ?? 0) * selection.quantity, 0)
}

export function quoteReward(reward: Reward | undefined, member: LoyaltyMembership | undefined, cart: readonly DishSelection[], subtotal: number) {
  const access = rewardAccess(reward, member)
  if (access !== 'eligible' || !reward) return { status: access as RewardAccess, discount: 0 }
  if (subtotal < reward.minimum) return { status: 'minimum' as const, discount: 0 }
  const benefit = reward.benefit
  if (benefit.kind === 'fixed') return { status: 'eligible' as const, discount: Math.min(benefit.fils, subtotal) }
  const unitPrice = cart.filter((line) => line.itemId === benefit.itemId)
    .reduce((value, line) => Math.max(value, resolveDish(line)?.unitPrice ?? 0), 0)
  return { status: unitPrice ? 'eligible' as const : 'item' as const, discount: unitPrice }
}

export function calculateAmounts(subtotal: number, fulfillment: Fulfillment, code: string, rewardDiscount = 0): OrderAmounts {
  const service = fulfillment.mode === 'delivery' ? getDeliveryService(fulfillment.emirate) : null
  const discount = rewardDiscount || getPromotion(code, subtotal).discount
  const isFree = freeDelivery.enabled && subtotal >= freeDelivery.threshold
  const deliveryFee = service && subtotal > 0 && !isFree ? service.fee : 0
  return { subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee }
}

export function matchesSelection(a: DishSelection, b: DishSelection) {
  return a.itemId === b.itemId && a.variantId === b.variantId && a.instructions === b.instructions
}
