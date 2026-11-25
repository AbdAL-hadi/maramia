import { AnimatePresence, m } from 'framer-motion'
import { Check, Leaf, ShoppingBag, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { menuCategories } from '../../data/menu'
import { aedCurrency } from '../../data/menuFilters'
import { maxInstructions } from '../../data/orderMath'
import { useModalFocus } from '../../hooks/useModalFocus'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { DishSelection, MenuItem } from '../../types/menu'
import { QuantityControl } from '../order/QuantityControl'
import { DishMedia } from './DishMedia'

export function DishDetails({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { language, t } = useLanguage()
  const { add } = useOrdering()
  const reduced = useReducedMotion()
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [feedback, setFeedback] = useState<'ok' | 'limit' | 'unavailable' | null>(null)
  const [selection, setSelection] = useState<DishSelection>(() => ({
    itemId: item.id,
    variantId: item.variants[0]?.id ?? null,
    quantity: 1,
    instructions: '',
  }))
  const price = item.variants.find(({ id: variantId }) => selection.variantId === variantId)?.priceAED ?? item.priceAED
  const currency = aedCurrency[language]
  const ingredients = item.ingredients[language]
  const isArabic = language === 'ar'

  useModalFocus(dialogRef, closeRef, 'menu-page-title')

  return (
    <dialog
      ref={dialogRef}
      className="dish-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="dish-dialog-controls">
        <button ref={closeRef} className="dish-dialog-close" type="button" onClick={onClose} aria-label={t('closeDish')}>
          <X size={23} aria-hidden="true" />
        </button>
      </div>
      <m.div
        className="dish-detail-layout"
        initial={reduced ? false : { opacity: 0, y: 9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.24 }}
      >
        <DishMedia item={item} className="dish-detail-photo" priority />
        <div className="dish-detail-content">
          <p className="eyebrow">{menuCategories[item.category][language]}</p>
          <h2 id={`${id}-title`}>{isArabic ? item.nameAr : item.nameEn}</h2>
          <div className="dish-detail-meta">
            <bdi className="dish-price" data-testid="unit-price">{currency.format(price)}</bdi>
            {item.dietaryTags.includes('vegetarian') && <span className="vegetarian-tag"><Leaf size={16} aria-hidden="true" />{t('vegetarian')}</span>}
          </div>
          <p id={`${id}-description`} className="section-text">{isArabic ? item.descriptionAr : item.descriptionEn}</p>
          <div className="dish-ingredients">
            <h3>{t('knownIngredients')}</h3>
            {ingredients.length ? (
              <ul>{ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
            ) : (
              <p>{t('unlistedIngredients')}</p>
            )}
          </div>
          {item.variants.length > 0 && (
            <fieldset className="dish-variants">
              <legend>{t(item.id === 'herbal-tea' ? 'teaChoice' : 'portion')}</legend>
              <div className="portion-options">
                {item.variants.map((variant) => (
                  <label key={variant.id}>
                    <input
                      type="radio" name={`${id}-portion`} value={variant.id}
                      checked={selection.variantId === variant.id}
                      onChange={() => setSelection((current) => ({ ...current, variantId: variant.id }))}
                    />
                    <span>{variant.name[language]}</span>
                    <bdi>{currency.format(variant.priceAED)}</bdi>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="dish-quantity" role="group" aria-labelledby={`${id}-quantity`}>
            <span id={`${id}-quantity`}>{t('quantity')}</span>
            <QuantityControl value={selection.quantity} onChange={(quantity) => setSelection((current) => ({ ...current, quantity }))} />
          </div>
          <label className="dish-instructions">
            <span>{t('instructions')}</span>
            <textarea
              value={selection.instructions} dir="auto" maxLength={maxInstructions} rows={2}
              onChange={(event) => {
                const instructions = event.target.value
                setSelection((current) => ({ ...current, instructions }))
              }}
              placeholder={t('instructionsHint')}
            />
          </label>
          <div className="dish-selection-summary">
            <span>{t('selectionTotal')}</span>
            <bdi data-testid="selection-total" aria-live="polite">{currency.format(price * selection.quantity)}</bdi>
          </div>
          <div className="dish-cart-actions">
            <button className="button button--forest" type="button" onClick={async () => setFeedback(await add(selection))}>
              <ShoppingBag size={17} aria-hidden="true" /> {t('addToCart')}
            </button>
            {feedback === 'ok' && <button className="button button--line" type="button" onClick={onClose}>{t('continueShopping')}</button>}
          </div>
          <div className="dish-cart-feedback" role="status">
            <AnimatePresence>
              {feedback && (
                <m.p key={feedback} initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.24 }}>
                  {feedback === 'ok' && <Check size={17} aria-hidden="true" />}
                  {t(feedback === 'ok' ? 'addedToCart' : feedback === 'limit' ? 'cartLimit' : 'unavailableDish')}
                </m.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </dialog>
  )
}
