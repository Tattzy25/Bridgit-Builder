import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "FR", name: "French", flag: "🇫🇷" },
  { code: "ES", name: "Spanish", flag: "🇪🇸" },
  { code: "DE", name: "German", flag: "🇩🇪" },
  { code: "IT", name: "Italian", flag: "🇮🇹" },
  { code: "PT", name: "Portuguese", flag: "🇵🇹" },
  { code: "ZH", name: "Chinese", flag: "🇨🇳" },
  { code: "JA", name: "Japanese", flag: "🇯🇵" },
  { code: "KO", name: "Korean", flag: "🇰🇷" },
  { code: "AR", name: "Arabic", flag: "🇸🇦" },
];

interface LanguageSelectorProps {
  value?: string;
  onChange?: (language: Language) => void;
  className?: string;
}

export function LanguageSelector({
  value = "EN",
  onChange,
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage =
    languages.find((lang) => lang.code === value) || languages[0];

  const handleSelect = (language: Language) => {
    onChange?.(language);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neu-button flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground min-w-[100px]"
      >
        <span className="text-lg">{selectedLanguage.flag}</span>
        <span>{selectedLanguage.code}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-neubg rounded-neu shadow-neu border border-border/20 py-2 z-50 max-h-60 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleSelect(language)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-neubg/80 transition-colors",
                  language.code === value && "bg-bridgit-primary/10",
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.code}</span>
                <span className="text-muted-foreground">{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
