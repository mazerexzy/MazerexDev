import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    SceneCtx, createSceneState, getMeteorPos, FLIGHT_DURATION,
    COLD, PURPLE_DEEP,
} from './sceneState';
import Ground from './Ground';
import Meteor from './Meteor';
import FireTrail from './FireTrail';
import SmokeParticles from './SmokeParticles';
import Sparks from './Sparks';
import ImpactEffect from './ImpactEffect';
import CrackSystem from './CrackSystem';
import DebrisSystem from './DebrisSystem';
import CameraShake from './CameraShake';
import SoundManager from './SoundManager';
import ElvenTower from './ElvenTower';
import EmberField from './EmberField';

/**
 * Оркестратор сцены. Держит единый SceneState (ref), продвигает время/фазы/
 * slow-mo в одном useFrame (регистрируется раньше детей => читают свежие данные),
 * управляет цветовой гаммой света (холодный космос -> оранжевый полёт ->
 * фиолетовая гамма после удара). React-состояние — только impacted (для монтажа
 * осколков и звука), чтобы не дёргать реконсиляцию.
 */
export default function SceneController({ isMobile, onImpact, cursor }: { isMobile: boolean; onImpact?: () => void; cursor?: { sx: number; sy: number } }) {
    const sceneRef = useRef(createSceneState());
    const s = sceneRef.current;
    const [impacted, setImpacted] = useState(false);

    const ambient = useRef<THREE.AmbientLight>(null);
    const keyLight = useRef<THREE.DirectionalLight>(null);
    const fill = useRef<THREE.PointLight>(null);

    const cCold = useMemo(() => new THREE.Color(COLD), []);
    const cPurple = useMemo(() => new THREE.Color(PURPLE_DEEP), []);
    const tmp = useMemo(() => new THREE.Color(), []);

    useFrame((_, dt) => {
        const rdt = Math.min(dt, 0.05);

        // slow-mo окно ~0.2с реального времени сразу после удара
        if (s.impacted) {
            s.realSinceImpact += rdt;
            if (s.realSinceImpact < 0.2) s.slowmo = 0.2;
            else s.slowmo = THREE.MathUtils.lerp(s.slowmo, 1, 0.08);
        }

        s.elapsed += rdt * s.slowmo;
        getMeteorPos(s.elapsed, s.meteor);

        // Триггер удара
        if (!s.impacted && s.elapsed >= FLIGHT_DURATION) {
            s.impacted = true;
            s.impactElapsed = s.elapsed;
            s.realSinceImpact = 0;
            s.slowmo = 0.2;
            s.phase = 'impact';
            setImpacted(true);
            onImpact?.(); // сигнал наружу — для ударной волны в композере
        }

        if (s.impacted) {
            const since = s.elapsed - s.impactElapsed;
            s.colorShift = THREE.MathUtils.clamp(since / 2, 0, 1);
            if (since > 0.5 && s.phase === 'impact') s.phase = 'aftermath';
            if (since > 3 && s.phase === 'aftermath') s.phase = 'settled';
        }

        // Цветовая гамма света: холод -> (после удара) фиолетовый
        tmp.copy(cCold).lerp(cPurple, s.colorShift);
        if (ambient.current) {
            ambient.current.color.copy(tmp);
            ambient.current.intensity = 0.35 + s.colorShift * 0.15;
        }
        if (keyLight.current) {
            keyLight.current.color.copy(tmp);
        }
        if (fill.current) {
            fill.current.color.copy(cPurple);
            fill.current.intensity = s.colorShift * 1.2;
        }
    });

    return (
        <SceneCtx.Provider value={s}>
            {/* Освещение: холодный космос, после удара уходит в фиолет */}
            <ambientLight ref={ambient} color={COLD} intensity={0.35} />
            <directionalLight ref={keyLight} color={COLD} intensity={0.8} position={[-8, 14, 10]} />
            <pointLight ref={fill} color={PURPLE_DEEP} intensity={0} distance={40} position={[7, 3, 0]} />

            <Ground />
            {/* Дальний план: огромная неоновая эльфийская башня */}
            <ElvenTower position={[34, 0, -62]} scale={1.6} rotation={[0, -0.5, 0]} />
            {/* Стена раскалённых искр от башни, кольцом вокруг сцены */}
            <EmberField origin={[34, 0, -62]} />
            <Meteor />
            <FireTrail />
            <SmokeParticles />
            <Sparks />
            <ImpactEffect />
            <CrackSystem />
            {impacted && <DebrisSystem />}

            <CameraShake isMobile={isMobile} cursor={cursor} />
            <SoundManager impacted={impacted} />
        </SceneCtx.Provider>
    );
}
