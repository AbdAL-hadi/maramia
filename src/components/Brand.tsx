import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export function SageSprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 77" width="64" height="77" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 71C34 54 43 32 48 11M23 62C10 59 3 49 6 38c12 3 18 13 17 24Zm9-10C19 47 16 34 19 26c11 5 16 15 13 26Zm8-14C31 32 30 20 35 12c9 6 11 15 5 26Zm6-14C41 16 44 7 52 2c4 9 0 16-6 22ZM26 59c12-13 25-13 35-9-6 11-19 14-35 9Zm9-12c9-13 20-17 28-14-3 10-14 16-28 14Zm8-13c4-12 12-18 20-17-1 10-9 16-20 17Z"/>
        <path d="m23 62-11-15m20 5-10-17m18 3-3-18m-11 39 24-7m-15-5 21-10m-13-3 14-12"/>
      </g>
    </svg>
  )
}

export function Brand() {
  const { t } = useLanguage()
  return (
    <Link to="/" className="brand-link">
      <SageSprig className="brand-sprig" />
      <span className="brand-text" dir="ltr">
        <span className="brand-name" lang="en">MARAMIA</span>
        <small dir="auto">{t('brandMarket')}</small>
      </span>
    </Link>
  )
}
