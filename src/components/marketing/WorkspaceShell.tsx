import '../../styles/tools.css'
import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import type { CopyKey } from '../../i18n/copy'
import { Brand } from '../Brand'
import { LanguageSwitch } from '../LanguageSwitch'

export function WorkspaceShell({ title, intro, children }: { title: CopyKey; intro: CopyKey; children: ReactNode }) {
  const { t } = useLanguage()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  return <div className="marketing-dashboard workspace-page">
    <a className="skip-link" href="#workspace-main">{t('skip')}</a>
    <header className="marketing-top">
      <div className="container"><Brand /><div><Link to="/marketing">{t('workspaceBack')}</Link><LanguageSwitch /></div></div>
    </header>
    <main id="workspace-main" className="container marketing-main" tabIndex={-1}>
      <div className="marketing-heading">
        <p className="eyebrow">{t('marketingDemo')}</p>
        <h1>{t(title)}</h1><p>{t(intro)}</p>
      </div>
      {children}
    </main>
  </div>
}
