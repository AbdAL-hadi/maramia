import { Facebook, Instagram, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { navigation, supportNavigation } from '../data/navigation'
import { restaurantDetails } from '../data/restaurant'
import { Brand } from './Brand'
import { LanguageSwitch } from './LanguageSwitch'
import { SignupForm } from './SignupForm'

export function Footer() {
  const { language, t } = useLanguage()
  const { address, hours, phone, email, instagram, facebook } = restaurantDetails
  return (
    <footer id="contact" className="site-footer" tabIndex={-1}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>{t('footerLine')}</p>
            <LanguageSwitch />
          </div>
          <nav aria-label={t('quickLinks')} className="footer-navigation">
            <h2>{t('quickLinks')}</h2>
            {navigation.filter(({ label }) => label !== 'contact').map(({ to, label }) => (
              <Link key={label} to={to}>{t(label)}</Link>
            ))}
          </nav>
          <div className="footer-contact">
            <h2>{t('contact')}</h2>
            <p className="location-link"><MapPin size={16} aria-hidden="true" />{t('market')}</p>
            <nav aria-label={t('contact')} className="footer-navigation">
              {supportNavigation.map(({ label, to }) => <Link key={label} to={to}>{t(label)}</Link>)}
            </nav>
            {address && <address>{address[language]}</address>}
            {hours && <p>{hours[language]}</p>}
            {phone && <p><a href={`tel:${phone}`}><bdi>{phone}</bdi></a></p>}
            {email && <p><a href={`mailto:${email}`}><bdi>{email}</bdi></a></p>}
            {(instagram || facebook) && (
              <div className="social-links" aria-label={t('social')} role="group">
                {instagram && <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} aria-hidden="true" /></a>}
                {facebook && <a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} aria-hidden="true" /></a>}
              </div>
            )}
          </div>
          <div className="footer-newsletter">
            <h2>{t('newsletter')}</h2>
            <SignupForm mode="newsletter" />
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('copyright')}</p>
          <p>{t('footerNotice')}</p>
        </div>
      </div>
    </footer>
  )
}
