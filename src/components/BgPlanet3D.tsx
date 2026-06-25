import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import Sky from '../assets/about_sky.png';
import useSound from 'use-sound';
import quakeSound from '../assets/sounds/quake.mp3';

// --- КОМПОНЕНТ 1: РЕТРО ЛЭПТОП ---
function RetroLaptop({ scrollProgress, isMobile }: { scrollProgress: number, isMobile: boolean }) {
    const laptopRef = useRef<THREE.Group>(null);
    const lidRef = useRef<THREE.Group>(null);
    const smoothProgress = useRef(0);

    useFrame((state) => {
        if (!laptopRef.current || !lidRef.current) return;
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);

        const sp1 = Math.min(smoothProgress.current, 1);
        const sp2 = Math.max(0, smoothProgress.current - 1);

        const baseScale = isMobile ? 1.4 : 1.5;
        const targetScale = (sp1 * baseScale) - (sp2 * baseScale);
        laptopRef.current.scale.set(targetScale, targetScale, targetScale);

        const targetX = isMobile ? 2 : 2;
        const targetY = isMobile ? -1.0 : -1.2;

        laptopRef.current.position.y = THREE.MathUtils.lerp(-12, targetY, sp1) - (sp2 * 10);
        laptopRef.current.position.x = THREE.MathUtils.lerp(-15, targetX, sp1);

        laptopRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.8) * 0.08;
        laptopRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.5) * 0.02;

        laptopRef.current.rotation.y = THREE.MathUtils.lerp(-Math.PI / 4, 0, sp1);
        laptopRef.current.rotation.x = THREE.MathUtils.lerp(0.5, 0.15, sp1);

        lidRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, 0, sp1);
    });

    return (
        <group ref={laptopRef} position={[0, -5, -2]} scale={[0, 0, 0]}>
            <mesh position={[0, 0, 0]}><boxGeometry args={[4.0, 0.2, 3.0]} /><meshBasicMaterial color="#9370DB" wireframe /></mesh>
            <mesh position={[0, 0.1, 0.2]}><boxGeometry args={[3.6, 0.05, 1.8]} /><meshBasicMaterial color="#4B0082" wireframe /></mesh>
            <group position={[-1.6, 0.15, -0.6]}>
                {Array.from({ length: 5 }).map((_, row) =>
                    Array.from({ length: 14 }).map((_, col) => (
                        <mesh key={`${row}-${col}`} position={[col * 0.24, 0, row * 0.25]}><boxGeometry args={[0.2, 0.02, 0.2]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
                    ))
                )}
            </group>
            <mesh position={[0, 0.11, 1.25]}><boxGeometry args={[1.0, 0.02, 0.5]} /><meshBasicMaterial color="#FF0080" wireframe /></mesh>
            <mesh position={[0, 0.1, -1.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 4.0, 16]} /><meshBasicMaterial color="#9370DB" wireframe /></mesh>
            <group ref={lidRef} position={[0, 0.1, -1.4]}>
                <mesh position={[0, 1.3, 0]}><boxGeometry args={[4.0, 2.6, 0.1]} /><meshBasicMaterial color="#9370DB" wireframe /></mesh>
                <mesh position={[0, 1.3, 0.06]}><planeGeometry args={[3.8, 2.4]} /><meshBasicMaterial color="#00FFFF" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
                <group position={[-1.7, 2.2, 0.07]}>
                    {Array.from({ length: 7 }).map((_, i) => {
                        const w = Math.random() * 2 + 0.5;
                        return (<mesh key={i} position={[w / 2, -i * 0.3, 0]}><planeGeometry args={[w, 0.06]} /><meshBasicMaterial color="#FF0080" transparent opacity={0.7} /></mesh>);
                    })}
                </group>
            </group>
        </group>
    );
}

