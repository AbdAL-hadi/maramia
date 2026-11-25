import { Pencil, Trash2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useOrdering } from '../../context/OrderingContext'
import { maxInstructions, resolveDish } from '../../data/orderMath'
import type { CartLine } from '../../types/ordering'
import { DishMedia } from '../menu/DishMedia'
import { Money } from './OrderAmounts'
import { QuantityControl } from './QuantityControl'

function CartLineRow({ line, fallbackId }: { line: CartLine; fallbackId: string }) {
  const { language, t } = useLanguage()
  const { update, remove } = useOrdering()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(false)
  const editButton = useRef<HTMLButtonElement>(null)
  const row = useRef<HTMLLIElement>(null)
  const id = useId()
  const dish = resolveDish(line)
  if (!dish) return null
  const { item, variant, unitPrice } = dish
  const name = language === 'ar' ? item.nameAr : item.nameEn

  function closeEditor() {
    setEditing(false)
    setError(false)
    editButton.current?.focus()
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const result = await update(line.id, {
      variantId: String(data.get('portion') || '') || null,
      instructions: String(data.get('instructions') ?? ''),
    })
    if (result === 'ok') closeEditor()
    else setError(true)
  }

  async function removeLine() {
    const neighbour = (row.current?.nextElementSibling ?? row.current?.previousElementSibling)
      ?.querySelector<HTMLElement>('[data-cart-remove]')
    await remove(line.id)
    requestAnimationFrame(() => (neighbour ?? document.getElementById(fallbackId))?.focus())
  }

  return (
    <li className="cart-line" ref={row} data-testid="cart-line">
      <DishMedia item={item} className="cart-thumb" />
      <div className="cart-line-body">
        <div className="cart-line-header">
          <div>
            <h3 id={`${id}-name`}>{name}</h3>
            {variant && <p>{variant.name[language]}</p>}
            <p><Money fils={unitPrice} /> {t('unitPrice')}</p>
          </div>
          <strong className="cart-line-price" aria-label={t('dishLineTotal')}><Money fils={unitPrice * line.quantity} /></strong>
        </div>
        {line.instructions && !editing && <p className="cart-line-note" dir="auto">{line.instructions}</p>}
        <div className="cart-line-controls">
          <div role="group" aria-labelledby={`${id}-name`}>
            <QuantityControl value={line.quantity} onChange={(quantity) => update(line.id, { quantity })} />
          </div>
          <div className="cart-line-tools">
            <button type="button" className="cart-text-button" ref={editButton} aria-expanded={editing} aria-controls={`${id}-edit`} onClick={() => {
              if (editing) closeEditor()
              else setEditing(true)
            }}><Pencil size={14} aria-hidden="true" />{t('editDish')}</button>
            <button type="button" className="cart-remove" aria-label={t('removeDish')} onClick={removeLine} data-cart-remove>
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        {editing && (
          <form id={`${id}-edit`} className="cart-line-edit" onSubmit={save}>
            {item.variants.length > 0 && (
              <label className="order-field">
                <span>{t(item.id === 'herbal-tea' ? 'teaChoice' : 'portion')}</span>
                <select name="portion" defaultValue={line.variantId ?? ''}>
                  {item.variants.map((option) => <option key={option.id} value={option.id}>{option.name[language]}</option>)}
                </select>
              </label>
            )}
            <label className="order-field">
              <span>{t('instructions')}</span>
              <textarea name="instructions" maxLength={maxInstructions} rows={2} dir="auto" defaultValue={line.instructions} />
            </label>
            {error && <p className="field-error" role="alert">{t('cartLimit')}</p>}
            <div className="order-actions">
              <button className="button button--forest" type="submit">{t('saveChanges')}</button>
              <button className="cart-text-button" type="button" onClick={closeEditor}>{t('cancelEdit')}</button>
            </div>
          </form>
        )}
      </div>
    </li>
  )
}

export function CartLines({ fallbackId }: { fallbackId: string }) {
  const { cart } = useOrdering()
  return <ul className="cart-lines" role="list">{cart.map((line) => <CartLineRow key={line.id} line={line} fallbackId={fallbackId} />)}</ul>
}
