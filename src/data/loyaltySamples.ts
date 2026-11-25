import { tiers, visitPoints, welcomePoints, type LoyaltyMembership, type LoyaltyTransaction, type TierId } from './loyalty'

const day = 86_400_000

export function sampleMembership(tier: TierId, now = Date.now(), completeVisit = false): LoyaltyMembership {
  const joinedAt = now - 10 * day
  const ledger: LoyaltyTransaction[] = [{ id: 'welcome', type: 'welcome', points: welcomePoints, timestamp: joinedAt }]
  if (tier !== 'sage') {
    const points = (tiers.find(({ id }) => id === tier)?.threshold ?? 0) + 125
    ledger.push({
      id: 'order:MRA-A000000001', reference: 'MRA-A000000001', type: 'order',
      points, timestamp: now - 4 * day, earnedTier: 'sage',
    })
    ledger.push({
      id: 'redeem:MRA-A000000002', reference: 'MRA-A000000002', type: 'redeem',
      points: -100, timestamp: now - 2 * day, rewardId: 'aed5',
    })
    ledger.push({ id: 'adjustment:sample', type: 'adjustment', points: 25, timestamp: now - day })
  }
  if (completeVisit) ledger.push({
    id: 'visit:MRA-R-A00000000001', type: 'visit', reference: 'MRA-R-A00000000001', points: visitPoints, timestamp: now,
  })
  return { version: 1, id: 'MR-DEMO-' + tier.toUpperCase(), joinedAt, preferences: { food: 'traditional', atmosphere: 'family' }, ledger }
}
