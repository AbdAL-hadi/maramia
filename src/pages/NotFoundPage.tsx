import { Link } from 'react-router-dom'
import { SageSprig } from '../components/Brand'
import { useLanguage } from '../context/LanguageContext'

export function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <section className="preview-page">
      <SageSprig className="preview-sprig" />
      <div className="container">
        <p className="eyebrow" aria-hidden="true">404</p>
        <h1>{t('missing')}</h1>
        <p className="section-text">{t('placeholder')}</p>
        <div className="preview-actions">
          <Link className="button button--forest" to="/menu">{t('exploreMenu')}</Link>
          <Link className="button button--line" to="/">{t('back')}</Link>
        </div>
      </div>
    </section>
  )
}
