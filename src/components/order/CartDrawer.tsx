import { m } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { useModalFocus } from '../../hooks/useModalFocus'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { CartLines } from './CartLines'
import { LoyaltyNotice } from '../loyalty/LoyaltySummary'
import { Money } from './OrderAmounts'

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { t, language } = useLanguage()
  const { itemCount, subtotal, clear } = useOrdering()
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  useModalFocus(dialog, close)

  return (
    <dialog
      className="cart-drawer" ref={dialog} aria-labelledby="cart-drawer-heading"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <m.div
        className="cart-drawer-panel"
        initial={reduced ? false : { x: language === 'ar' ? '-12%' : '12%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.27, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cart-drawer-heading">
          <div><p className="eyebrow">{t('orderingDemo')}</p><h2 id="cart-drawer-heading">{t('yourCart')}</h2></div>
          <button type="button" ref={close} className="cart-close" onClick={onClose} aria-label={t('closeCart')}><X size={22} aria-hidden="true" /></button>
        </div>
        <div className="cart-drawer-scroll">
          {itemCount ? (
            <>
              <div className="cart-drawer-meta">
                <p>{t('cartCount')} <bdi>{itemCount}</bdi></p>
                <button type="button" className="cart-text-button" onClick={async () => { await clear(); close.current?.focus() }}>{t('clearCart')}</button>
              </div>
              <CartLines fallbackId="cart-continue" />
              <LoyaltyNotice />
            </>
          ) : (
            <div className="cart-empty">
              <ShoppingBag aria-hidden="true" size={38} strokeWidth={1.2} />
              <h3>{t('cartEmpty')}</h3><p>{t('cartEmptyText')}</p>
            </div>
          )}
        </div>
        <div className="cart-drawer-footer">
          {itemCount > 0 && <div className="cart-drawer-subtotal"><strong>{t('subtotal')}</strong><strong><Money fils={subtotal} testId="cart-subtotal" /></strong></div>}
          {itemCount > 0 && <Link className="button button--forest" to="/order" onClick={onClose}>{t('checkout')}</Link>}
          {/^\/menu\/?$/.test(pathname)
            ? <button className="button button--line" id="cart-continue" type="button" onClick={onClose}>{t('continueShopping')}</button>
            : <Link className="button button--line" id="cart-continue" to="/menu" onClick={onClose}>{t('continueShopping')}</Link>}
        </div>
      </m.div>
    </dialog>
  )
}
