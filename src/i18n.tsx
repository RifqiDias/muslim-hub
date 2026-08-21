import AsyncStorage from '@react-native-async-storage/async-storage';
import { Context, PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'id' | 'en';

type Dict = Record<string, string>;

interface NamespaceEntry {
  id: Dict;
  en: Dict;
}

const registries: Record<string, NamespaceEntry> = {};

export function registerStrings(ns: string, id: Dict, en: Dict): void {
  registries[ns] = { id, en };
}

const LANG_KEY = 'muslimhub.lang';

export interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);

function translate(lang: Lang, path: string, vars?: Record<string, string | number>): string {
  const separator = path.indexOf('.');
  if (separator <= 0) return path;
  const ns = path.slice(0, separator);
  const key = path.slice(separator + 1);
  const entry = registries[ns];
  if (!entry) return path;
  const raw = entry[lang][key] ?? entry.id[key] ?? path;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLangState] = useState<Lang>('id');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LANG_KEY)
      .then((value) => {
        if (active && value === 'en') setLangState('en');
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        AsyncStorage.setItem(LANG_KEY, next).catch(() => undefined);
      },
      t: (path, vars) => translate(lang, path, vars),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLang(): I18n {
  const ctx = useContext(I18nContext as Context<I18n | null>);
  return ctx ?? { lang: 'id', setLang: () => undefined, t: (path) => translate('id', path) };
}
