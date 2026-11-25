import { AnimatePresence, m } from 'framer-motion'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useOrdering } from '../context/OrderingContext'
import { campaignPath, campaigns } from '../data/campaigns'
import { navigation } from '../data/navigation'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Brand } from './Brand'
import { LanguageSwitch } from './LanguageSwitch'

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { language, t } = useLanguage()
  const { itemCount } = useOrdering()
  const location = useLocation()
  const reduced = useReducedMotion()
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 32)
  const trigger = useRef<HTMLButtonElement>(null)
  const isOpen = openedAt === location.key
  const currentPath = location.pathname.replace(/\/$/, '')
  const offersRoute = currentPath === '/offers' || currentPath.startsWith('/offers/')
  const hasHero = ['', '/menu', '/about', '/uae', '/offers', '/offers/table-quiz', '/loyalty', '/contact', '/faq', '/gift-cards', '/feedback'].includes(currentPath)
    || campaigns.some((campaign) => campaignPath(campaign) === currentPath)
  const isSolid = !hasHero || scrolled || isOpen

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenedAt(null)
        trigger.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1240px)')
    const adjustMenu = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenedAt(null)
    }
    document.addEventListener('keydown', handleEscape)
    desktop.addEventListener('change', adjustMenu)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      desktop.removeEventListener('change', adjustMenu)
    }
  }, [isOpen])

  const navLinks = navigation.map(({ to, label }) => (
    <Link
      key={label}
      to={to}
      aria-current={(to === '/' || to.includes('#') ? currentPath + location.hash : currentPath) === to.replace(/\/$/, '') || (label === 'order' && currentPath.startsWith('/order/')) || (label === 'offers' && offersRoute) ? 'location' : undefined}
      onClick={() => setOpenedAt(null)}
    >
      {t(label)}
    </Link>
  ))

  return (
    <header className={`site-header${isSolid ? ' site-header--solid' : ''}`}>
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label={t('navigation')}>{navLinks}</nav>
        <div className="header-actions">
          <LanguageSwitch />
          <button type="button" className="header-cart" aria-haspopup="dialog" aria-label={`${t('openCart')} (${itemCount})`} onClick={() => {
            setOpenedAt(null)
            onOpenCart()
          }}>
            <ShoppingBag size={22} aria-hidden="true" />
            {itemCount > 0 && <span className="header-cart-count" aria-hidden="true">{itemCount > 99 ? '99+' : itemCount.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE')}</span>}
          </button>
          <Link className="button button--gold header-reserve" to="/reservation">{t('reserve')}</Link>
          <button
            ref={trigger}
            type="button"
            className="nav-trigger"
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label={t(isOpen ? 'closeMenu' : 'openMenu')}
            onClick={() => setOpenedAt(isOpen ? null : location.key)}
          >
            {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={23} />}
          </button>
        </div>
      </div>
      <div className="mobile-menu-shell" id="mobile-navigation" inert={!isOpen}>
        <AnimatePresence>
          {isOpen && (
            <m.nav
              className="mobile-nav"
              aria-label={t('navigation')}
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              {navLinks}
              <Link className="button button--gold mt-3" to="/reservation" onClick={() => setOpenedAt(null)}>{t('reserve')}</Link>
            </m.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
