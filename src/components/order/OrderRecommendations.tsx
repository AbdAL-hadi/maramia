import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { menuCatalog } from '../../data/menu'
import { dishLink } from '../../data/menuFilters'
import { pairings, suggestedItems } from '../../data/ordering'
import { DishMedia } from '../menu/DishMedia'
import { Money } from './OrderAmounts'

export function OrderRecommendations() {
  const { t, language } = useLanguage()
  const { cart } = useOrdering()
  const ids = new Set([...cart.flatMap((line) => pairings[line.itemId] ?? []), ...suggestedItems])
  const suggestions = Array.from(ids)
    .filter((id) => !cart.some((line) => line.itemId === id))
    .flatMap((id) => menuCatalog.find((item) => item.id === id && item.available) ?? [])
    .slice(0, 3)
  if (!suggestions.length) return null
  return (
    <section className="order-card order-pairings" aria-labelledby="order-pairings-heading">
      <h2 id="order-pairings-heading">{t('pairings')}</h2>
      <ul role="list">
        {suggestions.map((item) => (
          <li key={item.id}>
            <Link to={dishLink(item.slug)}>
              <DishMedia item={item} className="order-pairing-photo" />
              <span>{language === 'ar' ? item.nameAr : item.nameEn} <Money fils={Math.round(item.priceAED * 100)} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