// --- КОМПОНЕНТ 2: СМАРТФОН ДЛЯ DEVOPS ---
function RetroPhone({ scrollProgress, isMobile }: { scrollProgress: number, isMobile: boolean }) {
    const phoneRef = useRef<THREE.Group>(null);
    const smoothProgress = useRef(0);

    const roundedRectShape = useMemo(() => {
        const shape = new THREE.Shape();
        const w = 2.4; const h = 4.8; const r = 0.3; const x = -w / 2; const y = -h / 2;
        shape.moveTo(x, y + r); shape.lineTo(x, y + h - r); shape.quadraticCurveTo(x, y + h, x + r, y + h);
        shape.lineTo(x + w - r, y + h); shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
        shape.lineTo(x + w, y + r); shape.quadraticCurveTo(x + w, y, x + w - r, y);
        shape.lineTo(x + r, y); shape.quadraticCurveTo(x, y, x, y + r);
        return shape;
    }, []);

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };

    useFrame((state) => {
        if (!phoneRef.current) return;
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);
        const sp2 = Math.max(0, Math.min(smoothProgress.current - 1, 1));
        const sp3 = Math.max(0, smoothProgress.current - 2);

        const baseScale = isMobile ? 1.5 : 1.70;
        const targetScale = (sp2 * baseScale) - (sp3 * baseScale);
        phoneRef.current.scale.set(targetScale, targetScale, targetScale);

        const targetX = isMobile ? 0 : -5;
        const targetY = isMobile ? -1.0 : 0;

        phoneRef.current.position.y = THREE.MathUtils.lerp(-15, targetY, sp2) - (sp3 * 10);
        phoneRef.current.position.x = THREE.MathUtils.lerp(5.5, targetX, sp2);
        phoneRef.current.position.z = THREE.MathUtils.lerp(0, 0, sp2);

        phoneRef.current.rotation.y = 0.65 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
        phoneRef.current.rotation.x = -0.15;
        phoneRef.current.rotation.z = 0.08 + Math.cos(state.clock.elapsedTime * 1.2) * 0.02;
        phoneRef.current.position.y += Math.sin(state.clock.elapsedTime * 2.5) * 0.05;
    });

    return (
        <group ref={phoneRef} position={[0, 0, 0]} scale={[0, 0, 0]}>
            <mesh position={[0, 0, -0.1]}><extrudeGeometry args={[roundedRectShape, extrudeSettings]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
            <mesh position={[0, 0, 0.12]}><planeGeometry args={[2.2, 4.6]} /><meshBasicMaterial color="#110022" transparent opacity={0.85} /></mesh>
            <group position={[0.6, 1.8, -0.15]}>
                <mesh position={[0, 0, -0.05]}><boxGeometry args={[0.7, 0.8, 0.1]} /><meshBasicMaterial color="#8A2BE2" wireframe /></mesh>
                <mesh position={[-0.15, 0.2, -0.05]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
                <mesh position={[0.15, -0.2, -0.05]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
            </group>
            <group position={[0, 0, 0.13]}>
                <mesh><ringGeometry args={[0.3, 0.35, 32]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh><circleGeometry args={[0.15, 32]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[-0.6, 1.2, 0]}><ringGeometry args={[0.25, 0.3, 32]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[-0.45, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}><planeGeometry args={[0.03, 0.8]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[-0.6, 0.95, 0]}><planeGeometry args={[0.03, 0.2]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[0.7, 1.4, 0]}><ringGeometry args={[0.25, 0.3, 32]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[0.35, 0.7, 0]} rotation={[0, 0, Math.PI / 3.5]}><planeGeometry args={[0.03, 1.2]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[-0.7, -1.4, 0]}><ringGeometry args={[0.25, 0.3, 32]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[-0.35, -0.7, 0]} rotation={[0, 0, Math.PI / 3.5]}><planeGeometry args={[0.03, 1.2]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[0.6, -1.0, 0]}><ringGeometry args={[0.25, 0.3, 32]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[0.3, -0.5, 0]} rotation={[0, 0, -Math.PI / 4]}><planeGeometry args={[0.03, 0.8]} /><meshBasicMaterial color="#FF1493" /></mesh>
                <mesh position={[0.6, -0.8, 0]}><planeGeometry args={[0.03, 0.2]} /><meshBasicMaterial color="#FF1493" /></mesh>
            </group>
        </group>
    );
}

// --- КОМПОНЕНТ 3: КИБЕР-БОТ ---
function RetroBot({ scrollProgress, isMobile }: { scrollProgress: number, isMobile: boolean }) {
    const botRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const smoothProgress = useRef(0);

    useFrame((state) => {
        if (!botRef.current) return;
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);
        const sp3 = Math.max(0, Math.min(smoothProgress.current - 2, 1));
        const sp4 = Math.max(0, smoothProgress.current - 3);

        const baseScale = isMobile ? 1.4 : 1.5;
        const targetScale = (sp3 * baseScale) - (sp4 * baseScale);
        botRef.current.scale.set(targetScale, targetScale, targetScale);

        const targetX = isMobile ? 0 : 4;
        const targetY = isMobile ? -1.0 : 0.5;

        botRef.current.position.y = THREE.MathUtils.lerp(12, targetY, sp3) + (sp4 * 10);
        botRef.current.position.x = THREE.MathUtils.lerp(12, targetX, sp3);
        botRef.current.position.z = THREE.MathUtils.lerp(-5, 1, sp3);

        botRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.05;
        botRef.current.rotation.y = -0.3 + Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
        botRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.8) * 0.05;

        if (ring1Ref.current && ring2Ref.current) {
            ring1Ref.current.rotation.x = 1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            ring1Ref.current.rotation.z = state.clock.elapsedTime * 1.5;
            ring2Ref.current.rotation.y = 1.5 + Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
            ring2Ref.current.rotation.x = state.clock.elapsedTime * -1.2;
        }
    });

    return (
        <group ref={botRef} scale={[0, 0, 0]}>
            <mesh><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
            <group position={[0, 0, 0.9]}>
                <mesh><circleGeometry args={[0.45, 32]} /><meshBasicMaterial color="#110022" /></mesh>
                <mesh position={[0, 0, 0.01]}><circleGeometry args={[0.3, 32]} /><meshBasicMaterial color="#FF1493" transparent opacity={0.8} /></mesh>
                <mesh position={[0, 0, 0.02]}><circleGeometry args={[0.1, 16]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
            </group>
            <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.2, 0.4, 0.5, 8]} /><meshBasicMaterial color="#8A2BE2" wireframe /></mesh>
            <mesh position={[1.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.2, 0.4, 0.5, 8]} /><meshBasicMaterial color="#8A2BE2" wireframe /></mesh>
            <mesh position={[0, 1.1, 0]}><coneGeometry args={[0.4, 0.6, 4]} /><meshBasicMaterial color="#FF00FF" wireframe /></mesh>
            <mesh ref={ring1Ref}><torusGeometry args={[1.6, 0.02, 16, 64]} /><meshBasicMaterial color="#FF00FF" wireframe /></mesh>
            <mesh ref={ring2Ref}><torusGeometry args={[1.9, 0.01, 16, 64]} /><meshBasicMaterial color="#00FFFF" transparent opacity={0.5} /></mesh>
        </group>
    );
}

// --- КОМПОНЕНТ 4: КИБЕР-ЩИТ С РАСЩЕПЛЕНИЕМ НА МОЛЕКУЛЫ ---
function CyberShield({ scrollProgress, isMobile }: { scrollProgress: number, isMobile: boolean }) {
    const shieldRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Group>(null);
    const outerRingRef = useRef<THREE.Group>(null);
    const moleculesRef = useRef<THREE.Points>(null);
    const smoothProgress = useRef(0);
    const [hovered, setHovered] = useState(false);
    const hoverAnim = useRef(0);

    const particlesGeom = useMemo(() => new THREE.IcosahedronGeometry(1.6, 3), []);

    useFrame((state) => {
        if (!shieldRef.current) return;
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);

        const sp4 = Math.max(0, Math.min(smoothProgress.current - 3, 1));
        const sp5 = Math.max(0, smoothProgress.current - 4);

        const baseScale = isMobile ? 1.4 : 1.5;
        const targetScale = (sp4 * baseScale) - (sp5 * baseScale);
        shieldRef.current.scale.set(targetScale, targetScale, targetScale);

        const targetX = isMobile ? 0 : 4;
        const targetY = isMobile ? -1.0 : -2.5;

        shieldRef.current.position.y = THREE.MathUtils.lerp(-15, targetY, sp4) + (sp5 * 20);
        shieldRef.current.position.x = THREE.MathUtils.lerp(10, targetX, sp4);
        shieldRef.current.position.z = THREE.MathUtils.lerp(0, 0, sp4);

        shieldRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        shieldRef.current.rotation.y = state.clock.elapsedTime * 0.2;

        hoverAnim.current = THREE.MathUtils.lerp(hoverAnim.current, hovered ? 1 : 0, 0.08);

        if (coreRef.current) {
            coreRef.current.rotation.x = state.clock.elapsedTime * (1.5 + hoverAnim.current * 3);
            coreRef.current.rotation.y = state.clock.elapsedTime * (1.8 + hoverAnim.current * 3);
        }

        if (outerRingRef.current) {
            outerRingRef.current.rotation.x = Math.PI / 2 + hoverAnim.current * 0.5;
            outerRingRef.current.rotation.z = state.clock.elapsedTime * -(3 + hoverAnim.current * 4);
        }

        if (moleculesRef.current) {
            const molScale = 1 + hoverAnim.current * 0.6;
            moleculesRef.current.scale.set(molScale, molScale, molScale);
            moleculesRef.current.rotation.y = state.clock.elapsedTime * 0.5 * (1 + hoverAnim.current);
            const mat = moleculesRef.current.material as THREE.PointsMaterial;
            mat.size = 0.03 + hoverAnim.current * 0.03;
        }
    });

    return (
        <group ref={shieldRef} scale={[0, 0, 0]}>
            <mesh onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }} visible={false}><sphereGeometry args={[2.5, 16, 16]} /><meshBasicMaterial /></mesh>
            <group ref={coreRef}>
                <mesh><octahedronGeometry args={[0.7, 0]} /><meshBasicMaterial color="#FF1493" wireframe /></mesh>
                <mesh><icosahedronGeometry args={[0.4, 1]} /><meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.6} /></mesh>
                <mesh><sphereGeometry args={[0.2, 16, 16]} /><meshBasicMaterial color="#FF00FF" /></mesh>
            </group>
            <points ref={moleculesRef} geometry={particlesGeom}><pointsMaterial color="#00FFFF" size={0.03} transparent opacity={0.7} sizeAttenuation={true} /></points>
            <mesh><icosahedronGeometry args={[1.5, 2]} /><meshBasicMaterial color="#00FFFF" wireframe transparent opacity={0.2} /></mesh>
            <mesh><icosahedronGeometry args={[1.4, 1]} /><meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.1} /></mesh>
            <group ref={outerRingRef}>
                <mesh><torusGeometry args={[2.2, 0.02, 16, 100]} /><meshBasicMaterial color="#8A2BE2" wireframe /></mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.1, 0.01, 16, 100]} /><meshBasicMaterial color="#FF1493" transparent opacity={0.6} /></mesh>
            </group>
            <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[0, 0.1, 0.8, 4]} /><meshBasicMaterial color="#FF00FF" wireframe /></mesh>
            <mesh position={[0, -2.2, 0]} rotation={[Math.PI, 0, 0]}><cylinderGeometry args={[0, 0.1, 0.8, 4]} /><meshBasicMaterial color="#FF00FF" wireframe /></mesh>
        </group>
    );
}

