import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { readStorage, writeStorage } from '../hooks/storage'
import { copy, type CopyKey } from '../i18n/copy'
import type { Language } from '../types'

const storageKey = 'maramia.language'

const LanguageContext = createContext<{
  language: Language
  toggle: () => void
  t: (key: CopyKey) => string
} | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => readStorage<unknown>(storageKey, null) === 'en' ? 'en' : 'ar')

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    writeStorage(storageKey, language)
  }, [language])

  return (
    <LanguageContext.Provider value={{
      language,
      toggle: () => setLanguage((current) => current === 'ar' ? 'en' : 'ar'),
      t: (key) => copy[key][language],
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('LanguageProvider is required')
  return value
}
