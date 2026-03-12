import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ar from './ar.json'

const STORAGE_KEY = 'legal_portal_language'

function applyDocumentDirection(lng: string) {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lng)
  }
}

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const initialLng = saved === 'ar' || saved === 'en' ? saved : 'en'
applyDocumentDirection(initialLng)

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setLanguage(lng: 'en' | 'ar') {
  i18n.changeLanguage(lng)
  applyDocumentDirection(lng)
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lng)
}

export default i18n
