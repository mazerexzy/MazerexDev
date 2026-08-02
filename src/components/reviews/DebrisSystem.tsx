import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { InstancedRigidBodies, type InstancedRigidBodyProps } from '@react-three/rapier';
import * as THREE from 'three';
import { IMPACT } from './sceneState';

import fragmentPath from '../../assets/models/meteor_fragment.glb?url';

const COUNT = 28;

/**
 * Разлёт осколков камня на физике Rapier. Монтируется только ПОСЛЕ удара —
 * тела спавнятся в точке удара с разбросом скоростей во все стороны, дальше
 * Rapier сам катает/подбрасывает их. InstancedRigidBodies = один InstancedMesh
 * + N связанных физических тел (перф-путь для множества камней).
 */
export default function DebrisSystem() {
    const { scene } = useGLTF(fragmentPath);

    // Достаём геометрию/материал осколка из модели
    const { geometry, material } = useMemo(() => {
        let g: THREE.BufferGeometry | null = null;
        let m: THREE.Material | null = null;
        scene.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.isMesh && !g) {
                g = mesh.geometry;
                m = (mesh.material as THREE.Material).clone();
                const std = m as THREE.MeshStandardMaterial;
                if (std.emissive) { std.emissive = new THREE.Color('#5a1f7a'); std.emissiveIntensity = 0.35; }
                std.roughness = 0.9;
            }
        });
        return { geometry: g as unknown as THREE.BufferGeometry, material: m as unknown as THREE.Material };
    }, [scene]);

    const instances = useMemo<InstancedRigidBodyProps[]>(() => {
        return Array.from({ length: COUNT }, (_, i) => {
            const a = Math.random() * Math.PI * 2;
            const el = Math.random() * Math.PI * 0.42;
            const sp = 5 + Math.random() * 12;
            return {
                key: i,
                position: [IMPACT.x + (Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.5, IMPACT.z + (Math.random() - 0.5) * 0.6],
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
                scale: 0.12 + Math.random() * 0.22,
                linearVelocity: [
                    Math.cos(a) * Math.cos(el) * sp,
                    Math.sin(el) * sp * 1.15 + 3,
                    Math.sin(a) * Math.cos(el) * sp,
                ],
                angularVelocity: [
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                ],
            } as InstancedRigidBodyProps;
        });
    }, []);

    if (!geometry) return null;

    return (
        <InstancedRigidBodies
            instances={instances}
            colliders="ball"
            restitution={0.35}
            friction={0.9}
            linearDamping={0.15}
            angularDamping={0.2}
        >
            <instancedMesh args={[geometry, material, COUNT]} count={COUNT} castShadow receiveShadow frustumCulled={false} />
        </InstancedRigidBodies>
    );
}

useGLTF.preload(fragmentPath);
