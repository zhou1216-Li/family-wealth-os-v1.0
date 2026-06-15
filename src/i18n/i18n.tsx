'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Locale, type Translations } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale
      if (saved && (saved === 'zh-CN' || saved === 'en-US')) {
        return saved
      }
      // 从浏览器语言推断
      const browserLang = navigator.language
      if (browserLang.startsWith('zh')) {
        return 'zh-CN'
      }
    }
    return 'zh-CN'
  })

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
      document.documentElement.lang = newLocale
    }
  }

  // 设置 HTML lang 属性
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const t = translations[locale]

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t, locale, setLocale } = useI18n()
  return { t, locale, setLocale }
}

export type { Locale, Translations }
