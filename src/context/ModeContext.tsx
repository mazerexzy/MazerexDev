import { createContext, useContext, type ReactNode } from 'react';

export type SiteMode = 'full' | 'lite';

const Ctx = createContext<SiteMode>('full');

/** Текущий режим сайта. По умолчанию 'full' — если провайдера нет. */
export const useMode = () => useContext(Ctx);
export const useIsLite = () => useContext(Ctx) === 'lite';

export function ModeProvider({ mode, children }: { mode: SiteMode; children: ReactNode }) {
    return <Ctx.Provider value={mode}>{children}</Ctx.Provider>;
}
