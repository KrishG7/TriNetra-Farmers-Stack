"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi" | "pb" | "gj" | "ta" | "te" | "bn" | "mr"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  // Load saved language on startup
  useEffect(() => {
    const saved = localStorage.getItem("trinetra-lang") as Language
    if (saved) setLanguageState(saved)
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