// --- КОМПОНЕНТ 5: ИЗМЕРЕНИЕ ЛАЗЕРОВ ---
function DimensionWarp({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const smoothProgress = useRef(0);

    const lines = useMemo(() => new Array(200).fill(0).map(() => ({
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 100 - 50,
        length: Math.random() * 20 + 5,
        speed: Math.random() * 4 + 2
    })), []);

    useFrame(() => {
        if (!groupRef.current) return;
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);
        const sp5 = Math.max(0, smoothProgress.current - 4);

        groupRef.current.visible = sp5 > 0.05;
        const targetOpacity = Math.min(sp5, 1);

        groupRef.current.children.forEach((line: any, i) => {
            line.position.z += lines[i].speed;
            if (line.material) line.material.opacity = targetOpacity * 0.7;
            if (line.position.z > 0) {
                line.position.z = -120;
            }
        });
    });

    return (
        <group ref={groupRef} visible={false}>
            {lines.map((l, i) => (
                <mesh key={i} position={[l.x, l.y, l.z]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, l.length, 4]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#FF00FF" : "#00FFFF"} transparent opacity={0} />
                </mesh>
            ))}
        </group>
    );
}

// --- КОМПОНЕНТ 6: КИБЕР-ГОДЗИЛЛА ---
function CyberGodzilla({ scrollProgress, isMobile }: { scrollProgress: number, isMobile: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const torsoRef = useRef<THREE.Group>(null);
    const jawRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const fireRef = useRef<THREE.Group>(null);
    const laserGroupRef = useRef<THREE.Group>(null);

    const smoothProgress = useRef(0);
    const smoothFire = useRef(0);
    const smoothLaser = useRef(0);

    const tailSegments = useMemo(() => new Array(8).fill(0), []);

    useFrame((state) => {
        if (!groupRef.current) return;
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);

        const sp5 = Math.max(0, smoothProgress.current - 4);
        const baseScale = isMobile ? 1.2 : 1.3;
        const targetScale = Math.min(sp5, 1) * baseScale;
        groupRef.current.scale.set(targetScale, targetScale, targetScale);

        const t = state.clock.elapsedTime;

        const targetZ = isMobile ? -60 : -55;
        groupRef.current.position.z = THREE.MathUtils.lerp(-120, targetZ, sp5);
        groupRef.current.position.x = 0;
        groupRef.current.rotation.y = 0;

        const cycle = t % 16;
        const isFire = cycle > 5 && cycle < 8.5;
        const isLaser = cycle > 11 && cycle < 14.5;

        smoothFire.current = THREE.MathUtils.lerp(smoothFire.current, isFire ? 1 : 0, 0.05);
        smoothLaser.current = THREE.MathUtils.lerp(smoothLaser.current, isLaser ? 1 : 0, 0.08);

        const walkSpeed = 3.5;

        if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.6;
            rightLegRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.6;

            groupRef.current.position.y = -10 + Math.abs(Math.sin(t * walkSpeed)) * 0.8;
            groupRef.current.rotation.z = Math.sin(t * 1.75) * 0.05;
        }

        if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.4 + 0.2;
            rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.4 + 0.2;
        }

        if (torsoRef.current) {
            const targetLean = (smoothLaser.current * 0.75) - (smoothFire.current * 0.3) + 0.1;
            torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, targetLean, 0.1);
        }

        if (headRef.current && jawRef.current) {
            const targetHeadTilt = (smoothLaser.current * 0.2) - (smoothFire.current * 0.5);
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadTilt, 0.1);

            const targetJaw = (smoothFire.current * 0.8) + (smoothLaser.current * 0.15) + 0.05;
            jawRef.current.rotation.x = THREE.MathUtils.lerp(jawRef.current.rotation.x, targetJaw, 0.15);
        }

        if (fireRef.current) {
            fireRef.current.visible = smoothFire.current > 0.05;
            const fireScale = 1 + (smoothFire.current * 2.5);
            fireRef.current.scale.set(fireScale, fireScale, fireScale * 2);
            fireRef.current.children.forEach((mesh: any) => {
                mesh.rotation.z += 0.3;
                if (mesh.material) mesh.material.opacity = (0.3 + Math.random() * 0.5) * smoothFire.current;
            });
        }

        if (laserGroupRef.current) {
            laserGroupRef.current.visible = smoothLaser.current > 0.01;
            laserGroupRef.current.scale.z = smoothLaser.current;
            laserGroupRef.current.children.forEach((eyeGroup: any) => {
                eyeGroup.children.forEach((mesh: any) => {
                    if (mesh.material && mesh.material.transparent) {
                        mesh.material.opacity = (0.6 + Math.sin(t * 30) * 0.4) * smoothLaser.current;
                    }
                });
            });
        }
    });

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.4} color="#ffffff" />
            <directionalLight position={[10, 20, 10]} intensity={1.5} color="#8A2BE2" />
            <pointLight position={[-10, 5, -20]} intensity={3} color="#00FFFF" />

            <group ref={torsoRef} position={[0, 6, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[3, 5, 32, 32]} /><meshStandardMaterial color="#0a0510" roughness={0.7} metalness={0.5} /></mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[3.1, 5.2, 16, 16]} /><meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.3} /></mesh>

                {Array.from({ length: 5 }).map((_, i) => (
                    <mesh key={i} position={[0, 4 - i * 1.2, -1 - i * 1.5]} rotation={[0.5, 0, 0]}>
                        <coneGeometry args={[1 - i * 0.1, 3, 4]} />
                        <meshBasicMaterial color="#00FFFF" wireframe />
                    </mesh>
                ))}

                <group position={[0, -2, -4]} rotation={[-0.4, 0, 0]}>
                    {tailSegments.map((_, i) => (
                        <group key={i} position={[0, 0, -i * 1.8]}>
                            <mesh rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[2 - i * 0.2, 1.8 - i * 0.2, 2, 16]} />
                                <meshStandardMaterial color="#0a0510" />
                            </mesh>
                            <mesh position={[0, 1.5 - i * 0.1, 0]}><coneGeometry args={[0.5, 1.5, 4]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
                        </group>
                    ))}
                </group>

                <group ref={leftArmRef} position={[-3.5, 2, 2]}>
                    <mesh rotation={[0, 0, 0.3]}><capsuleGeometry args={[0.8, 2.5, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                    <group position={[-0.5, -2, 0.5]} rotation={[-0.5, 0, 0]}>
                        <mesh><capsuleGeometry args={[0.6, 2, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                        <mesh position={[0, -1.5, 0.2]} rotation={[0.3, 0, 0]}><coneGeometry args={[0.15, 1, 4]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                        <mesh position={[-0.3, -1.5, 0.1]} rotation={[0.3, 0, 0.2]}><coneGeometry args={[0.15, 1, 4]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                        <mesh position={[0.3, -1.5, 0.1]} rotation={[0.3, 0, -0.2]}><coneGeometry args={[0.15, 1, 4]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                    </group>
                </group>

                <group ref={rightArmRef} position={[3.5, 2, 2]}>
                    <mesh rotation={[0, 0, -0.3]}><capsuleGeometry args={[0.8, 2.5, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                    <group position={[0.5, -2, 0.5]} rotation={[-0.5, 0, 0]}>
                        <mesh><capsuleGeometry args={[0.6, 2, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                        <mesh position={[0, -1.5, 0.2]} rotation={[0.3, 0, 0]}><coneGeometry args={[0.15, 1, 4]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                        <mesh position={[-0.3, -1.5, 0.1]} rotation={[0.3, 0, 0.2]}><coneGeometry args={[0.15, 1, 4]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                        <mesh position={[0.3, -1.5, 0.1]} rotation={[0.3, 0, -0.2]}><coneGeometry args={[0.15, 1, 4]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                    </group>
                </group>

                <group ref={headRef} position={[0, 4, 3]}>
                    <mesh position={[0, 1.5, 1]}><boxGeometry args={[2.8, 2.5, 4]} /><meshStandardMaterial color="#0a0510" /></mesh>
                    <mesh position={[0, 1.5, 1]}><boxGeometry args={[3.0, 2.7, 4.2]} /><meshBasicMaterial color="#00FFFF" wireframe transparent opacity={0.3} /></mesh>

                    <group position={[0, 0.35, 2.8]}>
                        {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((x, i) => (
                            <mesh key={`up-tooth-${i}`} position={[x, 0, 0]} rotation={[Math.PI, 0, 0]}>
                                <coneGeometry args={[0.2, 0.9, 4]} />
                                <meshStandardMaterial color="#e0e0e0" roughness={0.1} metalness={0.8} />
                            </mesh>
                        ))}
                    </group>

                    <mesh position={[-1.2, 2.0, 3.1]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.7, 0.15, 0.1]} /><meshBasicMaterial color="#FF0000" /></mesh>
                    <mesh position={[1.2, 2.0, 3.1]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.7, 0.15, 0.1]} /><meshBasicMaterial color="#FF0000" /></mesh>

                    <group ref={laserGroupRef} visible={false}>
                        <group position={[-1.3, 1.8, 3.1]}>
                            <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 100, 8]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
                            <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 1.2, 100, 16]} /><meshBasicMaterial color="#FF0000" transparent opacity={0.6} depthWrite={false} /></mesh>
                        </group>
                        <group position={[1.3, 1.8, 3.1]}>
                            <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 100, 8]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
                            <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 1.2, 100, 16]} /><meshBasicMaterial color="#FF0000" transparent opacity={0.6} depthWrite={false} /></mesh>
                        </group>
                    </group>

                    <group ref={jawRef} position={[0, 0.2, -0.5]}>
                        <mesh position={[0, 0, 2.5]}><boxGeometry args={[2.5, 1, 4]} /><meshStandardMaterial color="#0a0510" /></mesh>

                        <group position={[0, 0.55, 3.8]}>
                            {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
                                <mesh key={`low-tooth-${i}`} position={[x, 0, 0]}>
                                    <coneGeometry args={[0.2, 0.85, 4]} />
                                    <meshStandardMaterial color="#e0e0e0" roughness={0.1} metalness={0.8} />
                                </mesh>
                            ))}
                        </group>

                        <group ref={fireRef} position={[0, 0, 4.5]} visible={false}>
                            <mesh position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[1.5, 6, 16]} /><meshBasicMaterial color="#FF0000" transparent opacity={0.8} /></mesh>
                            <mesh position={[0, 0, 4]}><icosahedronGeometry args={[2, 1]} /><meshBasicMaterial color="#FF8C00" transparent opacity={0.6} wireframe /></mesh>
                            <mesh position={[0, 0, 6]}><sphereGeometry args={[2.5, 16, 16]} /><meshBasicMaterial color="#FFFF00" transparent opacity={0.4} wireframe /></mesh>
                        </group>
                    </group>
                </group>
            </group>

            <group ref={leftLegRef} position={[-3, 3, 0]}>
                <mesh><capsuleGeometry args={[1.5, 3, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                <mesh><capsuleGeometry args={[1.6, 3.1, 8, 8]} /><meshBasicMaterial color="#FF1493" wireframe transparent opacity={0.3} /></mesh>
                <group position={[0, -2.5, 1]} rotation={[-0.2, 0, 0]}>
                    <mesh><capsuleGeometry args={[1, 3, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                    <mesh position={[0, -2, 0.5]}><boxGeometry args={[1.8, 1, 3]} /><meshStandardMaterial color="#0a0510" /></mesh>
                </group>
            </group>

            <group ref={rightLegRef} position={[3, 3, 0]}>
                <mesh><capsuleGeometry args={[1.5, 3, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                <mesh><capsuleGeometry args={[1.6, 3.1, 8, 8]} /><meshBasicMaterial color="#FF1493" wireframe transparent opacity={0.3} /></mesh>
                <group position={[0, -2.5, 1]} rotation={[-0.2, 0, 0]}>
                    <mesh><capsuleGeometry args={[1, 3, 16, 16]} /><meshStandardMaterial color="#0a0510" /></mesh>
                    <mesh position={[0, -2, 0.5]}><boxGeometry args={[1.8, 1, 3]} /><meshStandardMaterial color="#0a0510" /></mesh>
                </group>
            </group>
        </group>
    );
}

// --- КОМПОНЕНТ 7: ВОЛНОВАЯ СЕТКА ---
function WaveGrid() {
    const geomRef = useRef<THREE.PlaneGeometry>(null);

    useFrame((state) => {
        if (!geomRef.current) return;
        const time = state.clock.getElapsedTime();
        const positions = geomRef.current.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = Math.sin(x * 0.15 + time * 0.8) * Math.cos(y * 0.15 + time * 0.8) * 2.5;
        }
        geomRef.current.attributes.position.needsUpdate = true;
    });

    return (
        <mesh position={[0, 0, -20]}>
            <planeGeometry ref={geomRef} args={[150, 100, 80, 60]} />
            <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.2} />
        </mesh>
    );
}

// --- КОМПОНЕНТ 8: ПЛАНЕТА И КАМЕРА ---
function SaturnScene({ onImpact, scrollProgress, globalMouse, isMobile }: { onImpact?: () => void, scrollProgress: number, globalMouse: React.MutableRefObject<{ x: number, y: number }>, isMobile: boolean }) {
    const [playQuake, { sound: quakeSoundInstance }] = useSound(quakeSound, { volume: 1.0 });

    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const [showWave, setShowWave] = useState(false);
    const waveGroupRef = useRef<THREE.Group>(null);
    const firedRef = useRef(false);
    const mouseRef = useRef(new THREE.Vector2(0, 0));
    const smoothScroll = useRef(0);

    const PLANET_POS = new THREE.Vector3(5.5, 0, 0);
    const FLY_END = 4.5;
    const IMPACT_TIME = 4.8;

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        smoothScroll.current = THREE.MathUtils.lerp(smoothScroll.current, scrollProgress, 0.04);

        const sp1_clamped = Math.min(Math.max(smoothScroll.current, 0), 1);
        const sp2_clamped = Math.min(Math.max(smoothScroll.current - 1, 0), 1);
        const sp3_clamped = Math.min(Math.max(smoothScroll.current - 2, 0), 1);
        const sp4_clamped = Math.min(Math.max(smoothScroll.current - 3, 0), 1);
        const sp5_clamped = Math.min(Math.max(smoothScroll.current - 4, 0), 1);

        const transition = THREE.MathUtils.smoothstep(t, 0, FLY_END);
        const angle = t * 0.3 + (transition * t * 0.8);
        const ringX = PLANET_POS.x + Math.sin(angle) * 4.5;
        const ringZ = PLANET_POS.z + Math.cos(angle) * 4.5;
        const ringY = 0.5 + Math.sin(t * 2) * 0.02;

        const lookAheadX = PLANET_POS.x + Math.sin(angle + 0.4) * 4.5;
        const lookAheadZ = PLANET_POS.z + Math.cos(angle + 0.4) * 4.5;

        let finalCamX = THREE.MathUtils.lerp(ringX, 2, transition);
        let finalCamY = THREE.MathUtils.lerp(ringY, 0, transition);
        let finalCamZ = THREE.MathUtils.lerp(ringZ, 3, transition);

        let finalLookX = THREE.MathUtils.lerp(lookAheadX, PLANET_POS.x, transition);
        let finalLookY = 0;
        let finalLookZ = THREE.MathUtils.lerp(lookAheadZ, PLANET_POS.z, transition);

        if (sp1_clamped > 0) finalCamZ += sp1_clamped * 3.0;

        if (sp2_clamped > 0) {
            const zoomOut = Math.sin(sp2_clamped * Math.PI) * 4.0;
            finalCamX = THREE.MathUtils.lerp(finalCamX, -1.5, sp2_clamped);
            finalCamZ = THREE.MathUtils.lerp(finalCamZ, 8, sp2_clamped) + zoomOut;
            finalLookX = THREE.MathUtils.lerp(finalLookX, -5, sp2_clamped);
        }

        if (sp3_clamped > 0) {
            const zoomOut2 = Math.sin(sp3_clamped * Math.PI) * 3.0;
            finalCamX = THREE.MathUtils.lerp(finalCamX, 2, sp3_clamped);
            finalCamZ = THREE.MathUtils.lerp(finalCamZ, 7, sp3_clamped) + zoomOut2;
            finalLookX = THREE.MathUtils.lerp(finalLookX, 0.5, sp3_clamped);
        }

        if (sp4_clamped > 0) {
            finalCamX = THREE.MathUtils.lerp(finalCamX, 2, sp4_clamped);
            finalCamY = THREE.MathUtils.lerp(finalCamY, -3, sp4_clamped);
            finalCamZ = THREE.MathUtils.lerp(finalCamZ, 6, sp4_clamped);
            finalLookX = THREE.MathUtils.lerp(finalLookX, 2, sp4_clamped);
            finalLookY = THREE.MathUtils.lerp(finalLookY, -2, sp4_clamped);
        }

        if (sp5_clamped > 0) {
            finalCamX = THREE.MathUtils.lerp(finalCamX, 15, sp5_clamped);
            finalCamY = THREE.MathUtils.lerp(finalCamY, -5, sp5_clamped);

            let baseCamZ = THREE.MathUtils.lerp(finalCamZ, -23, sp5_clamped);

            const camCycle = t % 8;
            let currentZoom = 0;
            if (camCycle < 5) {
                currentZoom = THREE.MathUtils.smoothstep(camCycle / 5, 0, 1) * 10;
            } else {
                currentZoom = THREE.MathUtils.smoothstep(1 - (camCycle - 5) / 3, 0, 1) * 10;
            }

            finalCamZ = baseCamZ - (currentZoom * sp5_clamped);

            finalLookX = THREE.MathUtils.lerp(finalLookX, 0, sp5_clamped);
            finalLookY = THREE.MathUtils.lerp(finalLookY, -5, sp5_clamped);
            finalLookZ = THREE.MathUtils.lerp(finalLookZ, -100, sp5_clamped);

            const quake = Math.max(0, Math.sin(t * 3.5)) * 0.1 * sp5_clamped;
            finalCamY += (Math.random() - 0.5) * quake;
            finalCamX += (Math.random() - 0.5) * quake;
        }

        if (t > IMPACT_TIME) {
            const cycle = (t - IMPACT_TIME) % 24;
            let targetX = 7.5; let targetZ = 1.0;
            if (scrollProgress === 0) {
                if (cycle <= 3) { targetX = 7.5; targetZ = 1.0; }
                else if (cycle > 3 && cycle <= 6) { const ease = THREE.MathUtils.smoothstep((cycle - 3) / 3, 0, 1); targetX = 7.5 - (1.5 * ease); targetZ = 1.0 + (1.3 * ease); }
                else if (cycle > 6 && cycle <= 11) { targetX = 6.0; targetZ = 2.3; }
                else if (cycle > 11 && cycle <= 14) { const ease = THREE.MathUtils.smoothstep((cycle - 11) / 3, 0, 1); targetX = 6.0 + (3.5 * ease); targetZ = 2.3 - (2.3 * ease); }
                else if (cycle > 14 && cycle <= 21) { targetX = 9.5; targetZ = 0.0; }
                else if (cycle > 21 && cycle <= 24) { const ease = THREE.MathUtils.smoothstep((cycle - 21) / 3, 0, 1); targetX = 9.5 - (2.0 * ease); targetZ = 0.0 + (1.0 * ease); }
            }
            targetX += sp1_clamped * 30.0; targetZ -= sp1_clamped * 10.0;

            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.04);
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.04);

            if (t < IMPACT_TIME + 0.4) {
                const intensity = (IMPACT_TIME + 0.4 - t) * 0.6;
                finalCamX += (Math.random() - 0.5) * intensity; finalCamY += (Math.random() - 0.5) * intensity;
            }

            if (!firedRef.current) {
                firedRef.current = true;
                setShowWave(true);

                playQuake();

                setTimeout(() => {
                    if (quakeSoundInstance) {
                        quakeSoundInstance.fade(1.0, 0.0, 2000);
                    }
                }, 1000);

                    if (onImpact) onImpact();
                }
            }

        if (t > FLY_END) {
            mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, globalMouse.current.x * 1, 0.02);
            mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, globalMouse.current.y * 1, 0.02);
            finalCamX += mouseRef.current.x; finalCamY += mouseRef.current.y;
        }

        if (isMobile) {
            finalCamZ += 6;
        }

        camera.position.set(finalCamX, finalCamY, finalCamZ);
        camera.lookAt(finalLookX, finalLookY, finalLookZ);
        groupRef.current.rotation.y += 0.002;

        if (showWave && waveGroupRef.current) {
            waveGroupRef.current.scale.x += 0.4; waveGroupRef.current.scale.y += 0.4; waveGroupRef.current.scale.z += 0.4;
            let isVisible = false;
            waveGroupRef.current.children.forEach((child) => {
                const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                mat.opacity = Math.max(0, mat.opacity - 0.04);
                if (mat.opacity > 0) isVisible = true;
            });
            if (!isVisible) setShowWave(false);
        }
    });

    return (
        <group ref={groupRef} position={[PLANET_POS.x, PLANET_POS.y, PLANET_POS.z]} scale={[1.4, 1.4, 1.4]}>
            <mesh><sphereGeometry args={[2.2, 64, 64]} /><meshBasicMaterial color="#FF00FF" wireframe /></mesh>
            <mesh rotation={[Math.PI / 3, 0, 0]}><torusGeometry args={[4.2, 0.1, 4, 100]} /><meshBasicMaterial color="#00FFFF" wireframe /></mesh>
            <mesh rotation={[Math.PI / 3, 0.1, 0]}><torusGeometry args={[3.5, 0.02, 4, 80]} /><meshBasicMaterial color="#FF0080" wireframe /></mesh>
            {showWave && (
                <group ref={waveGroupRef} rotation={[Math.PI / 3, 0, 0]}>
                    <mesh><ringGeometry args={[4.2, 4.8, 64]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} /></mesh>
                    <mesh><ringGeometry args={[3.0, 4.2, 64]} /><meshBasicMaterial color="#00FFFF" transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
                </group>
            )}
        </group>
    );
}

