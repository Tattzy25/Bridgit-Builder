// Official DeepL supported languages as of 2024/2025
export interface DeepLLanguage {
  code: string;
  name: string;
  flag: string;
  deepLCode: string; // DeepL's specific language code
}

// Complete list of DeepL supported languages with accurate country flags
export const DEEPL_LANGUAGES: DeepLLanguage[] = [
  { code: "AR", name: "Arabic", flag: "🇸🇦", deepLCode: "AR" },
  { code: "BG", name: "Bulgarian", flag: "🇧🇬", deepLCode: "BG" },
  { code: "CS", name: "Czech", flag: "🇨🇿", deepLCode: "CS" },
  { code: "DA", name: "Danish", flag: "🇩🇰", deepLCode: "DA" },
  { code: "DE", name: "German", flag: "🇩🇪", deepLCode: "DE" },
  { code: "EL", name: "Greek", flag: "🇬🇷", deepLCode: "EL" },
  { code: "EN", name: "English (US)", flag: "🇺🇸", deepLCode: "EN-US" },
  { code: "GB", name: "English (UK)", flag: "🇬🇧", deepLCode: "EN-GB" },
  { code: "ES", name: "Spanish", flag: "🇪🇸", deepLCode: "ES" },
  { code: "ET", name: "Estonian", flag: "🇪🇪", deepLCode: "ET" },
  { code: "FI", name: "Finnish", flag: "🇫🇮", deepLCode: "FI" },
  { code: "FR", name: "French", flag: "🇫🇷", deepLCode: "FR" },
  { code: "HU", name: "Hungarian", flag: "🇭��", deepLCode: "HU" },
  { code: "ID", name: "Indonesian", flag: "🇮🇩", deepLCode: "ID" },
  { code: "IT", name: "Italian", flag: "🇮🇹", deepLCode: "IT" },
  { code: "JA", name: "Japanese", flag: "🇯🇵", deepLCode: "JA" },
  { code: "KO", name: "Korean", flag: "🇰🇷", deepLCode: "KO" },
  { code: "LT", name: "Lithuanian", flag: "🇱🇹", deepLCode: "LT" },
  { code: "LV", name: "Latvian", flag: "🇱🇻", deepLCode: "LV" },
  { code: "NB", name: "Norwegian", flag: "🇳🇴", deepLCode: "NB" },
  { code: "NL", name: "Dutch", flag: "🇳🇱", deepLCode: "NL" },
  { code: "PL", name: "Polish", flag: "🇵🇱", deepLCode: "PL" },
  { code: "BR", name: "Portuguese (BR)", flag: "🇧🇷", deepLCode: "PT-BR" },
  { code: "PT", name: "Portuguese (PT)", flag: "🇵🇹", deepLCode: "PT-PT" },
  { code: "RO", name: "Romanian", flag: "🇷🇴", deepLCode: "RO" },
  { code: "RU", name: "Russian", flag: "🇷🇺", deepLCode: "RU" },
  { code: "SK", name: "Slovak", flag: "🇸🇰", deepLCode: "SK" },
  { code: "SL", name: "Slovenian", flag: "🇸🇮", deepLCode: "SL" },
  { code: "SV", name: "Swedish", flag: "🇸🇪", deepLCode: "SV" },
  { code: "TR", name: "Turkish", flag: "🇹🇷", deepLCode: "TR" },
  { code: "UK", name: "Ukrainian", flag: "🇺🇦", deepLCode: "UK" },
  { code: "ZH", name: "Chinese (Simplified)", flag: "🇨🇳", deepLCode: "ZH" },
  {
    code: "TW",
    name: "Chinese (Traditional)",
    flag: "🇹🇼",
    deepLCode: "ZH-HANT",
  },
  { code: "HE", name: "Hebrew", flag: "🇮🇱", deepLCode: "HE" },
  { code: "VI", name: "Vietnamese", flag: "🇻🇳", deepLCode: "VI" },
  { code: "TH", name: "Thai", flag: "🇹🇭", deepLCode: "TH" },
];

// Helper functions for language handling
export function getLanguageByCode(code: string): DeepLLanguage | undefined {
  return DEEPL_LANGUAGES.find((lang) => lang.code === code);
}

export function getDeepLCode(code: string): string {
  const language = getLanguageByCode(code);
  return language?.deepLCode || code;
}

export function getLanguageName(code: string): string {
  const language = getLanguageByCode(code);
  return language?.name || code;
}

export function getLanguageFlag(code: string): string {
  const language = getLanguageByCode(code);
  return language?.flag || "🌐";
}

// Most commonly used languages for quick access
export const POPULAR_LANGUAGES = [
  "EN",
  "ES",
  "FR",
  "DE",
  "IT",
  "PT",
  "ZH",
  "JA",
  "KO",
  "AR",
];

// Sort languages by popularity, then alphabetically
export function getSortedLanguages(): DeepLLanguage[] {
  const popular = DEEPL_LANGUAGES.filter((lang) =>
    POPULAR_LANGUAGES.includes(lang.code),
  );
  const others = DEEPL_LANGUAGES.filter(
    (lang) => !POPULAR_LANGUAGES.includes(lang.code),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return [...popular, ...others];
}
