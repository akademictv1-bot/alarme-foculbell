import { createContext, use, ReactNode } from 'react';
import { Language } from '../types';
import { t } from './i18n';

interface LanguageContextValue {
  lang: Language;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'pt',
  t: (key: string) => key,
});

export function LanguageProvider({ lang, children }: { lang: Language; children: ReactNode }) {
  const translate = (key: string) => t(key, lang);
  return (
    <LanguageContext value={{ lang, t: translate }}>
      {children}
    </LanguageContext>
  );
}

export function useT(): (key: string) => string {
  return use(LanguageContext).t;
}

export function useLang(): Language {
  return use(LanguageContext).lang;
}
