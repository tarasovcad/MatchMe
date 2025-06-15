// Language code to readable name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  // English variants
  en: "English",
  "en-US": "English",
  "en-GB": "English",
  "en-CA": "English",
  "en-AU": "English",
  "en-NZ": "English",
  "en-IE": "English",
  "en-ZA": "English",
  "en-IN": "English",

  // Spanish variants
  es: "Spanish",
  "es-ES": "Spanish",
  "es-MX": "Spanish",
  "es-AR": "Spanish",
  "es-CO": "Spanish",
  "es-CL": "Spanish",
  "es-PE": "Spanish",
  "es-VE": "Spanish",

  // French variants
  fr: "French",
  "fr-FR": "French",
  "fr-CA": "French",
  "fr-BE": "French",
  "fr-CH": "French",

  // German variants
  de: "German",
  "de-DE": "German",
  "de-AT": "German",
  "de-CH": "German",

  // Russian variants
  ru: "Russian",
  "ru-RU": "Russian",

  // Portuguese variants
  pt: "Portuguese",
  "pt-BR": "Portuguese",
  "pt-PT": "Portuguese",

  // Italian variants
  it: "Italian",
  "it-IT": "Italian",

  // Dutch variants
  nl: "Dutch",
  "nl-NL": "Dutch",
  "nl-BE": "Dutch",

  // Chinese variants
  zh: "Chinese",
  "zh-CN": "Chinese",
  "zh-TW": "Chinese",
  "zh-HK": "Chinese",
  "zh-SG": "Chinese",

  // Japanese
  ja: "Japanese",
  "ja-JP": "Japanese",

  // Korean
  ko: "Korean",
  "ko-KR": "Korean",

  // Arabic variants
  ar: "Arabic",
  "ar-SA": "Arabic",
  "ar-EG": "Arabic",
  "ar-AE": "Arabic",

  // Hindi
  hi: "Hindi",
  "hi-IN": "Hindi",

  // Other common languages
  sv: "Swedish",
  "sv-SE": "Swedish",
  no: "Norwegian",
  nb: "Norwegian",
  da: "Danish",
  "da-DK": "Danish",
  fi: "Finnish",
  "fi-FI": "Finnish",
  pl: "Polish",
  "pl-PL": "Polish",
  tr: "Turkish",
  "tr-TR": "Turkish",
  he: "Hebrew",
  "he-IL": "Hebrew",
  th: "Thai",
  "th-TH": "Thai",
  vi: "Vietnamese",
  "vi-VN": "Vietnamese",
  uk: "Ukrainian",
  "uk-UA": "Ukrainian",
  cs: "Czech",
  "cs-CZ": "Czech",
  sk: "Slovak",
  "sk-SK": "Slovak",
  hu: "Hungarian",
  "hu-HU": "Hungarian",
  ro: "Romanian",
  "ro-RO": "Romanian",
  bg: "Bulgarian",
  "bg-BG": "Bulgarian",
  hr: "Croatian",
  "hr-HR": "Croatian",
  sr: "Serbian",
  "sr-RS": "Serbian",
  sl: "Slovenian",
  "sl-SI": "Slovenian",
  et: "Estonian",
  "et-EE": "Estonian",
  lv: "Latvian",
  "lv-LV": "Latvian",
  lt: "Lithuanian",
  "lt-LT": "Lithuanian",
  el: "Greek",
  "el-GR": "Greek",
  is: "Icelandic",
  "is-IS": "Icelandic",
  mt: "Maltese",
  "mt-MT": "Maltese",
};

export function formatLanguageLabel(languageCode: string): string {
  if (!languageCode) return languageCode;

  const languageName = LANGUAGE_NAMES[languageCode];

  if (languageName) {
    return `${languageName} (${languageCode})`;
  }

  // If exact match not found, try to get the base language (e.g., "en" from "en-US")
  const baseLanguage = languageCode.split("-")[0];
  const baseName = LANGUAGE_NAMES[baseLanguage];

  if (baseName) {
    return `${baseName} (${languageCode})`;
  }

  // If no mapping found, return the original code
  return languageCode;
}

export function isLanguageCode(label: string): boolean {
  // Check if it matches common language code patterns
  const languageCodePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
  return (
    languageCodePattern.test(label) || Object.prototype.hasOwnProperty.call(LANGUAGE_NAMES, label)
  );
}
