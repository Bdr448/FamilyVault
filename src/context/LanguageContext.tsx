import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n';
import type { LanguageCode } from '../i18n';

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (path: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('family-vault-lang') as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    localStorage.setItem('family-vault-lang', lang);
    setLanguageState(lang);
  };

  const t = (path: string, variables?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if not found in current language
        let enFallback: any = translations['en'];
        for (const enKey of keys) {
          if (enFallback && typeof enFallback === 'object' && enKey in enFallback) {
            enFallback = enFallback[enKey];
          } else {
            enFallback = null;
            break;
          }
        }
        if (typeof enFallback === 'string') {
          current = enFallback;
        } else {
          return path; // Return raw path if key is missing completely
        }
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    let result = current;
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
