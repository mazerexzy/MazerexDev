import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dict, type TKey } from './translations';

/**
 * Хук перевода: const t = useT(); ... t('heroName')
 * Строки с \n компонент разбивает сам — см. splitLines ниже.
 */
export function useT() {
    const { lang } = useLanguage();
    return useCallback((key: TKey) => dict[lang][key], [lang]);
}

/** Разбивает строку по \n — удобно подставлять <br /> между частями. */
export function splitLines(text: string): string[] {
    return text.split('\n');
}
