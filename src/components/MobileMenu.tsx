import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useSound from 'use-sound';
import hoverSound from '../assets/sounds/hover.mp3';
import clickSound from '../assets/sounds/click.mp3';

type Page = 'home' | 'stack' | 'about' | 'contact' | 'reviews';

interface MobileMenuProps {
    isVisible: boolean;
    currentPage: Page;
    onStackClick: () => void;
    onAboutClick: () => void;
    onContactClick: () => void;
    onReviewsClick: () => void;
}

/**
 * Бургер-меню для мобильных.
 *
 * Анимация иконки идёт в две ступени (через transition-delay, без лишнего
 * состояния): сначала три палочки разной длины съезжаются в центр и
 * выравниваются в одну черту, затем эта черта раскрывается в крестик.
 * Синхронно с крестиком фон «заливается» круговым clip-path из точки иконки.
 *
 * ВАЖНО: и кнопка, и оверлей рендерятся ПОРТАЛОМ в document.body. Хедер
 * анимируется через transform (translate-y), а любой transform у предка
 * становится containing block для position:fixed — из-за этого оверлей внутри
 * хедера растягивался лишь на его высоту, а не на весь экран.
 */
export default function MobileMenu({ isVisible, currentPage, onStackClick, onAboutClick, onContactClick, onReviewsClick }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    const [playHover] = useSound(hoverSound, { volume: 0.5, sprite: { trimmedClick: [100, 2000] } });
    const [playClick] = useSound(clickSound, { volume: 0.8, sprite: { trimmedClick: [100, 2000] } });

    // Пока меню открыто — блокируем скролл страницы
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    // Если хедер скрылся (или сменилась страница) — закрываем меню
    useEffect(() => { if (!isVisible) setOpen(false); }, [isVisible]);

    const toggle = () => {
        playClick({ id: 'trimmedClick' });
        setOpen((v) => !v);
    };

    const go = (fn: () => void) => {
        playClick({ id: 'trimmedClick' });
        setOpen(false);
        // даём меню закрыться, потом переключаем страницу
        setTimeout(fn, 260);
    };

    const bar = 'absolute left-0 h-[2px] bg-white rounded-full';

    const items: { label: string; page: Page; onClick: () => void }[] = [
        { label: 'stack', page: 'stack', onClick: onStackClick },
        { label: 'about', page: 'about', onClick: onAboutClick },
        { label: 'contact', page: 'contact', onClick: onContactClick },
        { label: 'reviews', page: 'reviews', onClick: onReviewsClick },
    ];

    return createPortal(
        <div className="md:hidden">
            {/* ── Полноэкранная заливка ───────────────────────────────────── */}
            <div
                className="fixed inset-0 z-[120] bg-[#150a33]"
                style={{
                    // круг раскрывается из точки бургера (правый верхний угол)
                    clipPath: open ? 'circle(150% at 88% 5%)' : 'circle(0% at 88% 5%)',
                    WebkitClipPath: open ? 'circle(150% at 88% 5%)' : 'circle(0% at 88% 5%)',
                    transition: 'clip-path 620ms cubic-bezier(0.65,0,0.35,1)',
                    // ждём, пока сложится крестик, и только потом заливаем
                    transitionDelay: open ? '220ms' : '0ms',
                    pointerEvents: open ? 'auto' : 'none',
                }}
            >
                <nav className="w-full h-full flex flex-col items-center justify-center gap-7">
                    {items.map((it, i) => {
                        const isActive = currentPage === it.page;
                        return (
                            <button
                                key={it.page}
                                onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                                onClick={() => go(it.onClick)}
                                className={`font-gdblack text-5xl tracking-wider transition-colors duration-300 ${
                                    isActive ? 'text-neutral-400 opacity-65' : 'text-white'
                                }`}
                                style={{
                                    // Пункты «выстреливают» снизу вверх по очереди — волной.
                                    // Перелёт в easing (2.1 > 1) даёт заметный отскок, а
                                    // большой шаг задержки превращает серию в волну.
                                    opacity: open ? 1 : 0,
                                    transform: open ? 'translateY(0)' : 'translateY(64px)',
                                    transition:
                                        'opacity 260ms ease, transform 760ms cubic-bezier(0.22, 2.1, 0.4, 1), color 300ms',
                                    transitionDelay: open ? `${500 + i * 130}ms` : '0ms',
                                }}
                            >
                                {it.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ── Кнопка-бургер (поверх заливки) ──────────────────────────── */}
            <button
                onClick={toggle}
                aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
                className="fixed top-12 right-6 z-[130] w-[28px] h-[18px] cursor-pointer transition-all duration-500 ease-in-out"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(-140%)',
                    pointerEvents: isVisible ? 'auto' : 'none',
                }}
            >
                {/* Верхняя — самая короткая */}
                <span
                    className={bar}
                    style={{
                        width: open ? 26 : 14,
                        top: open ? 8 : 0,
                        transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                        transitionDuration: '260ms',
                        // при открытии: сначала съезд (0мс), потом поворот (260мс)
                        transitionDelay: open ? '0ms, 0ms, 260ms' : '260ms, 260ms, 0ms',
                        transitionProperty: 'width, top, transform',
                        transitionTimingFunction: 'ease-in-out',
                    }}
                />
                {/* Средняя — самая длинная, в крестике исчезает */}
                <span
                    className={bar}
                    style={{
                        width: 26,
                        top: 8,
                        opacity: open ? 0 : 1,
                        transitionDuration: '160ms',
                        transitionDelay: open ? '160ms' : '260ms',
                        transitionProperty: 'opacity',
                    }}
                />
                {/* Нижняя — длиннее верхней, короче средней */}
                <span
                    className={bar}
                    style={{
                        width: open ? 26 : 20,
                        top: open ? 8 : 16,
                        transform: open ? 'rotate(-45deg)' : 'rotate(0deg)',
                        transitionDuration: '260ms',
                        transitionDelay: open ? '0ms, 0ms, 260ms' : '260ms, 260ms, 0ms',
                        transitionProperty: 'width, top, transform',
                        transitionTimingFunction: 'ease-in-out',
                    }}
                />
            </button>
        </div>,
        document.body
    );
}
