import { Globe2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export function LanguageSwitch() {
  const { language, toggle } = useLanguage()
  return (
    <button
      type="button"
      onClick={toggle}
      className="language-switch"
      aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      lang={language === 'ar' ? 'en' : 'ar'}
    >
      <Globe2 size={17} aria-hidden="true" />
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  )
}
