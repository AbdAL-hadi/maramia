import '@fontsource/cairo/arabic-400.css'
import '@fontsource/cairo/arabic-600.css'
import '@fontsource/cairo/arabic-700.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/playfair-display/latin-500.css'
import './styles/main.css'
import './styles/dishes.css'
import './styles/ordering.css'
import './styles/marketing.css'
import './styles/loyalty.css'

import { domAnimation, LazyMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { OrderingProvider } from './context/OrderingContext'
import { SiteLayout } from './layouts/SiteLayout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PageMetadata } from './components/PageMetadata'
import { RouteLoading } from './components/RouteLoading'

const MenuPage = lazy(() => import('./pages/MenuPage').then(({ MenuPage }) => ({ default: MenuPage })))
const OrderPage = lazy(() => import('./pages/OrderPage').then(({ OrderPage }) => ({ default: OrderPage })))
const OrderStatusPage = lazy(() => import('./pages/OrderStatusPage').then(({ OrderStatusPage }) => ({ default: OrderStatusPage })))
const ReservationRoutes = lazy(() => import('./pages/ReservationRoutes'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const RestaurantPage = lazy(() => import('./pages/RestaurantPage'))
const OffersPage = lazy(() => import('./pages/OffersPage'))
const CampaignPage = lazy(() => import('./pages/CampaignPage'))
const TableQuizPage = lazy(() => import('./pages/TableQuizPage'))
const MarketingPage = lazy(() => import('./pages/MarketingPage'))
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage'))
const ContentStudioPage = lazy(() => import('./pages/ContentStudioPage'))
const CampaignLinksPage = lazy(() => import('./pages/CampaignLinksPage'))
const QrStudioPage = lazy(() => import('./pages/QrStudioPage'))
const GiftCardsPage = lazy(() => import('./pages/GiftCardsPage'))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))

const root = createRoot(document.getElementById('root')!)

root.render(
  <LanguageProvider>
    <OrderingProvider>
      <LazyMotion features={domAnimation} strict>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PageMetadata />
        <Routes>
          <Route path="marketing" element={<Suspense fallback={<RouteLoading />}><MarketingPage /></Suspense>} />
          <Route path="marketing/studio" element={<Suspense fallback={<RouteLoading />}><ContentStudioPage /></Suspense>} />
          <Route path="marketing/links" element={<Suspense fallback={<RouteLoading />}><CampaignLinksPage /></Suspense>} />
          <Route path="marketing/qr" element={<Suspense fallback={<RouteLoading />}><QrStudioPage /></Suspense>} />
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="order" element={<OrderPage />} />
            <Route path="order/:orderId" element={<OrderStatusPage />} />
            <Route path="order/:orderId/track" element={<OrderStatusPage tracking />} />
            <Route path="reservation/*" element={<ReservationRoutes />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="uae" element={<RestaurantPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="offers/table-quiz" element={<TableQuizPage />} />
            <Route path="offers/:campaignSlug" element={<CampaignPage />} />
            <Route path="loyalty" element={<LoyaltyPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="gift-cards" element={<GiftCardsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </LazyMotion>
    </OrderingProvider>
  </LanguageProvider>,
)
