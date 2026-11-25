import { lazy, Suspense, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { useLanguage } from '../context/LanguageContext'
import { observeCustomerRoute } from '../data/marketingAnalytics'
import { RouteLoading } from '../components/RouteLoading'

const CartDrawer = lazy(() => import('../components/order/CartDrawer').then(({ CartDrawer }) => ({ default: CartDrawer })))

function RouteContent({ main }: { main: RefObject<HTMLElement | null> }) {
  const { pathname, hash, key, search } = useLocation()
  const previousLocation = useRef<{ pathname: string; hash: string; search: string } | undefined>(undefined)

  useLayoutEffect(() => {
    const previous = previousLocation.current
    const samePage = previous?.pathname === pathname
    previousLocation.current = { pathname, hash, search }
    if (samePage && previous.hash === hash && previous.search !== search) return
    const frame = window.requestAnimationFrame(() => {
      const target = hash && document.getElementById(hash.slice(1))
      const smooth = samePage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (target) {
        target.focus({ preventScroll: true })
        target.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
      } else {
        if (previous && !document.querySelector('dialog[open]')) main.current?.focus({ preventScroll: true })
        window.scrollTo({ top: 0, behavior: samePage && smooth ? 'smooth' : 'instant' })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash, key, search, main])

  return <Outlet />
}

export function SiteLayout() {
  const { t } = useLanguage()
  const { pathname, key, search } = useLocation()
  const main = useRef<HTMLElement>(null)
  const [cartOpenedAt, setCartOpenedAt] = useState<string | null>(null)
  const observedRoute = useRef<{ pathname: string; search: string } | undefined>(undefined)
  useLayoutEffect(() => {
    // Retire the two pre-Phase Six demo signup lists that stored contact fields.
    try {
      localStorage.removeItem('maramia.signup.opening')
      localStorage.removeItem('maramia.signup.newsletter')
    } catch {
      // Browser storage can be disabled.
    }
  }, [])
  useLayoutEffect(() => {
    const path = pathname.replace(/\/$/, '') || '/'
    const previous = observedRoute.current
    if (previous?.pathname === path && previous.search === search) return
    observedRoute.current = { pathname: path, search }
    observeCustomerRoute(path, new URLSearchParams(search), key, previous?.pathname !== path)
  }, [pathname, search, key])
  useLayoutEffect(() => { setCartOpenedAt((opened) => opened === key ? opened : null) }, [key])

  return (
    <>
      <a className="skip-link" href="#main-content">{t('skip')}</a>
      <Header onOpenCart={() => setCartOpenedAt(key)} />
      <main id="main-content" ref={main} tabIndex={-1}>
        <Suspense fallback={<RouteLoading reservation={/^\/reservation(?:\/|$)/.test(pathname)} />}>
          <RouteContent main={main} />
        </Suspense>
      </main>
      <Footer />
      {cartOpenedAt === key && <Suspense fallback={null}><CartDrawer onClose={() => setCartOpenedAt(null)} /></Suspense>}
    </>
  )
}
