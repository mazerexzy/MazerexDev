/**
 * Единая анимация текстов при скролле между секциями — на всех страницах.
 *
 * Повторяет характер страницы About: мягкий сдвиг на ~2rem + затухание,
 * плавный easing [0.65,0,0.35,1] и НИКАКОГО блюра. Раньше home прилетал
 * на 8rem, а stack — на 80vh, оба с сильным размытием: рядом с About это
 * смотрелось дёргано и разнородно.
 */
export const SCROLL_VISIBLE =
    'opacity-100 translate-y-0 blur-0 duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]';

export const SCROLL_HIDDEN_BOTTOM =
    'opacity-0 translate-y-8 blur-0 duration-[400ms] ease-in';

export const SCROLL_HIDDEN_TOP =
    'opacity-0 -translate-y-8 blur-0 duration-[400ms] ease-in';

/** Классы под три состояния, которыми оперируют секции. */
export function scrollAnim(state: 'visible' | 'hidden-top' | 'hidden-bottom'): string {
    if (state === 'visible') return SCROLL_VISIBLE;
    if (state === 'hidden-top') return SCROLL_HIDDEN_TOP;
    return SCROLL_HIDDEN_BOTTOM;
}
