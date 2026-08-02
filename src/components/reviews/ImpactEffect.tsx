import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, IMPACT } from './sceneState';
import { radialTexture } from './textures';

/**
 * Момент удара: очень яркая вспышка (быстро гаснет) + расширяющееся кольцо
 * пыли/ударной волны по земле. Появляется по s.impacted, дальше сам затухает.
 */
export default function ImpactEffect() {
    const s = useScene();
    const flash = useRef<THREE.Mesh>(null);
    const flashMat = useRef<THREE.MeshBasicMaterial>(null);
    const ring = useRef<THREE.Mesh>(null);
    const ringMat = useRef<THREE.MeshBasicMaterial>(null);
    const flashLight = useRef<THREE.PointLight>(null);

    const flashTex = useMemo(() => radialTexture('rgba(255,255,255,1)', 'rgba(255,230,180,0.7)', 'rgba(255,180,80,0)'), []);
    const ringTex = useMemo(() => radialTexture('rgba(255,255,255,0)', 'rgba(255,200,140,0.55)', 'rgba(255,150,60,0)'), []);

    useFrame(() => {
        // ВАЖНО: время вспышки/кольца — по РЕАЛЬНОМУ времени (realSinceImpact),
        // а не по slow-mo-масштабированному elapsed. Иначе во время замедления
        // вспышка «зависала» надолго и воспринималась как не гаснущий белый экран.
        const since = s.impacted ? s.realSinceImpact : -1;

        // Вспышка: пик мгновенно, гаснет за ~0.35с
        if (flashMat.current && flash.current && flashLight.current) {
            if (since >= 0 && since < 0.35) {
                const k = 1 - since / 0.35;
                flashMat.current.opacity = k * k;
                flash.current.scale.setScalar(5 + (1 - k) * 7);
                flash.current.visible = true;
                flashLight.current.intensity = k * 16;
                flashLight.current.visible = true;
            } else {
                flashMat.current.opacity = 0;
                flash.current.visible = false;
                flashLight.current.intensity = 0;
                flashLight.current.visible = false;
            }
        }

        // Кольцо ударной волны: расходится по земле ~0.9с
        if (ringMat.current && ring.current) {
            if (since >= 0 && since < 0.9) {
                const k = since / 0.9;
                const r = 1 + k * 18;
                ring.current.scale.set(r, r, 1);
                ringMat.current.opacity = (1 - k) * 0.8;
                ring.current.visible = true;
            } else {
                ringMat.current.opacity = 0;
                ring.current.visible = false;
            }
        }
    });

    return (
        <group position={[IMPACT.x, 0, IMPACT.z]}>
            {/* Вспышка (билборд-сфера из радиальной текстуры) */}
            <mesh ref={flash} position={[0, 0.6, 0]} visible={false}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial ref={flashMat} map={flashTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0} />
            </mesh>
            <pointLight ref={flashLight} position={[0, 1.2, 0]} color="#fff2d0" intensity={0} distance={40} visible={false} />

            {/* Кольцо пыли по земле */}
            <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} visible={false}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial ref={ringMat} map={ringTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}
