import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, IMPACT, FIRE_HOT, PURPLE } from './sceneState';

const COUNT = 260;

interface Spark {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    age: number;
    life: number;
    active: boolean;
}

/**
 * Искры: вытянутые светящиеся частицы. В полёте немного сыпется от метеорита,
 * при ударе — плотный сноп во все стороны с гравитацией и отскоком от земли.
 * Instanced, ориентированы вдоль вектора скорости (эффект стрика/скорости).
 */
export default function Sparks() {
    const s = useScene();
    const mesh = useRef<THREE.InstancedMesh>(null);
    const pool = useMemo<Spark[]>(() => Array.from({ length: COUNT }, () => ({
        pos: new THREE.Vector3(), vel: new THREE.Vector3(), age: 0, life: 1, active: false,
    })), []);
    const cursor = useRef(0);
    const burst = useRef(false);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const col = useMemo(() => new THREE.Color(), []);
    const cHot = useMemo(() => new THREE.Color(FIRE_HOT), []);
    const cPurple = useMemo(() => new THREE.Color(PURPLE), []);
    const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
    const dir = useMemo(() => new THREE.Vector3(0, 1, 0), []); // переиспользуемый (без аллокаций)
    const emitAcc = useRef(0);

    const spawn = (x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number) => {
        const p = pool[cursor.current];
        cursor.current = (cursor.current + 1) % COUNT;
        p.pos.set(x, y, z); p.vel.set(vx, vy, vz); p.age = 0; p.life = life; p.active = true;
    };

    useFrame((_, dt) => {
        if (!mesh.current) return;
        const delta = Math.min(dt, 0.05) * s.slowmo;

        if (!s.impacted) {
            emitAcc.current += delta;
            if (emitAcc.current > 0.02) {
                emitAcc.current = 0;
                for (let i = 0; i < 2; i++) {
                    spawn(s.meteor.x, s.meteor.y, s.meteor.z,
                        (Math.random() - 0.5) * 4, (Math.random() - 0.2) * 3, (Math.random() - 0.5) * 4,
                        0.5 + Math.random() * 0.5);
                }
            }
        }

        if (s.impacted && !burst.current) {
            burst.current = true;
            for (let i = 0; i < 200; i++) {
                const a = Math.random() * Math.PI * 2;
                const el = Math.random() * Math.PI * 0.5; // вверх-полусфера
                const sp = 6 + Math.random() * 16;
                spawn(IMPACT.x, 0.3, IMPACT.z,
                    Math.cos(a) * Math.cos(el) * sp, Math.sin(el) * sp * 1.2, Math.sin(a) * Math.cos(el) * sp,
                    0.7 + Math.random() * 1.1);
            }
        }

        for (let i = 0; i < COUNT; i++) {
            const p = pool[i];
            if (!p.active) { dummy.scale.setScalar(0); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix); continue; }
            p.age += delta;
            if (p.age >= p.life) { p.active = false; dummy.scale.setScalar(0); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix); continue; }
            p.vel.y -= 22 * delta;      // гравитация
            p.vel.multiplyScalar(0.985);
            p.pos.addScaledVector(p.vel, delta);
            if (p.pos.y < 0.05 && p.vel.y < 0) { p.pos.y = 0.05; p.vel.y *= -0.35; p.vel.x *= 0.6; p.vel.z *= 0.6; } // отскок

            const speed = p.vel.length();
            const k = 1 - p.age / p.life;
            // ориентируем стрик вдоль скорости, длина ~ скорости
            dummy.position.copy(p.pos);
            // ВАЖНО: нельзя нормализовать почти нулевой вектор — normalize()
            // нуля даёт NaN-кватернион => NaN-матрица => гигантский белый
            // треугольник на весь экран. Ниже порога — держим прежнюю ориентацию.
            if (speed > 0.001) {
                dir.copy(p.vel).multiplyScalar(1 / speed);
                dummy.quaternion.setFromUnitVectors(up, dir);
            } else {
                dummy.quaternion.identity();
            }
            dummy.scale.set(0.05 * k + 0.01, Math.min(1.2, speed * 0.06) * k + 0.05, 0.05 * k + 0.01);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
            col.copy(cHot).lerp(cPurple, s.colorShift * 0.6).multiplyScalar(0.6 + k);
            mesh.current.setColorAt(i, col);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} transparent color={FIRE_HOT} />
        </instancedMesh>
    );
}
