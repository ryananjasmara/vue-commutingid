import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import id from './locales/id.json'

export default createI18n({
  legacy: false,
  locale: 'id',
  fallbackLocale: 'en',
  messages: {
    en,
    id
  }
})