import { useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { ShockwaveEffectImpl, type WaveState } from './ShockwaveEffect';

/**
 * Обёртка эффекта для <EffectComposer>. Сам эффект анимируется внутри своего
 * update() — здесь только создаём его и отдаём композеру как <primitive>
 * (тот же паттерн, что использует сама библиотека для DepthOfField/GodRays).
 */
export default function ShockwavePass({ state }: { state: WaveState }) {
    const camera = useThree((s) => s.camera);
    const effect = useMemo(() => new ShockwaveEffectImpl(camera, state), [camera, state]);
    useEffect(() => () => effect.dispose(), [effect]);

    return <primitive object={effect} dispose={null} />;
}
