import '../styles/menu.css'
import { m } from 'framer-motion'
import { ChevronDown, Leaf, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import menuHero from '../assets/menu-hero.webp'
import { SageSprig } from '../components/Brand'
import { DishCard } from '../components/menu/DishCard'
import { DishDetails } from '../components/menu/DishDetails'
import { PromoBanner } from '../components/order/OrderPromotions'
import { LoyaltyNotice } from '../components/loyalty/LoyaltySummary'
import { useLanguage } from '../context/LanguageContext'
import { menuCatalog, menuCategories } from '../data/menu'
import { defaultFilters, filterMenu, type MenuFilters } from '../data/menuFilters'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { MenuCategory } from '../types/menu'

const categories = Object.keys(menuCategories) as MenuCategory[]

export function MenuPage() {
  const { language, t } = useLanguage()
  const reduced = useReducedMotion()
  const [filters, setFilters] = useState(defaultFilters)
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const toolbar = useRef<HTMLDivElement>(null)
  const stickyNav = useRef<HTMLDivElement>(null)
  const categoryTrack = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const results = useMemo(() => filterMenu(menuCatalog, filters), [filters])
  const activeSlug = params.get('dish')
  const activeDish = activeSlug && menuCatalog.find((item) => item.slug === activeSlug && item.available)
  const hasFilters = Boolean(filters.category !== 'all' || filters.query || filters.vegetarian || filters.sort !== 'menu')

  function changeCategory(category: MenuFilters['category']) {
    setFilters((current) => ({ ...current, category }))
    if (toolbar.current && stickyNav.current && toolbar.current.getBoundingClientRect().top < stickyNav.current.getBoundingClientRect().bottom) {
      toolbar.current.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
    }
  }

  function resetFilters() {
    setFilters(defaultFilters)
    categoryTrack.current?.scrollTo({ left: 0, behavior: 'instant' })
    search.current?.focus()
  }

  function closeDish() {
    if (location.state?.openedFromMenu) {
      navigate(-1)
      return
    }
    const next = new URLSearchParams(params)
    next.delete('dish')
    setParams(next, { replace: true })
  }

  return (
    <div className="menu-page">
      <section className="menu-hero" aria-labelledby="menu-page-title">
        <img src={menuHero} width="1672" height="941" alt="" fetchPriority="high" />
        <div className="menu-hero-shade" />
        <SageSprig className="menu-hero-sprig" />
        <m.div className="container menu-hero-inner" initial={reduced ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.58 }}>
          <p className="eyebrow hero-kicker">{t('heroKicker')}</p>
          <h1 id="menu-page-title" tabIndex={-1}>{t('menuPageTitle')}</h1>
          <p>{t('menuIntro')}</p>
        </m.div>
      </section>

      <div className="menu-category-bar" ref={stickyNav}>
        <div className="container">
          <div className="menu-category-track" ref={categoryTrack} role="group" aria-label={t('menuCategories')}>
            {(['all', ...categories] as const).map((category) => (
              <button key={category} type="button" aria-pressed={filters.category === category} onClick={() => changeCategory(category)}>
                {category === 'all' ? t('allDishes') : menuCategories[category][language]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-catalog container">
        <PromoBanner />
        <LoyaltyNotice />
        <div className="menu-toolbar" ref={toolbar}>
          <label className="menu-search">
            <span className="sr-only">{t('menuSearch')}</span>
            <Search size={19} aria-hidden="true" />
            <input
              ref={search} type="search" dir="auto" value={filters.query} maxLength={100}
              placeholder={t('menuSearchHint')}
              onChange={(event) => {
                const query = event.target.value
                setFilters((current) => ({ ...current, query }))
              }}
            />
          </label>
          <label className="menu-vegetarian">
            <input type="checkbox" checked={filters.vegetarian} onChange={(event) => {
              const vegetarian = event.target.checked
              setFilters((current) => ({ ...current, vegetarian }))
            }} />
            <Leaf size={16} aria-hidden="true" />
            <span>{t('vegetarianOnly')}</span>
          </label>
          <label className="menu-sort">
            <span className="sr-only">{t('menuSort')}</span>
            <select value={filters.sort} onChange={(event) => {
              const sort = event.target.value as MenuFilters['sort']
              setFilters((current) => ({ ...current, sort }))
            }}>
              <option value="menu">{t('menuSortDefault')}</option>
              <option value="price-asc">{t('menuSortLow')}</option>
              <option value="price-desc">{t('menuSortHigh')}</option>
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
        </div>
        <div className="menu-results-meta">
          <p role="status">{t('resultCount')} <bdi>{results.length.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE')}</bdi></p>
          <button type="button" className="menu-reset" disabled={!hasFilters} onClick={resetFilters}>{t('resetFilters')}</button>
        </div>
        {activeSlug && !activeDish && <p role="status" className="unavailable-dish">{t('unavailableDish')}</p>}
        {results.length ? (
          <ul className="dish-grid menu-page-grid grid" aria-label={t('browseMenu')}>
            {results.map((item) => <li key={item.id}><DishCard item={item} search={location.search} /></li>)}
          </ul>
        ) : (
          <div className="menu-empty">
            <Search size={28} aria-hidden="true" />
            <h2>{t('noMenuMatches')}</h2>
            <p>{t('noMenuMatchesHelp')}</p>
            <button className="button button--line" type="button" onClick={resetFilters}>{t('resetFilters')}</button>
          </div>
        )}
        <p className="menu-pricing-note">{t('menuPricingNote')}</p>
      </div>

      {activeDish && <DishDetails key={activeDish.id} item={activeDish} onClose={closeDish} />}
    </div>
  )
}
