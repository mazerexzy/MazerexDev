import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import phonePath from '../../assets/models/galaxyphone.glb?url';

export interface GalaxyPhoneHandle {
    close: () => void;
}

interface GalaxyPhoneProps {
    active?: boolean;
    [key: string]: any;
}

// Корневой узел модели (Sketchfab_model) несёт зашитую в matrix коррекцию
// осей + равномерный масштаб ~0.0479 (стандартный экспорт Sketchfab) — без
// компенсации модель рендерится в ~21 раз меньше, чем нужно.
const SCALE_FIX = 1 / 0.04790891334414482;

// Клип "open" — это единая сцена "закрыто -> открывается -> держится открытым
// -> закрывается -> закрыто" (проверено по ключевым кадрам): открытие идёт
// 0 -> OPEN_END, статичное плато открытого состояния OPEN_END -> CLOSE_START,
// закрытие CLOSE_START -> CLOSE_END. Нам нужно только открытие и закрытие —
// плато пропускаем целиком.
const OPEN_END = 1.875;
const CLOSE_START = 4.333;
const CLOSE_END = 5.5417;

// Раскрытие тянем заметно дольше родного темпа клипа — так оно читается
// плавнее и «дороже». Закрытие оставляем прежним, чтобы уложиться в
// CONTACT_EXIT_MS в App.tsx.
const OPEN_ANIM_DURATION = 2.7;
const CLOSE_ANIM_DURATION = CLOSE_END - CLOSE_START;

// smootherstep вместо cubic: у него нулевые и скорость, И ускорение на обоих
// концах, поэтому нет рывка на старте и жёсткой остановки в конце.
const smootherstep = (t: number) => t * t * t * (t * (6 * t - 15) + 10);

// action.timeScale двигает клип линейно — "сыро", без разгона/торможения.
// Поэтому крышку крутим вручную: держим action на паузе и сами каждый кадр
// выставляем action.time по smootherstep — так открытие/закрытие мягко
// разгоняется к середине и плавно останавливается в конце.
const GalaxyPhone = forwardRef<GalaxyPhoneHandle, GalaxyPhoneProps>(({ active = true, ...props }, ref) => {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(phonePath) as any;
    const { actions } = useAnimations(animations, group);
    const phase = useRef<'closed' | 'opening' | 'open' | 'closing' | 'closed-end'>('closed');
    const phaseStart = useRef(-1);

    useEffect(() => {
        const action = actions['open'];
        if (!action) return;
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.time = 0;
        action.paused = true;
        action.play();
        phase.current = 'closed';
    }, [actions]);

    useEffect(() => {
        if (!active || phase.current !== 'closed') return;
        phase.current = 'opening';
        phaseStart.current = -1;
    }, [active]);

    useFrame((state) => {
        const action = actions['open'];
        if (!action) return;
        const t = state.clock.getElapsedTime();

        if (phase.current === 'opening') {
            if (phaseStart.current < 0) phaseStart.current = t;
            const p = THREE.MathUtils.clamp((t - phaseStart.current) / OPEN_ANIM_DURATION, 0, 1);
            action.time = smootherstep(p) * OPEN_END;
            if (p >= 1) phase.current = 'open';
        } else if (phase.current === 'closing') {
            if (phaseStart.current < 0) phaseStart.current = t;
            const p = THREE.MathUtils.clamp((t - phaseStart.current) / CLOSE_ANIM_DURATION, 0, 1);
            action.time = CLOSE_START + smootherstep(p) * (CLOSE_END - CLOSE_START);
            if (p >= 1) phase.current = 'closed-end';
        }
    });

    useImperativeHandle(ref, () => ({
        close: () => {
            if (phase.current === 'closing' || phase.current === 'closed-end') return;
            phase.current = 'closing';
            phaseStart.current = -1;
        },
    }), []);

    return (
        <group ref={group} {...props} dispose={null}>
            <group scale={SCALE_FIX}>
                <primitive object={scene} />
            </group>
        </group>
    );
});

export default GalaxyPhone;

useGLTF.preload(phonePath);
