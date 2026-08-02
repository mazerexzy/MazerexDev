import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useScene, IMPACT, PURPLE } from './sceneState';

/**
 * Тёмная поверхность + кратер, проявляющийся после удара. Кратер — вдавленное
 * тёмное кольцо с фиолетовым ободком (растёт по s.colorShift). Плюс статичный
 * физический пол (Rapier), по которому катаются осколки.
 */
export default function Ground() {
    const s = useScene();
    const craterMat = useRef<THREE.MeshStandardMaterial>(null);
    const rimMat = useRef<THREE.MeshBasicMaterial>(null);
    const crater = useRef<THREE.Group>(null);

    const groundMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0a0910', roughness: 1, metalness: 0,
    }), []);

    useFrame(() => {
        if (!s.impacted || !crater.current) { if (crater.current) crater.current.visible = false; return; }
        crater.current.visible = true;
        const since = s.elapsed - s.impactElapsed;
        const grow = THREE.MathUtils.clamp(since / 0.8, 0, 1);
        crater.current.scale.setScalar(grow);
        if (rimMat.current) {
            const pulse = 0.6 + 0.4 * Math.sin(since * 2.2);
            rimMat.current.opacity = grow * (0.25 + pulse * 0.25) * s.colorShift;
        }
        if (craterMat.current) craterMat.current.emissiveIntensity = 0.3 * s.colorShift;
    });

    return (
        <group>
            {/* Визуальный пол */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={groundMat}>
                <planeGeometry args={[220, 220]} />
            </mesh>

            {/* Физический пол (Rapier) — тонкая плита у y=0 */}
            <RigidBody type="fixed" colliders={false}>
                <CuboidCollider args={[110, 0.5, 110]} position={[0, -0.5, 0]} />
            </RigidBody>

            {/* Кратер — компактный, тёмный, чтобы не заливать метеор фиолетовым */}
            <group ref={crater} position={[IMPACT.x, 0.02, IMPACT.z]} visible={false}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.7, 2.4, 48]} />
                    <meshStandardMaterial ref={craterMat} color="#070510" emissive={PURPLE} emissiveIntensity={0} roughness={1} side={THREE.DoubleSide} />
                </mesh>
                {/* Тонкий фиолетовый ободок по краю кратера (не огромный диск) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                    <ringGeometry args={[2.2, 2.45, 64]} />
                    <meshBasicMaterial ref={rimMat} color={PURPLE} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}
