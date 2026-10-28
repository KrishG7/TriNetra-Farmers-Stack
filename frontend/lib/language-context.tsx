"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"

type Language = "en" | "hi" | "pb" | "gj" | "ta" | "te" | "bn" | "mr"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const didHydrateRef = useRef(false)

  // Load saved language on startup (client-side only)
  useEffect(() => {
    if (!didHydrateRef.current) {
      didHydrateRef.current = true
      const saved = localStorage.getItem("trinetra-lang")
      if (saved && ["en", "hi", "pb", "gj", "ta", "te", "bn", "mr"].includes(saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate SSR hydration pattern
        setLanguageState(saved as Language)
      }
    }
  }, [])

  // Save language whenever it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("trinetra-lang", lang)
  }

  // Helper placeholder
  const t = (key: string) => key

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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