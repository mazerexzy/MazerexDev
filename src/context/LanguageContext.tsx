import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ru';

interface LanguageCtx {
    lang: Lang;
    setLang: (l: Lang) => void;
    toggle: () => void;
}

const Ctx = createContext<LanguageCtx>({ lang: 'en', setLang: () => {}, toggle: () => {} });

export const useLanguage = () => useContext(Ctx);

const STORAGE_KEY = 'mazerex-lang';

/**
 * Хранит выбранный язык и сохраняет его в localStorage, чтобы выбор переживал
 * перезагрузку. Тексты страниц к нему пока не подключены — контекст готов
 * принимать переводы, когда они появятся.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(() => {
        if (typeof window === 'undefined') return 'en';
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved === 'ru' || saved === 'en' ? saved : 'en';
    });

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const setLang = (l: Lang) => setLangState(l);
    const toggle = () => setLangState((p) => (p === 'en' ? 'ru' : 'en'));

    return <Ctx.Provider value={{ lang, setLang, toggle }}>{children}</Ctx.Provider>;
}
