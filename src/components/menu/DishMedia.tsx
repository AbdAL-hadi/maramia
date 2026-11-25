import { Coffee, CookingPot, CupSoda, Flame, IceCreamBowl, Salad, Utensils } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { menuCategories } from '../../data/menu'
import type { MenuCategory, MenuItem } from '../../types/menu'
import { SageSprig } from '../Brand'

const photographs = import.meta.glob<string>('../../assets/menu/*.webp', { eager: true, import: 'default' })

const categoryIcons = {
  'cold-mezze': Salad,
  'hot-mezze': CookingPot,
  'charcoal-grill': Flame,
  traditional: Utensils,
  sides: Utensils,
  desserts: IceCreamBowl,
  'cold-beverages': CupSoda,
  'hot-beverages': Coffee,
} satisfies Record<MenuCategory, typeof Coffee>

export function DishMedia({ item, className, priority = false }: {
  item: MenuItem
  className: string
  priority?: boolean
}) {
  const { language } = useLanguage()
  const image = item.image && photographs[`../../assets/menu/${item.image}.webp`]
  const [failedImage, setFailedImage] = useState<string>()
  const Icon = categoryIcons[item.category]

  return (
    <div className={className}>
      {image && failedImage !== image ? (
        <img
          src={image} alt="" width="400" height="400"
          loading={priority ? 'eager' : 'lazy'} decoding="async"
          onError={() => setFailedImage(image)}
        />
      ) : (
        <div className={`dish-image-fallback dish-image-fallback--${item.category}`} aria-hidden="true">
          <SageSprig className="dish-fallback-sprig" />
          <Icon size={38} strokeWidth={1.2} />
          <span>{menuCategories[item.category][language]}</span>
        </div>
      )}
    </div>
  )
}
