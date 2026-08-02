import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Ловит ошибки рендера 3D-сцены (в т.ч. из R3F/Rapier), чтобы падение внутри
 * Canvas не роняло всё приложение до белой страницы. При ошибке показывает
 * fallback (по умолчанию — ничего), а хедер/текст снаружи остаются живыми.
 */
export default class SceneErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ReviewsScene] crashed:', error, info);
    }

    render() {
        if (this.state.hasError) return this.props.fallback ?? null;
        return this.props.children;
    }
}
