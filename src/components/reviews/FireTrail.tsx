import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, FIRE, FIRE_HOT } from './sceneState';
import { radialTexture } from './textures';

const COUNT = 40; // сегментов хвоста

/**
 * Огненный хвост: кольцевой буфер недавних позиций метеорита. Новые сегменты
 * горячие и крупные, старые — тускнеют и уменьшаются. Каждый квад билбордится
 * к камере. Instanced — один draw call, ноль аллокаций в кадре.
 */
export default function FireTrail() {
    const s = useScene();
    const { camera } = useThree();
    const mesh = useRef<THREE.InstancedMesh>(null);
    const tex = useMemo(() => radialTexture('rgba(255,240,200,1)', 'rgba(255,120,20,0.5)', 'rgba(255,60,0,0)'), []);

    const buf = useMemo(() => Array.from({ length: COUNT }, () => new THREE.Vector3().copy(s.meteor)), [s.meteor]);
    const head = useRef(0);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const col = useMemo(() => new THREE.Color(), []);
    const cHot = useMemo(() => new THREE.Color(FIRE_HOT), []);
    const cFire = useMemo(() => new THREE.Color(FIRE), []);

    useFrame(() => {
        if (!mesh.current) return;

        // Пишем текущую позицию метеора в буфер (только пока летит)
        if (!s.impacted) {
            head.current = (head.current + 1) % COUNT;
            buf[head.current].copy(s.meteor);
        }

        const fade = s.impacted ? THREE.MathUtils.clamp(1 - (s.elapsed - s.impactElapsed) / 0.5, 0, 1) : 1;

        for (let i = 0; i < COUNT; i++) {
            const idx = (head.current - i + COUNT * 2) % COUNT;
            const age = i / COUNT;              // 0 = свежий, 1 = хвост
            const p = buf[idx];
            const scale = (2.4 * (1 - age) + 0.3) * fade;
            dummy.position.copy(p);
            dummy.scale.setScalar(Math.max(0.0001, scale));
            dummy.quaternion.copy(camera.quaternion); // билборд к камере
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
            col.copy(cHot).lerp(cFire, age).multiplyScalar((1 - age) * fade);
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
