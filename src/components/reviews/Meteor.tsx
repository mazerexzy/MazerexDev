import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScene, FLIGHT_DURATION, FIRE, FIRE_HOT, PURPLE } from './sceneState';

import meteorPath from '../../assets/models/meteor.glb?url';

/**
 * Метеорит: падает по детерминированной траектории (getMeteorPos через
 * общий SceneState), крутится по нескольким осям, светится оранжевым в полёте.
 * После удада — застревает в земле, слегка пульсирует, ядро отдаёт фиолетовым.
 */
export default function Meteor() {
    const s = useScene();
    const group = useRef<THREE.Group>(null);
    const spin = useRef<THREE.Group>(null);
    const { scene } = useGLTF(meteorPath);

    // Собственный экземпляр модели + раскалённый эмиссивный материал
    const model = useMemo(() => {
        const root = scene.clone(true);
        const mat = new THREE.MeshStandardMaterial({
            color: '#2b2320',
            roughness: 0.85,
            metalness: 0.15,
            emissive: new THREE.Color(FIRE),
            emissiveIntensity: 2.2,
        });
        root.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh) { m.material = mat; m.castShadow = true; }
        });
        // нормализуем размер модели
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3(); box.getSize(size);
        const k = 2.6 / (Math.max(size.x, size.y, size.z) || 1);
        root.scale.setScalar(k);
        const c = new THREE.Vector3(); box.getCenter(c);
        root.position.set(-c.x * k, -c.y * k, -c.z * k);
        return { root, mat };
    }, [scene]);

    const glowMat = useRef<THREE.MeshBasicMaterial>(null);
    const light = useRef<THREE.PointLight>(null);
    const tmpColor = useMemo(() => new THREE.Color(), []);

    useFrame(() => {
        if (!group.current || !spin.current) return;
        const t = s.elapsed;

        group.current.position.copy(s.meteor);

        // вращение по нескольким осям (в полёте — быстрое, после — почти стоп)
        const spinSpeed = s.impacted ? 0.03 : 1;
        spin.current.rotation.x += 0.05 * spinSpeed;
        spin.current.rotation.y += 0.037 * spinSpeed;
        spin.current.rotation.z += 0.021 * spinSpeed;

        if (!s.impacted) {
            // Полёт: раскал растёт к земле
            const p = Math.min(t / FLIGHT_DURATION, 1);
            model.mat.emissive.set(FIRE);
            model.mat.emissiveIntensity = 2 + p * 3.5;
            if (light.current) { light.current.color.set(FIRE); light.current.intensity = 6 + p * 10; light.current.distance = 22; }
            if (glowMat.current) glowMat.current.opacity = 0.5 + p * 0.35;
            group.current.scale.setScalar(1);
        } else {
            // После удара: застрял, пульсирует, ядро -> фиолетовое
            const since = t - s.impactElapsed;
            const settle = THREE.MathUtils.clamp(since / 1.2, 0, 1);
            // Частично вкапываем, но НЕ ниже земли: центр модели держим выше
            // y=0, иначе метеорит полностью уходит под пол и виден только его
            // ореол — он и читался как «фиолетовый купол».
            group.current.position.y = THREE.MathUtils.lerp(s.meteor.y, 0.55, settle);

            const pulse = 0.5 + 0.5 * Math.sin(since * 2.4);
            // цвет ядра переходит fire -> purple по colorShift
            tmpColor.set(FIRE_HOT).lerp(new THREE.Color(PURPLE), s.colorShift);
            model.mat.emissive.copy(tmpColor);
            // Эмиссия остывает почти до нуля: иначе весь камень светится ровным
            // цветом и с bloom превращается в однородный светящийся «купол»
            // вместо камня с фактурой.
            model.mat.emissiveIntensity = THREE.MathUtils.lerp(3, 0.12 + pulse * 0.18, settle);

            if (light.current) {
                light.current.color.copy(tmpColor);
                light.current.intensity = THREE.MathUtils.lerp(10, 1.2 + pulse * 1.2, settle);
                light.current.distance = 14;
            }
            if (glowMat.current) {
                glowMat.current.color.copy(tmpColor);
                // ореол после удара гасим полностью — он и давал «купол»
                glowMat.current.opacity = THREE.MathUtils.lerp(0.4, 0, settle);
            }
            // лёгкое «дыхание» размера
            group.current.scale.setScalar(1 + pulse * 0.02 * settle);
        }
    });

    return (
        <group ref={group}>
            <group ref={spin}>
                <primitive object={model.root} />
                {/* мягкий ореол — совсем тесный, чтобы не превращаться в «купол» */}
                <mesh scale={1.15}>
                    <sphereGeometry args={[1, 24, 24]} />
                    <meshBasicMaterial ref={glowMat} color={FIRE} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                </mesh>
            </group>
            <pointLight ref={light} color={FIRE} intensity={8} distance={22} />
        </group>
    );
}

useGLTF.preload(meteorPath);
