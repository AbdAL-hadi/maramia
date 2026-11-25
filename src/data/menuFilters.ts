import type { Language } from '../types'
import type { MenuCategory, MenuItem } from '../types/menu'

export type MenuFilters = {
  category: MenuCategory | 'all'
  query: string
  vegetarian: boolean
  sort: 'menu' | 'price-asc' | 'price-desc'
}

export const defaultFilters: MenuFilters = {
  category: 'all',
  query: '',
  vegetarian: false,
  sort: 'menu',
}

export const aedCurrency = {
  ar: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 2 }),
  en: new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 2 }),
} satisfies Record<Language, Intl.NumberFormat>

export function normalizeSearchText(value: string) {
  return value.normalize('NFKD').toLowerCase().replace(/[\p{M}ـ]/gu, '')
    .replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export function filterMenu(items: readonly MenuItem[], filters: MenuFilters) {
  const terms = normalizeSearchText(filters.query).split(' ').filter(Boolean)
  const matches = items.filter((item) => {
    if (!item.available || (filters.category !== 'all' && item.category !== filters.category)) return false
    if (filters.vegetarian && !item.dietaryTags.includes('vegetarian')) return false
    if (!terms.length) return true
    const text = normalizeSearchText([
      item.nameAr, item.nameEn, item.source.name, item.descriptionAr, item.descriptionEn,
      ...item.ingredients.ar, ...item.ingredients.en,
    ].join(' '))
    return terms.every((term) => text.includes(term))
  })
  if (filters.sort === 'price-asc') matches.sort((a, b) => a.priceAED - b.priceAED)
  if (filters.sort === 'price-desc') matches.sort((a, b) => b.priceAED - a.priceAED)
  return matches
}

export function dishLink(slug: string, existingSearch = '') {
  const query = new URLSearchParams(existingSearch)
  query.set('dish', slug)
  return { pathname: '/menu', search: `?${query}` }
}
