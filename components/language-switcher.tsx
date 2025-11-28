"use client"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={language === "kh" ? "default" : "secondary"}
        size="sm"
        onClick={() => setLanguage("kh")}
        className="text-sm transition-all duration-300 hover:scale-105"
      >
        🇰🇭 ខ្មែរ
      </Button>
      <Button
        variant={language === "en" ? "default" : "secondary"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-sm transition-all duration-300 hover:scale-105"
      >
        🇺🇸 English
      </Button>
    </div>
  )
}
