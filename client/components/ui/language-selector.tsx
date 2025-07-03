import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DEEPL_LANGUAGES,
  getSortedLanguages,
  type DeepLLanguage,
} from "@/services/deepl-languages";

interface LanguageSelectorProps {
  value?: string;
  onChange?: (language: DeepLLanguage) => void;
  className?: string;
}

export function LanguageSelector({
  value = "EN",
  onChange,
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sortedLanguages = getSortedLanguages();
  const selectedLanguage =
    DEEPL_LANGUAGES.find((lang) => lang.code === value) || DEEPL_LANGUAGES[0];

  const handleSelect = (language: DeepLLanguage) => {
    onChange?.(language);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative overflow-hidden",
          "bg-gradient-to-r from-neulight/60 to-neubg/80",
          "backdrop-blur-md border border-white/10 rounded-neu",
          "flex items-center gap-3 px-5 py-4 text-sm font-semibold text-foreground",
          "min-w-[120px] transition-all duration-300",
          "hover:shadow-[0_0_30px_-10px] hover:shadow-bridgit-primary/30",
          "hover:border-bridgit-primary/30",
        )}
      >
        <span className="text-xl">{selectedLanguage.flag}</span>
        <span className="tracking-wide">{selectedLanguage.code}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-all duration-300 text-bridgit-primary",
            isOpen && "rotate-180 text-bridgit-secondary",
          )}
        />

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bridgit-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-3 w-64 bg-neubg/95 backdrop-blur-xl rounded-neu-lg border border-white/10 py-3 z-50 max-h-80 overflow-y-auto shadow-[0_25px_50px_-12px] shadow-black/25 scrollbar-hidden">
            {sortedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleSelect(language)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-bridgit-primary/10 hover:to-bridgit-secondary/10",
                  "hover:border-l-2 hover:border-l-bridgit-primary",
                  language.code === value &&
                    "bg-bridgit-primary/20 border-l-2 border-l-bridgit-primary",
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-bold tracking-wider text-base">
                  {language.code}
                </span>
                <span className="text-muted-foreground text-xs truncate flex-1 text-left">
                  {language.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
