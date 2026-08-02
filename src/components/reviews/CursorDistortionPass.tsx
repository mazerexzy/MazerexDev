import { useMemo, useEffect } from 'react';
import { CursorDistortionEffectImpl, type CursorState } from './CursorDistortionEffect';

/**
 * Обёртка линзового искажения за курсором для <EffectComposer>.
 * Анимация — внутри update() самого эффекта.
 */
export default function CursorDistortionPass({ state }: { state: CursorState }) {
    const effect = useMemo(() => new CursorDistortionEffectImpl(state), [state]);
    useEffect(() => () => effect.dispose(), [effect]);

    return <primitive object={effect} dispose={null} />;
}
