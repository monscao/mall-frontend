import { createContext, useContext, useMemo, useState } from "react";
import { dictionaries, getNestedTranslation } from "assets/translations";

const I18nContext = createContext(null);
const STORAGE_KEY = "mall-frontend-language";

function readLanguage() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "zh";
}

function interpolate(template, params = {}) {
  if (!template || typeof template !== "string") {
    return template;
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(readLanguage);

  const value = useMemo(() => {
    const dictionary = dictionaries[language];

    return {
      language,
      locale: language === "zh" ? "zh-CN" : "en-US",
      setLanguage(nextLanguage) {
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
        setLanguage(nextLanguage);
      },
      t(key, params) {
        const template = getNestedTranslation(dictionary, key) || getNestedTranslation(dictionaries.zh, key) || key;
        return interpolate(template, params);
      },
      resolveText(text) {
        if (!text) {
          return "";
        }

        return getNestedTranslation(dictionary, `raw.${text}`) || text;
      }
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
