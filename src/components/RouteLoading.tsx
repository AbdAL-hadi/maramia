import { useLanguage } from '../context/LanguageContext'

export function RouteLoading({ reservation = false }: { reservation?: boolean }) {
  const { t } = useLanguage()
  return <div className="preview-page"><p className="container" role="status">{t(reservation ? 'reservationLoading' : 'editorialLoading')}</p></div>
}
