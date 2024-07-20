// This initialises the translation library
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import TranslationFetchBackend from 'i18next-http-backend'

i18n
    .use(TranslationFetchBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: process.env.NODE_ENV === 'dev',
        fallbackLng: ['en', 'fi'],
        returnNull: false
    })