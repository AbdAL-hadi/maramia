import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { campaignPath, findCampaign, seasonalCampaignId } from '../../data/campaigns'
import { menuCatalog } from '../../data/menu'
import { dishLink } from '../../data/menuFilters'
import { occasionDishes } from '../../data/reservations'
import type { Occasion } from '../../types/reservation'
import { DishMedia } from '../menu/DishMedia'

export function ReservationPairings({ occasion, promotion = false }: { occasion: Occasion; promotion?: boolean }) {
  const { t, language } = useLanguage()
  const mezze = findCampaign(seasonalCampaignId)
  const dishes = occasionDishes[occasion].flatMap((id) => menuCatalog.find((item) => item.id === id && item.available) ?? [])
  return (
    <section className="booking-panel reservation-pairings">
      <h3>{t(promotion ? 'reservationMezze' : 'reservationPairings')}</h3>
      {promotion && <p className="booking-hint">{t('reservationMezzeIntro')}</p>}
      <ul role="list">
        {dishes.map((item) => (
          <li key={item.id}>
            <Link to={dishLink(item.slug)} target="_blank" rel="noreferrer">
              <DishMedia item={item} className="reservation-pairing-photo" />
              <span>{language === 'ar' ? item.nameAr : item.nameEn}</span>
            </Link>
          </li>
        ))}
      </ul>
      {promotion && <Link className="button button--line" to={mezze ? campaignPath(mezze) : '/offers'}>{t('reservationExploreOffers')}</Link>}
    </section>
  )
}
