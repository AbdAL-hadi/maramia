import { useLanguage } from '../../context/LanguageContext'
import { aedCurrency } from '../../data/menuFilters'
import type { OrderAmounts as Amounts } from '../../types/ordering'

const fractionalCurrency = {
  ar: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED' }),
  en: new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }),
}

export function Money({ fils, testId }: { fils: number; testId?: string }) {
  const { language } = useLanguage()
  const formatter = fils % 100 === 0 ? aedCurrency[language] : fractionalCurrency[language]
  return <bdi data-testid={testId}>{formatter.format(fils / 100)}</bdi>
}

export function OrderAmounts({ amounts, showDelivery, pendingFee = false }: {
  amounts: Amounts
  showDelivery: boolean
  pendingFee?: boolean
}) {
  const { t } = useLanguage()
  return (
    <dl className="order-amounts">
      <div><dt>{t('subtotal')}</dt><dd><Money fils={amounts.subtotal} testId="order-subtotal" /></dd></div>
      {amounts.discount > 0 && <div className="order-discount"><dt>{t('discount')}</dt><dd><Money fils={-amounts.discount} testId="order-discount" /></dd></div>}
      {showDelivery && (
        <div><dt>{t('deliveryFee')}</dt><dd>{pendingFee ? t('pendingFee') : <Money fils={amounts.deliveryFee} testId="delivery-fee" />}</dd></div>
      )}
      <div className="order-amounts-total"><dt>{t('orderTotal')}</dt><dd><Money fils={amounts.total} testId="order-total" /></dd></div>
    </dl>
  )
}
