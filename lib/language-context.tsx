"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations } from "./data"
import { getLanguage, saveLanguage } from "./storage"

type Language = "en" | "kh"
type Translations = typeof translations.en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function loadLanguage() {
      const lang = await getLanguage()
      setLanguageState(lang)
      setMounted(true)
    }
    loadLanguage()
  }, [])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    await saveLanguage(lang)
  }

  if (!mounted) {
    return null
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
