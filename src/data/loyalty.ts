import type { Localized } from '../types'
import type { QuizPreferences } from './marketingPreferences'

export const tierIds = ['sage', 'olive', 'golden'] as const
export type TierId = typeof tierIds[number]
type Tier = { id: TierId; threshold: number; multiplier: number; name: Localized; benefit: Localized }

export const tiers: readonly Tier[] = [
  { id: 'sage', threshold: 0, multiplier: 100, name: { ar: 'الميرمية', en: 'Sage' }, benefit: { ar: 'المكافآت الأساسية ونقطة لكل درهم مؤهل.', en: 'Standard rewards and one point per eligible dirham.' } },
  { id: 'olive', threshold: 500, multiplier: 125, name: { ar: 'الزيتون', en: 'Olive' }, benefit: { ar: 'مكافآت مختارة وكسب أسرع للنقاط عند الطلب.', en: 'Selected exclusive rewards and a higher earning multiplier.' } },
  { id: 'golden', threshold: 1500, multiplier: 150, name: { ar: 'الزيتون الذهبي', en: 'Golden Olive' }, benefit: { ar: 'المكافآت المميزة وأعلى معامل لكسب النقاط.', en: 'Premium demo rewards and the highest earning multiplier.' } },
]

export const welcomePoints = 50
export const visitPoints = 50
export const completedOrderStage = 4
export const maxTransactionPoints = 1_000_000

export type Reward = {
  id: string
  name: Localized
  points: number
  minimum: number
  tier: TierId
  active: boolean
  benefit: { kind: 'fixed'; fils: number } | { kind: 'item'; itemId: string }
}

export const rewards: readonly Reward[] = [
  { id: 'aed5', name: { ar: 'خصم ٥ دراهم', en: 'AED 5 Dining Credit' }, points: 100, minimum: 5000, tier: 'sage', active: true, benefit: { kind: 'fixed', fils: 500 } },
  { id: 'aed15', name: { ar: 'خصم ١٥ درهمًا', en: 'AED 15 Dining Credit' }, points: 250, minimum: 9000, tier: 'sage', active: true, benefit: { kind: 'fixed', fils: 1500 } },
  { id: 'coffee', name: { ar: 'قهوة فلسطينية ضيافة', en: 'Complimentary Palestinian Coffee' }, points: 300, minimum: 7000, tier: 'sage', active: true, benefit: { kind: 'item', itemId: 'palestinian-coffee' } },
  { id: 'aed35', name: { ar: 'خصم ٣٥ درهمًا', en: 'AED 35 Dining Credit' }, points: 500, minimum: 15000, tier: 'olive', active: true, benefit: { kind: 'fixed', fils: 3500 } },
  { id: 'knafeh', name: { ar: 'كنافة نابلسية ضيافة', en: 'Complimentary Nabulsi Knafeh' }, points: 550, minimum: 12000, tier: 'olive', active: true, benefit: { kind: 'item', itemId: 'nabulsi-knafeh' } },
  { id: 'golden-table', name: { ar: 'مكافأة مائدة الزيتون الذهبي', en: 'Golden Olive Dining Reward' }, points: 850, minimum: 22000, tier: 'golden', active: true, benefit: { kind: 'fixed', fils: 5000 } },
]

export function rewardById(id: unknown) {
  return rewards.find((entry) => entry.id === id)
}

export type LoyaltyPreferences = Partial<Pick<QuizPreferences, 'food' | 'atmosphere'>>
export type LoyaltyTransactionType = 'welcome' | 'order' | 'visit' | 'redeem' | 'reversal' | 'adjustment'
export type LoyaltyTransaction = {
  id: string
  type: LoyaltyTransactionType
  points: number
  timestamp: number
  reference?: string
  rewardId?: string
  reverses?: string
  earnedTier?: TierId
}
export type LoyaltyMembership = {
  version: 1
  id: string
  joinedAt: number
  preferences: LoyaltyPreferences
  ledger: LoyaltyTransaction[]
}

export const transactionNames: Record<LoyaltyTransactionType, Localized> = {
  welcome: { ar: 'نقاط الترحيب', en: 'Welcome points' },
  order: { ar: 'طلب مكتمل', en: 'Completed order' },
  visit: { ar: 'زيارة مطعم مكتملة', en: 'Completed restaurant visit' },
  redeem: { ar: 'استبدال مكافأة', en: 'Reward redemption' },
  reversal: { ar: 'نقاط مسترجعة', en: 'Reward points returned' },
  adjustment: { ar: 'تعديل تجريبي', en: 'Demo adjustment' },
}

export function membershipTotals(member?: LoyaltyMembership | null) {
  let balance = 0
  let qualifying = 0
  let redeemed = 0
  let redemptions = 0
  let orders = 0
  for (const transaction of member?.ledger ?? []) {
    balance += transaction.points
    if (transaction.type === 'order' || transaction.type === 'visit') qualifying += transaction.points
    if (transaction.type === 'order') orders += 1
    if (transaction.type === 'redeem') {
      redeemed -= transaction.points
      redemptions += 1
    } else if (transaction.type === 'reversal') {
      redeemed -= transaction.points
      redemptions -= 1
    }
  }
  const tier = [...tiers].reverse().find(({ threshold }) => qualifying >= threshold) ?? tiers[0]
  const nextTier = tiers.find(({ threshold }) => threshold > qualifying)
  return { balance, qualifying, redeemed, redemptions, orders, tier, nextTier }
}

export function earnsPoints(netFoodFils: number, tier: Tier) {
  return Math.floor(Math.max(0, netFoodFils) * tier.multiplier / 10000)
}

export function qualifiesForTier(tier: TierId, required: TierId) {
  return tierIds.indexOf(tier) >= tierIds.indexOf(required)
}

export function rewardAccess(reward: Reward | undefined, member?: LoyaltyMembership | null) {
  if (!reward?.active) return 'unavailable'
  if (!member) return 'join'
  const { tier, balance } = membershipTotals(member)
  if (!qualifiesForTier(tier.id, reward.tier)) return 'tier'
  if (balance < reward.points) return 'points'
  return 'eligible'
}

export type RewardAccess = ReturnType<typeof rewardAccess> | 'minimum' | 'item'
