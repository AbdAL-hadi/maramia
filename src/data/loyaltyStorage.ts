import { quizOption } from './marketingPreferences'
import {
  maxTransactionPoints, rewardById, tierIds, visitPoints, welcomePoints,
  type LoyaltyMembership, type LoyaltyPreferences, type LoyaltyTransaction,
} from './loyalty'

const orderRef = /^MRA-[A-F0-9]{10}$/
const visitRef = /^MRA-R-[A-F0-9]{12}$/

function record(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
}

function timestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000
}

export function cleanLoyaltyPreferences(value: unknown): LoyaltyPreferences {
  const { food, atmosphere } = record(value)
  const result: LoyaltyPreferences = {}
  if (typeof food === 'string' && quizOption('food', food)) result.food = food as LoyaltyPreferences['food']
  if (typeof atmosphere === 'string' && quizOption('atmosphere', atmosphere)) result.atmosphere = atmosphere as LoyaltyPreferences['atmosphere']
  return result
}

export function parseMembership(value: unknown): LoyaltyMembership | null {
  const { version, id, joinedAt, preferences, ledger } = record(value)
  if (version !== 1 || typeof id !== 'string' || !/^MR-[A-F0-9]{12}$/.test(id) || !timestamp(joinedAt) || !Array.isArray(ledger)) return null
  const valid = new Map<string, LoyaltyTransaction>()
  const reversals = new Set<string>()
  let balance = 0
  for (const candidate of ledger) {
    const raw = record(candidate)
    const { type, points, reference, rewardId, reverses, earnedTier } = raw
    const date = raw.timestamp
    if (!timestamp(date) || date < joinedAt || typeof points !== 'number' || !Number.isSafeInteger(points)
      || Math.abs(points) > maxTransactionPoints || balance + points < 0) continue
    let transaction: LoyaltyTransaction | undefined
    if (type === 'welcome' && points === welcomePoints) {
      transaction = { id: 'welcome', type, points, timestamp: date }
    } else if (type === 'order' && typeof reference === 'string' && orderRef.test(reference) && points >= 0) {
      transaction = {
        id: 'order:' + reference, type, reference, points, timestamp: date,
        earnedTier: tierIds.find((tier) => tier === earnedTier),
      }
    } else if (type === 'visit' && typeof reference === 'string' && visitRef.test(reference) && points === visitPoints) {
      transaction = { id: 'visit:' + reference, type, reference, points, timestamp: date }
    } else if (type === 'redeem' && typeof reference === 'string' && orderRef.test(reference) && points < 0) {
      const reward = rewardById(rewardId)
      if (reward) transaction = { id: 'redeem:' + reference, type, reference, rewardId: reward.id, points, timestamp: date }
    } else if (type === 'reversal' && typeof reverses === 'string') {
      const debit = valid.get(reverses)
      if (debit?.type === 'redeem' && !reversals.has(reverses) && points === -debit.points) {
        transaction = { id: 'reversal:' + reverses, type, points, timestamp: date, reverses, reference: debit.reference, rewardId: debit.rewardId }
      }
    } else if (type === 'adjustment' && points !== 0 && typeof raw.id === 'string' && /^adjustment:[A-Za-z0-9-]{1,35}$/.test(raw.id)) {
      transaction = { id: raw.id, type, points, timestamp: date }
    }
    if (!transaction || valid.has(transaction.id)) continue
    if (transaction.reverses) reversals.add(transaction.reverses)
    valid.set(transaction.id, transaction)
    balance += points
  }
  return { version, id, joinedAt, preferences: cleanLoyaltyPreferences(preferences), ledger: [...valid.values()] }
}
