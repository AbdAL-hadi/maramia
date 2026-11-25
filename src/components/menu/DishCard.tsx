import { Leaf } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { aedCurrency, dishLink } from '../../data/menuFilters'
import type { MenuItem } from '../../types/menu'
import { DishMedia } from './DishMedia'

export function DishCard({ item, home = false, search = '' }: { item: MenuItem; home?: boolean; search?: string }) {
  const { language, t } = useLanguage()
  const id = useId()
  const arabic = language === 'ar'
  const hasDifferentPrices = item.variants.some((variant) => variant.priceAED !== item.priceAED)

  return (
    <article className="dish menu-dish-card" data-dish={item.slug} data-price={item.priceAED}>
      <div className="dish-card-visual">
        <DishMedia item={item} className="dish-media" />
        {item.isSignature && <span className="signature-tag">{t('signature')}</span>}
      </div>
      <div className="dish-body">
        <div className="dish-heading">
          <h3 id={`${id}-name`}>{arabic ? item.nameAr : item.nameEn}</h3>
          <span className="dish-price">
            {hasDifferentPrices && <small>{t('fromPrice')} </small>}
            <bdi>{aedCurrency[language].format(item.priceAED)}</bdi>
          </span>
        </div>
        {home && <p className="dish-secondary" lang={arabic ? 'en' : 'ar'} dir={arabic ? 'ltr' : 'rtl'}>{arabic ? item.nameEn : item.nameAr}</p>}
        <p className="dish-description">{arabic ? item.descriptionAr : item.descriptionEn}</p>
        <div className="dish-card-actions">
          <Link
            className="dish-details-link" id={`${id}-details`}
            aria-labelledby={`${id}-details ${id}-name`}
            to={dishLink(item.slug, search)}
            state={home ? undefined : { openedFromMenu: true }}
          >{t('details')}</Link>
          {item.dietaryTags.includes('vegetarian') && (
            <span className="vegetarian-tag"><Leaf size={15} aria-hidden="true" />{t('vegetarian')}</span>
          )}
        </div>
      </div>
    </article>
  )
}
