import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { diningExperiences, findEditorialDish } from '../../data/brandExperience'
import { dishLink } from '../../data/menuFilters'
import { reservationLink } from '../../data/reservationLinks'
import { zoneNames } from '../../i18n/reservation'

export function DiningCollections() {
  const { language, t } = useLanguage()
  return (
    <section className="editorial-section collections-section" id="dining-experiences" tabIndex={-1} aria-labelledby="dining-collections-title">
      <div className="container">
        <div className="editorial-heading">
          <h2 id="dining-collections-title">{t('diningExperiences')}</h2>
          <p>{t('proposedExperiences')}</p>
        </div>
        <div className="dining-collections">
          {diningExperiences.map((experience) => (
            <article className="dining-collection" key={experience.id} data-experience={experience.id} aria-labelledby={`collection-${experience.id}`}>
              <div className="collection-image"><img src={experience.image} alt="" loading="lazy" decoding="async" /></div>
              <div className="collection-content">
                <p className="eyebrow">{t('recommendedSeating')} · {zoneNames[experience.seating][language]}</p>
                <h3 id={`collection-${experience.id}`} tabIndex={-1}>{experience.title[language]}</h3>
                <p>{experience.description[language]}</p>
                <div className="collection-menu">
                  <strong>{t('recommendedDishes')}</strong>
                  <ul role="list">
                    {experience.dishes.map((id) => {
                      const dish = findEditorialDish(id)
                      return dish ? <li key={id}><Link to={dishLink(dish.slug)}>{language === 'ar' ? dish.nameAr : dish.nameEn}</Link></li> : null
                    })}
                  </ul>
                </div>
                <div className="editorial-actions">
                  <Link className="button button--forest" to={reservationLink(experience.seating, experience.occasion)}>{t('reserveExperience')}</Link>
                  <Link className="button button--line" to="/menu">{t('exploreMenu')}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
