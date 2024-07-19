// This initialises the translation library
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import TranslationFetchBackend from 'i18next-http-backend'
import { i18nextPlugin } from 'translation-check'

i18n
    .use(TranslationFetchBackend)
    .use(LanguageDetector)
    .use(i18nextPlugin)
    .use(initReactI18next)
    .init({
        debug: process.env.NODE_ENV === 'dev',
        fallbackLng: 'en'
    })