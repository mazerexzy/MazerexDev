import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene, IMPACT, PURPLE } from './sceneState';

const CRACKS = 9;
const GROW_TIME = 1.5;   // сек на полное распространение трещины
const STAGGER = 0.09;    // сдвиг старта между трещинами

interface Crack {
    angle: number;
    length: number;
    width: number;
    segs: { x: number; z: number }[];
}

/**
 * Трещины по поверхности от места удара.
 *
 * Распространение — настоящее: разлом БЕЖИТ от кратера наружу, а не появляется
 * целиком. Реализовано через атрибут aDist (нормированная длина вдоль трещины)
 * и юниформ uProgress в шейдере: фрагменты дальше фронта отбрасываются, у
 * самого фронта — раскалённая вспышка. Обычным scale такого не получить: он
 * масштабирует всю фигуру разом (и ширину тоже), из-за чего трещина выглядела
 * статичной, просто «наезжающей».
 */
const VERT = /* glsl */`
attribute float aDist;
varying float vDist;
void main() {
    vDist = aDist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */`
uniform vec3 uColor;
uniform vec3 uTipColor;
uniform float uProgress;
uniform float uOpacity;
varying float vDist;

void main() {
    // фронт разлома: всё, что дальше — ещё не «треснуло»
    if (vDist > uProgress) discard;

    // раскалённый кончик у самого фронта
    float tip = smoothstep(0.12, 0.0, uProgress - vDist);
    vec3 col = mix(uColor, uTipColor, tip);

    // к хвосту трещина чуть тускнеет, у фронта — вспышка
    float fade = mix(0.55, 1.0, 1.0 - vDist) + tip * 1.6;

    gl_FragColor = vec4(col * fade, uOpacity * (0.5 + tip * 0.9));
}
`;

export default function CrackSystem() {
    const s = useScene();
    const group = useRef<THREE.Group>(null);
    const mats = useRef<THREE.ShaderMaterial[]>([]);

    const cracks = useMemo<Crack[]>(() => {
        return Array.from({ length: CRACKS }, (_, i) => {
            const angle = (i / CRACKS) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            // Заметно длиннее — трещины уходят далеко от кратера
            const length = 11 + Math.random() * 10;
            const segCount = 9 + Math.floor(Math.random() * 4);
            const segs: { x: number; z: number }[] = [{ x: 0, z: 0 }];
            let x = 0, z = 0;
            for (let sI = 0; sI < segCount; sI++) {
                // Резкий зигзаг: направление знакопеременно рыскает вокруг
                // основной оси, а не накапливает плавный дрейф — так излом
                // выходит острым и агрессивным, а трещина всё равно уходит
                // от центра наружу.
                const zig = sI % 2 === 0 ? 1 : -1;
                const a = angle + zig * (0.55 + Math.random() * 0.5);
                const step = (length / segCount) * (0.75 + Math.random() * 0.6);
                x += Math.cos(a) * step; z += Math.sin(a) * step;
                segs.push({ x, z });
            }
            return { angle, length, width: 0.07 + Math.random() * 0.09, segs };
        });
    }, []);

    // Лента вдоль ломаной + атрибут «сколько пройдено от начала» (0..1)
    const geometries = useMemo(() => cracks.map((c) => {
        const pts: number[] = [];
        const dists: number[] = [];
        const idx: number[] = [];

        // накопленная длина по сегментам — нужна для честного фронта
        const acc: number[] = [0];
        for (let i = 1; i < c.segs.length; i++) {
            const a = c.segs[i - 1], b = c.segs[i];
            acc.push(acc[i - 1] + Math.hypot(b.x - a.x, b.z - a.z));
        }
        const total = acc[acc.length - 1] || 1;

        for (let i = 0; i < c.segs.length; i++) {
            const p = c.segs[i];
            const w = c.width * (1 - i / c.segs.length) + 0.01; // сужается к концу
            const prev = c.segs[Math.max(0, i - 1)];
            const dx = p.x - prev.x, dz = p.z - prev.z;
            const len = Math.hypot(dx, dz) || 1;
            const nx = -dz / len, nz = dx / len;

            pts.push(p.x + nx * w, 0, p.z + nz * w);
            pts.push(p.x - nx * w, 0, p.z - nz * w);
            const d = acc[i] / total;
            dists.push(d, d);

            if (i > 0) {
                const b = (i - 1) * 2;
                idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
            }
        }

        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        g.setAttribute('aDist', new THREE.Float32BufferAttribute(dists, 1));
        g.setIndex(idx);
        return g;
    }), [cracks]);

    const materials = useMemo(() => cracks.map(() => new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
            uColor: { value: new THREE.Color(PURPLE) },
            uTipColor: { value: new THREE.Color('#ffd9a0') },
            uProgress: { value: 0 },
            uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
    })), [cracks]);

    useFrame(() => {
        if (!s.impacted) { if (group.current) group.current.visible = false; return; }
        if (group.current) group.current.visible = true;

        const since = s.elapsed - s.impactElapsed;
        const pulse = 0.6 + 0.4 * Math.sin(since * 2.2);

        for (let i = 0; i < materials.length; i++) {
            const mat = materials[i];
            // каждая трещина стартует с небольшим сдвигом — разлом идёт «очередью»
            const local = since - i * STAGGER;
            const grow = THREE.MathUtils.clamp(local / GROW_TIME, 0, 1);
            // ease-out: рывок в начале (удар), плавное замирание к концу
            const eased = 1 - Math.pow(1 - grow, 2.6);

            mat.uniforms.uProgress.value = eased;
            mat.uniforms.uOpacity.value = (grow > 0 ? 1 : 0) * (0.55 + pulse * 0.45) * s.colorShift;
        }
    });

    return (
        <group ref={group} position={[IMPACT.x, 0.04, IMPACT.z]} visible={false}>
            {geometries.map((g, i) => (
                <mesh
                    key={i}
                    geometry={g}
                    material={materials[i]}
                    ref={() => { mats.current[i] = materials[i]; }}
                />
            ))}
        </group>
    );
}
