import { useMemo } from 'react';
import Grid from '../assets/grid.png';

export type LitePage = 'home' | 'stack' | 'about' | 'contact' | 'reviews';

/**
 * Фон для режима «без моделей»: полностью на CSS, без WebGL и без загрузки
 * 3D-ассетов. Медленно плывущие световые пятна + дрейфующая сетка + редкие
 * мерцающие точки. У каждой страницы своя цветовая гамма, чтобы переходы
 * ощущались так же, как со сценами.
 */
const PALETTE: Record<LitePage, { base: string; a: string; b: string; c: string }> = {
    home:     { base: '#0a0616', a: '#8A2BE2', b: '#FF1493', c: '#3b82f6' },
    stack:    { base: '#0a0510', a: '#b829ff', b: '#00e5ff', c: '#ff3d81' },
    about:    { base: '#100a24', a: '#d636c2', b: '#7a1fd0', c: '#00bfff' },
    contact:  { base: '#0c0620', a: '#ff2fd6', b: '#7a1fd0', c: '#4c1d95' },
    reviews:  { base: '#05030d', a: '#b829ff', b: '#ff2fd6', c: '#2a1b6b' },
};

const STAR_COUNT = 46;

export default function LiteBackground({ page }: { page: LitePage }) {
    const c = PALETTE[page];

    // Звёзды считаем один раз на страницу — позиции стабильны между кадрами
    const stars = useMemo(
        () =>
            Array.from({ length: STAR_COUNT }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: 1 + Math.random() * 2,
                delay: Math.random() * 4,
                duration: 3 + Math.random() * 4,
            })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [page]
    );

    return (
        <div
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: c.base }}
        >
            {/* Световые пятна: большие размытые градиенты, медленно плывут */}
            <div
                className="absolute -top-1/4 -left-1/4 w-[85vw] h-[85vw] rounded-full blur-[100px] opacity-[0.42] animate-aurora-a"
                style={{ background: `radial-gradient(circle, ${c.a} 0%, transparent 68%)` }}
            />
            <div
                className="absolute top-1/3 -right-1/4 w-[75vw] h-[75vw] rounded-full blur-[110px] opacity-[0.34] animate-aurora-b"
                style={{ background: `radial-gradient(circle, ${c.b} 0%, transparent 68%)` }}
            />
            <div
                className="absolute -bottom-1/3 left-1/4 w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-[0.3] animate-aurora-c"
                style={{ background: `radial-gradient(circle, ${c.c} 0%, transparent 70%)` }}
            />

            {/* Сетка — та же, что в прелоадере, медленно уползает по диагонали */}
            <div
                className="absolute inset-0 opacity-[0.16] animate-grid-pan"
                style={{
                    backgroundImage: `url(${Grid})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '55px 55px',
                }}
            />

            {/* Мерцающие точки */}
            {stars.map((s, i) => (
                <span
                    key={i}
                    className="absolute rounded-full bg-white animate-star"
                    style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        width: s.size,
                        height: s.size,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.duration}s`,
                    }}
                />
            ))}

            {/* Виньетка — прижимает края и держит фокус на тексте */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 35%, ${c.base}cc 78%, ${c.base} 100%)`,
                }}
            />
        </div>
    );
}
