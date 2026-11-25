import type { Localized } from '../types'
import type { Occasion } from '../types/reservation'

type Option = { id: string; label: Localized }

export const quizOptions = {
  occasion: [
    { id: 'casual', label: { ar: 'وجبة على مهل', en: 'Everyday dining' } },
    { id: 'gathering', label: { ar: 'لقاء عائلي', en: 'Family gathering' } },
    { id: 'business', label: { ar: 'غداء عمل', en: 'Business lunch' } },
    { id: 'celebration', label: { ar: 'مناسبة خاصة', en: 'Special occasion' } },
  ],
  guests: [
    { id: '1', label: { ar: 'ضيف واحد', en: 'Just me' } },
    { id: '2', label: { ar: 'ضيفان', en: 'Two guests' } },
    { id: '4', label: { ar: 'أربعة ضيوف', en: 'Four guests' } },
    { id: '6', label: { ar: 'ستة ضيوف', en: 'Six guests' } },
  ],
  food: [
    { id: 'traditional', label: { ar: 'أطباق فلسطينية تقليدية', en: 'Palestinian classics' } },
    { id: 'vegetarian', label: { ar: 'أطباق نباتية', en: 'Vegetarian dishes' } },
    { id: 'grill', label: { ar: 'مشاوي على الفحم', en: 'Charcoal grills' } },
    { id: 'mezze', label: { ar: 'مقبّلات للمشاركة', en: 'Mezze to share' } },
  ],
  atmosphere: [
    { id: 'main', label: { ar: 'قاعة الطعام', en: 'The main dining room' } },
    { id: 'family', label: { ar: 'جلسة عائلية', en: 'Room for the family' } },
    { id: 'terrace', label: { ar: 'في الهواء الطلق', en: 'Open-air terrace' } },
    { id: 'private', label: { ar: 'جلسة أكثر هدوءًا', en: 'A quieter setting' } },
  ],
  spend: [
    { id: 'light', label: { ar: 'وجبة خفيفة', en: 'A lighter meal' } },
    { id: 'balanced', label: { ar: 'وجبة متكاملة', en: 'A full meal' } },
    { id: 'generous', label: { ar: 'مائدة بعدة أطباق', en: 'A generous spread' } },
  ],
} as const satisfies Record<string, readonly Option[]>

export type QuizField = keyof typeof quizOptions
export type QuizPreferences = { [K in QuizField]: typeof quizOptions[K][number]['id'] }
export type MarketingPreferences = Partial<QuizPreferences> & { newsletterOccasion?: Occasion }
export const quizFields = Object.keys(quizOptions) as QuizField[]

export function quizOption(field: QuizField, value: string) {
  return (quizOptions[field] as readonly Option[]).find(({ id }) => id === value)
}
