"use client"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "kh" : "en")
  }

  return (
    <Button
      onClick={toggleLanguage}
      variant="default"
      size="sm"
      className="text-sm transition-all duration-300 hover:scale-105"
    >
      {language === "en" ? "🇰🇭 ភាសាខ្មែរ" : "🇺🇸 English"}
    </Button>
  )
}
