import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, PURPLE, FIRE } from './sceneState';

/**
 * Огромная неоновая эльфийская башня на дальнем плане. Процедурная: тёмный
 * камень + светящиеся неоновые кольца/рёбра/шпиль — в той же гамме, что и
 * метеорит (в полёте отдаёт оранжевым, после удара уходит в фиолет).
 *
 * Геометрия и материалы создаются один раз (useMemo), в кадре меняем только
 * цвет/интенсивность эмиссии и лёгкую пульсацию — без аллокаций.
 */

const SEGMENTS = 6;      // ярусов башни
const BASE_R = 3.2;      // радиус у основания
const SEG_H = 7;         // высота яруса

export default function ElvenTower(props: React.ComponentProps<'group'>) {
    const s = useScene();
    const neonMat = useRef<THREE.MeshStandardMaterial>(null);
    const glowRefs = useRef<THREE.MeshBasicMaterial[]>([]);
    const spire = useRef<THREE.Mesh>(null);
    const tmp = useMemo(() => new THREE.Color(), []);
    const cFire = useMemo(() => new THREE.Color(FIRE), []);
    const cPurple = useMemo(() => new THREE.Color(PURPLE), []);

    const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0d0a16', roughness: 0.95, metalness: 0.05,
    }), []);

    // Ярусы: сужающиеся кверху барабаны + неоновое кольцо на стыке
    const tiers = useMemo(() => Array.from({ length: SEGMENTS }, (_, i) => {
        const t = i / SEGMENTS;
        const rBottom = BASE_R * (1 - t * 0.72);
        const rTop = BASE_R * (1 - (i + 1) / SEGMENTS * 0.72);
        return { y: i * SEG_H, rBottom, rTop, twist: i * 0.18 };
    }), []);

    // Тонкие вертикальные рёбра-контрфорсы вокруг нижних ярусов
    const ribs = useMemo(() => {
        const arr: { angle: number; y: number; h: number; r: number }[] = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            arr.push({ angle, y: SEG_H * 0.9, h: SEG_H * 2.2, r: BASE_R * 0.92 });
        }
        return arr;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // цвет неона: оранжевый в полёте -> фиолетовый после удара
        tmp.copy(cFire).lerp(cPurple, s.colorShift);
        const pulse = 0.75 + 0.25 * Math.sin(t * 1.1);

        if (neonMat.current) {
            neonMat.current.emissive.copy(tmp);
            neonMat.current.emissiveIntensity = 1.6 * pulse;
            neonMat.current.color.copy(tmp);
        }
        for (const m of glowRefs.current) {
            if (!m) continue;
            m.color.copy(tmp);
            m.opacity = 0.5 * pulse;
        }
        if (spire.current) {
            spire.current.rotation.y = t * 0.05;
        }
    });

    return (
        <group {...props}>
            {/* Ярусы башни */}
            {tiers.map((tier, i) => (
                <group key={i} position={[0, tier.y, 0]} rotation={[0, tier.twist, 0]}>
                    {/* Каменный барабан */}
                    <mesh material={stoneMat} castShadow>
                        <cylinderGeometry args={[tier.rTop, tier.rBottom, SEG_H, 8, 1, true]} />
                    </mesh>
                    {/* Неоновое кольцо на стыке ярусов */}
                    <mesh position={[0, SEG_H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[tier.rTop * 0.98, tier.rTop * 1.22, 32]} />
                        <meshBasicMaterial
                            ref={(el) => { if (el) glowRefs.current[i] = el; }}
                            color={PURPLE}
                            transparent
                            opacity={0.5}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            ))}

            {/* Вертикальные неоновые рёбра */}
            {ribs.map((rib, i) => (
                <mesh
                    key={`rib-${i}`}
                    position={[Math.cos(rib.angle) * rib.r, rib.y, Math.sin(rib.angle) * rib.r]}
                    rotation={[0, -rib.angle, 0.05]}
                    material={i === 0 ? undefined : undefined}
                >
                    <boxGeometry args={[0.14, rib.h, 0.14]} />
                    {/* общий неоновый материал (ref ставим один раз) */}
                    {i === 0
                        ? <meshStandardMaterial ref={neonMat} color={PURPLE} emissive={PURPLE} emissiveIntensity={1.6} toneMapped={false} />
                        : <meshStandardMaterial color={PURPLE} emissive={PURPLE} emissiveIntensity={1.6} toneMapped={false} />}
                </mesh>
            ))}

            {/* Шпиль */}
            <mesh ref={spire} position={[0, SEGMENTS * SEG_H + 5, 0]} material={stoneMat}>
                <coneGeometry args={[BASE_R * 0.3, 12, 8]} />
            </mesh>
            {/* Светящееся навершие */}
            <mesh position={[0, SEGMENTS * SEG_H + 12, 0]}>
                <octahedronGeometry args={[1.1, 0]} />
                <meshBasicMaterial
                    ref={(el) => { if (el) glowRefs.current[SEGMENTS] = el; }}
                    color={PURPLE}
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Подсветка башни снизу */}
            <pointLight position={[0, SEG_H * 2, 0]} color={PURPLE} intensity={8} distance={45} />
        </group>
    );
}
