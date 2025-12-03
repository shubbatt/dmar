"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "es" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  loading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load translations from API
  const loadTranslations = async (lang: Language) => {
    try {
      setLoading(true)
      const apiUrl = API_URL.replace('/api/v1', '') // Remove /api/v1 if present
      const response = await fetch(`${apiUrl}/api/v1/translations/${lang}`)
      const data = await response.json()
      setTranslations(data.translations || {})
    } catch (error) {
      console.error('[D\'Mar] Failed to load translations:', error)
      setTranslations({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("dmar-language") as Language
    const initialLang = savedLanguage && ['en', 'es', 'de'].includes(savedLanguage) ? savedLanguage : 'en'
    setLanguage(initialLang)
    loadTranslations(initialLang)
  }, [])

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang)
    if (mounted) {
      localStorage.setItem("dmar-language", lang)
    }
    await loadTranslations(lang)
  }

  const t = (key: string): string => {
    return translations[key] || key
  }

  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{ language: "en", setLanguage: () => {}, t: (key) => key, loading: true }}
      >
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
