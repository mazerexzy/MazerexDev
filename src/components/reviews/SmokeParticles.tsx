import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, IMPACT } from './sceneState';
import { radialTexture } from './textures';

const COUNT = 90;

interface Puff {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    age: number;
    life: number;
    size: number;
    rot: number;
    active: boolean;
}

/**
 * Дым: пул частиц (instanced). В полёте вяло сочится за метеоритом, при ударе —
 * мощный клуб вверх/в стороны, потом идёт ещё несколько секунд и тает.
 * Частицы создаются один раз, дальше только переиспользуются.
 */
export default function SmokeParticles() {
    const s = useScene();
    const { camera } = useThree();
    const mesh = useRef<THREE.InstancedMesh>(null);
    const tex = useMemo(() => radialTexture('rgba(60,55,70,0.9)', 'rgba(30,28,38,0.5)', 'rgba(20,18,26,0)'), []);

    const pool = useMemo<Puff[]>(() => Array.from({ length: COUNT }, () => ({
        pos: new THREE.Vector3(), vel: new THREE.Vector3(), age: 0, life: 1, size: 1, rot: 0, active: false,
    })), []);
    const cursor = useRef(0);
    const burst = useRef(false);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const emitAcc = useRef(0);

    const spawn = (x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number) => {
        const p = pool[cursor.current];
        cursor.current = (cursor.current + 1) % COUNT;
        p.pos.set(x, y, z); p.vel.set(vx, vy, vz);
        p.age = 0; p.life = life; p.size = size; p.rot = Math.random() * Math.PI; p.active = true;
    };

    useFrame((_, dt) => {
        if (!mesh.current) return;
        const delta = Math.min(dt, 0.05) * s.slowmo;

        // Эмиссия следа в полёте
        if (!s.impacted) {
            emitAcc.current += delta;
            if (emitAcc.current > 0.03) {
                emitAcc.current = 0;
                spawn(s.meteor.x, s.meteor.y, s.meteor.z,
                    (Math.random() - 0.5) * 0.6, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6,
                    1.6 + Math.random(), 1.4 + Math.random());
            }
        }

        // Взрыв дыма при ударе (один раз)
        if (s.impacted && !burst.current) {
            burst.current = true;
            for (let i = 0; i < 44; i++) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.random() * 2;
                spawn(IMPACT.x + Math.cos(a) * r, 0.4 + Math.random() * 0.6, IMPACT.z + Math.sin(a) * r,
                    Math.cos(a) * (1.5 + Math.random() * 2.5), 1.5 + Math.random() * 3, Math.sin(a) * (1.5 + Math.random() * 2.5),
                    3 + Math.random() * 2.5, 2.5 + Math.random() * 2.5);
            }
        }

        for (let i = 0; i < COUNT; i++) {
            const p = pool[i];
            if (!p.active) { dummy.scale.setScalar(0); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix); continue; }
            p.age += delta;
            if (p.age >= p.life) { p.active = false; dummy.scale.setScalar(0); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix); continue; }
            // движение + затухание скорости (сопротивление воздуха)
            p.vel.multiplyScalar(0.96);
            p.vel.y += 0.6 * delta; // дым поднимается
            p.pos.addScaledVector(p.vel, delta);
            const k = p.age / p.life;
            const scale = p.size * (0.5 + k * 1.8);
            dummy.position.copy(p.pos);
            dummy.quaternion.copy(camera.quaternion);
            dummy.rotateZ(p.rot + k);
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        // затухание общей непрозрачности к «settled»
        const mat = mesh.current.material as THREE.MeshBasicMaterial;
        mat.opacity = s.phase === 'settled' ? THREE.MathUtils.lerp(mat.opacity, 0.18, 0.02) : 0.55;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={0.55} color="#3a3444" />
        </instancedMesh>
    );
}
