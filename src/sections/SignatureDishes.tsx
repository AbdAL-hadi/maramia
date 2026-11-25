import { Link } from 'react-router-dom'
import { DishCard } from '../components/menu/DishCard'
import { Reveal } from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { menuCatalog } from '../data/menu'

const featured = menuCatalog.filter((item) => item.available && item.isFeatured)

export function SignatureDishes() {
  const { t } = useLanguage()

  return (
    <section id="menu" className="menu-section section-space" aria-labelledby="menu-title" tabIndex={-1}>
      <div className="container">
        <Reveal className="section-heading text-center">
          <p className="eyebrow">{t('menuKicker')}</p>
          <h2 id="menu-title">{t('menuTitle')}</h2>
          <p className="section-text">{t('menuNote')}</p>
        </Reveal>
        <ul className="dish-grid grid" role="list">
          {featured.map((item, index) => (
            <li key={item.id}>
              <Reveal className="signature-reveal" delay={(index % 3) * 0.07}>
                <DishCard item={item} home />
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="menu-action text-center">
          <Link className="button button--line" to="/menu">{t('browseMenu')}</Link>
        </div>
      </div>
    </section>
  )
}
