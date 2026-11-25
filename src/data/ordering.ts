import type { Localized } from '../types'
import type { TimeWindow } from '../types/ordering'

type DeliveryService = {
  name: Localized
  fee: number
  minimum: number
  window: TimeWindow
}

type Promotion = {
  active: boolean
  minimum: number
} & ({ kind: 'percent'; value: number } | { kind: 'fixed'; value: number })

// Illustrative service settings. Monetary values are in fils.
export const deliveryServices: Readonly<Record<string, DeliveryService>> = {
  dubai: { name: { ar: 'دبي', en: 'Dubai' }, fee: 1200, minimum: 6000, window: [35, 50] },
  'abu-dhabi': { name: { ar: 'أبوظبي', en: 'Abu Dhabi' }, fee: 1600, minimum: 7000, window: [45, 65] },
  sharjah: { name: { ar: 'الشارقة', en: 'Sharjah' }, fee: 1400, minimum: 6500, window: [40, 60] },
  ajman: { name: { ar: 'عجمان', en: 'Ajman' }, fee: 1500, minimum: 6500, window: [45, 65] },
  'umm-al-quwain': { name: { ar: 'أم القيوين', en: 'Umm Al Quwain' }, fee: 1800, minimum: 7500, window: [50, 70] },
  'ras-al-khaimah': { name: { ar: 'رأس الخيمة', en: 'Ras Al Khaimah' }, fee: 1900, minimum: 7500, window: [55, 75] },
  fujairah: { name: { ar: 'الفجيرة', en: 'Fujairah' }, fee: 2000, minimum: 8000, window: [55, 80] },
}

export const pickupSlots: Readonly<Record<string, { name: Localized; window: TimeWindow }>> = {
  earliest: { name: { ar: 'أقرب موعد متاح في المحاكاة', en: 'Earliest demo slot' }, window: [20, 30] },
  later: { name: { ar: 'استلام لاحق', en: 'Later pickup' }, window: [45, 55] },
  evening: { name: { ar: 'استلام بعد نحو ساعة', en: 'Pickup in about an hour' }, window: [60, 70] },
}

export const freeDelivery = { enabled: true, threshold: 18000 }

export const promotions: Readonly<Record<string, Promotion>> = {
  MARAMIA10: { active: true, kind: 'percent', value: 10, minimum: 0 },
  WELCOME20: { active: true, kind: 'fixed', value: 2000, minimum: 10000 },
  MIRA10: { active: true, kind: 'percent', value: 10, minimum: 0 },
  SALIM10: { active: true, kind: 'percent', value: 10, minimum: 0 },
  UAEWELCOME: { active: true, kind: 'fixed', value: 2000, minimum: 10000 },
  TABLE15: { active: false, kind: 'percent', value: 15, minimum: 0 },
}

export const featuredPromotion = 'MARAMIA10'

export const pairings: Readonly<Record<string, readonly string[]>> = {
  'chicken-musakhan': ['fattoush', 'lemon-mint', 'nabulsi-knafeh'],
  'mixed-grill': ['kabis', 'kidra-rice', 'lemon-mint'],
  'charcoal-chicken': ['potato-chips', 'fattoush', 'lemon-mint'],
  'palestinian-maftoul': ['labneh', 'lemon-mint', 'herbal-tea'],
  hummus: ['falafel', 'kabis', 'lemon-mint'],
  falafel: ['fattoush', 'batata-harra', 'lemon-mint'],
}

export const suggestedItems = ['kabis', 'lemon-mint', 'nabulsi-knafeh']
