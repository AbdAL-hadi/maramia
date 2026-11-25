import '../../styles/tools.css'
import { Search } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { faqs } from '../../data/faq'
import { normalizeSearchText } from '../../data/menuFilters'

export function FaqAccordion({ search = true, subset }: { search?: boolean; subset?: readonly string[] }) {
  const { language, t } = useLanguage()
  const labelId = useId()
  const [query, setQuery] = useState('')
  const tokens = normalizeSearchText(query).split(' ').filter(Boolean)
  const visible = faqs.filter((entry) => (!subset || subset.includes(entry.id)) && tokens.every((token) =>
    normalizeSearchText(entry.question[language] + ' ' + entry.answer[language]).includes(token)))
  return <div className="faq-content">
    {search && <div className="faq-toolbar">
      <label htmlFor={labelId}><Search size={18} aria-hidden="true" />{t('faqSearch')}</label>
      <input type="search" id={labelId} value={query} maxLength={100} dir="auto" onChange={(event) => setQuery(event.target.value)} />
      <p role="status">{visible.length ? t('faqResults').replace('{count}', visible.length.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE')) : t('faqEmpty')}</p>
    </div>}
    <div className="faq-accordion">
      {visible.map((entry) => <details key={entry.id}>
        <summary>{entry.question[language]}</summary>
        <div><p>{entry.answer[language]}</p><Link to={entry.path}>{entry.link[language]}</Link></div>
      </details>)}
    </div>
  </div>
}
