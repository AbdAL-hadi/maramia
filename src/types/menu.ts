import type { Language, Localized } from './index'

export type MenuCategory = 'cold-mezze' | 'hot-mezze' | 'charcoal-grill' | 'traditional' | 'sides' | 'desserts' | 'cold-beverages' | 'hot-beverages'

export type MenuVariant = {
  id: string
  name: Localized
  priceAED: number
}

export type MenuItem = {
  id: string
  slug: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  category: MenuCategory
  priceAED: number
  image: string | null
  ingredients: Readonly<Record<Language, readonly string[]>>
  dietaryTags: readonly 'vegetarian'[]
  isSignature: boolean
  isFeatured: boolean
  available: boolean
  variants: readonly MenuVariant[]
  source: { url: string; name: string }
}

export type DishSelection = {
  itemId: string
  variantId: string | null
  quantity: number
  instructions: string
}
