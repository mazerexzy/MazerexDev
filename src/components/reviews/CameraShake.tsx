import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useScene, IMPACT } from './sceneState';

/**
 * Кинематографичная камера: лёгкое ведение за метеоритом в полёте, сильная
 * тряска в момент удара (быстро затухает), потом плавный дрейф к обзору кратера.
 * Тряску кладём ПОВЕРХ базовой позиции сырым джиттером — иначе гасится лерпом.
 */
export default function CameraShake({ isMobile, cursor }: { isMobile: boolean; cursor?: { sx: number; sy: number } }) {
    const s = useScene();
    const { camera } = useThree();
    const base = useMemo(() => new THREE.Vector3(), []);
    const look = useMemo(() => new THREE.Vector3(), []);
    const curLook = useRef(new THREE.Vector3(IMPACT.x, 6, 0));
    const para = useRef({ x: 0, y: 0 }); // сглаженный параллакс

    useFrame((_, dt) => {
        const delta = Math.min(dt, 0.05);

        // Базовая позиция камеры: в полёте чуть выше и дальше, после — обзор кратера
        if (!s.impacted) {
            base.set(isMobile ? -1 : -3, 8.5, isMobile ? 30 : 26);
            look.set(IMPACT.x - 1, THREE.MathUtils.lerp(18, 5, Math.min(s.elapsed / 2.4, 1)), -2);
        } else {
            const since = s.elapsed - s.impactElapsed;
            const settle = THREE.MathUtils.clamp(since / 2.5, 0, 1);
            base.set(
                THREE.MathUtils.lerp(isMobile ? -1 : -3, isMobile ? 0 : 1, settle),
                THREE.MathUtils.lerp(8.5, 5.5, settle),
                THREE.MathUtils.lerp(isMobile ? 30 : 26, isMobile ? 24 : 20, settle)
            );
            look.set(IMPACT.x, THREE.MathUtils.lerp(4, 2.2, settle), 0);
        }

        // Параллакс — как на остальных страницах: слабый truck-сдвиг с
        // задержкой. Смещение добавляем И к позиции, И к точке взгляда, поэтому
        // сцена не вращается (это чистый сдвиг кадра). Во время удара выключен.
        const shaking = s.impacted && s.realSinceImpact < 0.7;
        const targetPX = cursor && !shaking ? (cursor.sx - 0.5) * 2 * 1.4 : 0;
        const targetPY = cursor && !shaking ? (cursor.sy - 0.5) * 2 * 0.7 : 0;
        para.current.x += (targetPX - para.current.x) * 0.03;
        para.current.y += (targetPY - para.current.y) * 0.03;

        base.x += para.current.x;
        base.y += para.current.y;
        look.x += para.current.x;
        look.y += para.current.y;

        camera.position.lerp(base, 0.05);
        curLook.current.lerp(look, 0.05);

        // Тряска при ударе (реальное время, окно ~0.7с, резкий спад)
        if (shaking) {
            const k = 1 - s.realSinceImpact / 0.7;
            const amp = 0.9 * k * k;
            camera.position.x += (Math.random() - 0.5) * amp;
            camera.position.y += (Math.random() - 0.5) * amp;
            camera.position.z += (Math.random() - 0.5) * amp * 0.5;
        }

        camera.lookAt(curLook.current);
        void delta;
    });

    return null;
}
