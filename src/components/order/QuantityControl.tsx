import { Minus, Plus } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { maxLineQuantity } from '../../data/orderMath'

export function QuantityControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { t, language } = useLanguage()
  return (
    <div className="quantity-controls">
      <button type="button" aria-label={t('decreaseQuantity')} disabled={value === 1} onClick={() => onChange(value - 1)}>
        <Minus size={17} aria-hidden="true" />
      </button>
      <output aria-live="polite">{value.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE')}</output>
      <button type="button" aria-label={t('increaseQuantity')} disabled={value === maxLineQuantity} onClick={() => onChange(value + 1)}>
        <Plus size={17} aria-hidden="true" />
      </button>
    </div>
  )
}