// --- МЕЙН ---
export default function BgPlanet3D({ onImpact, isMobile }: { onImpact?: () => void, isMobile: boolean }) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const globalMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = window.innerHeight;
            const progress = Math.max(0, window.scrollY / totalHeight);
            setScrollProgress(progress);
        };
        const handleMouseMove = (e: MouseEvent) => {
            globalMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            globalMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouseMove); };
    }, []);

    return (
        <div className="fixed inset-0 z-0 w-full bg-[#483D8B] h-full pointer-events-none" style={{ backgroundImage: `url(${Sky})` }}>
            <Canvas style={{ pointerEvents: 'auto' }}>
                <WaveGrid />
                <SaturnScene onImpact={onImpact} scrollProgress={scrollProgress} globalMouse={globalMouse} isMobile={isMobile} />
                <RetroLaptop scrollProgress={scrollProgress} isMobile={isMobile} />
                <RetroPhone scrollProgress={scrollProgress} isMobile={isMobile} />
                <RetroBot scrollProgress={scrollProgress} isMobile={isMobile} />
                <CyberShield scrollProgress={scrollProgress} isMobile={isMobile} />

                <DimensionWarp scrollProgress={scrollProgress} />
                <CyberGodzilla scrollProgress={scrollProgress} isMobile={isMobile} />
            </Canvas>
        </div>
    );
}