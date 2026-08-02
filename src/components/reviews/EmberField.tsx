import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, FIRE_HOT, PURPLE } from './sceneState';
import { radialTexture } from './textures';

const COUNT = 700;

/**
 * Поле раскалённых угольков-искр: стеной-«забором» окружает сцену по кругу,
 * гуще у земли и у башни, реже к верху. Медленно всплывают и покачиваются,
 * мерцают. Цвет живёт вместе со сценой (оранжевый -> фиолетовый после удара).
 *
 * Один InstancedMesh на все частицы, буферы считаются один раз — в кадре только
 * обновление матриц, без аллокаций.
 */
export default function EmberField({ origin = [34, 0, -62] as [number, number, number] }) {
    const s = useScene();
    const { camera } = useThree();
    const mesh = useRef<THREE.InstancedMesh>(null);
    const tex = useMemo(() => radialTexture('rgba(255,255,255,1)', 'rgba(255,120,90,0.5)', 'rgba(255,60,40,0)'), []);

    // Стартовые параметры частиц: кольцо вокруг центра сцены + сгущение у башни
    const seeds = useMemo(() => Array.from({ length: COUNT }, (_, i) => {
        // часть частиц «рождается» у башни, остальные — по всему кольцу
        const fromTower = i < COUNT * 0.35;
        const angle = Math.random() * Math.PI * 2;
        // радиус кольца-забора: широкий пояс вокруг сцены
        const radius = fromTower ? 6 + Math.random() * 14 : 26 + Math.random() * 30;
        const cx = fromTower ? origin[0] : 6;
        const cz = fromTower ? origin[2] : -8;
        return {
            x: cx + Math.cos(angle) * radius,
            z: cz + Math.sin(angle) * radius,
            // гуще у земли: квадратичное распределение по высоте
            y: Math.pow(Math.random(), 1.8) * 34,
            speed: 0.35 + Math.random() * 1.1,
            sway: 0.4 + Math.random() * 1.2,
            phase: Math.random() * Math.PI * 2,
            size: 0.16 + Math.random() * 0.32,
            twinkle: 1.5 + Math.random() * 3,
        };
    }), [origin]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const col = useMemo(() => new THREE.Color(), []);
    const cHot = useMemo(() => new THREE.Color(FIRE_HOT), []);
    const cPurple = useMemo(() => new THREE.Color(PURPLE), []);

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.getElapsedTime();

        for (let i = 0; i < COUNT; i++) {
            const p = seeds[i];
            // всплываем и зацикливаемся по высоте
            const y = (p.y + t * p.speed) % 34;
            const swayX = Math.sin(t * 0.4 + p.phase) * p.sway;
            const swayZ = Math.cos(t * 0.32 + p.phase * 1.3) * p.sway;

            dummy.position.set(p.x + swayX, y, p.z + swayZ);
            dummy.quaternion.copy(camera.quaternion); // билборд к камере
            // мерцание + затухание к верху
            const fade = 1 - y / 34;
            const twinkle = 0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase);
            dummy.scale.setScalar(p.size * (0.5 + fade) * (0.7 + twinkle * 0.5));
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);

            col.copy(cHot).lerp(cPurple, s.colorShift * 0.75).multiplyScalar(fade * twinkle);
            mesh.current.setColorAt(i, col);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={tex}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </instancedMesh>
    );
}
