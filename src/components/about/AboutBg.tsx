import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, useGLTF, Clone, Preload } from '@react-three/drei';
import { useEffect, useState, useRef, useMemo } from 'react';
import * as THREE from 'three';

import islandPath from '../../assets/models/NeonIsland.glb?url';
import skyPath from '../../assets/models/Sky.glb?url';
import ghostPath from '../../assets/models/gostly.glb?url'; 
import NeonBat from './NeonBat';
import quakePath from '../../assets/sounds/quake.mp3?url';
import ShockwaveDistortion from '../effects/ShockwaveDistortion';
import WarmUpCompile from '../effects/WarmUpCompile';
import { playSfx } from '../../utils/sfx';

// Уход на contact: длительность совпадает с задержкой перед навигацией в
// AboutSectionSix, чтобы страница сменилась на пике скорости камеры.
const ABOUT_WARP_DURATION = 0.85;
const ABOUT_WARP_DISTANCE = 55;

// 🔥 ГРАДИЕНТНЫЙ ФОН
function GlowingBackgroundOrbs() {
    const glowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        
        gradient.addColorStop(0, 'rgba(214, 54, 194, 0.4)');  
        gradient.addColorStop(0.5, 'rgba(140, 26, 125, 0.15)'); 
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');           
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            <sprite position={[0, 5, -60]} scale={[150, 150, 1]}>
                <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.8} />
            </sprite>
            <sprite position={[-80, -5, 15]} scale={[180, 180, 1]}>
                <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.7} />
            </sprite>
            <sprite position={[-10, 10, 80]} scale={[200, 200, 1]}>
                <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.8} />
            </sprite>
            <sprite position={[70, -2, -12]} scale={[160, 160, 1]}>
                <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.85} />
            </sprite>
        </group>
    );
}

// 🔥 ГИГАНТСКИЙ СТАТИЧНЫЙ КОСМОС
function NeonGlowingStars() {
    const count = 4500; // было 8000 — аддитивные звёзды дают overdraw; на глаз незаметно
    const starTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');      
        gradient.addColorStop(0.15, 'rgba(255, 255, 255, 1)');   
        gradient.addColorStop(0.3, 'rgba(200, 150, 255, 0.6)');  
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');            
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }, []);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 300;     
            pos[i * 3 + 1] = (Math.random() - 0.5) * 150;  
            pos[i * 3 + 2] = (Math.random() - 0.5) * 300; 
        }
        return pos;
    }, [count]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial map={starTexture} size={0.7} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
    );
}

// 🔥 ИСПРАВЛЕННЫЙ GHOST (ДОБАВЛЕН SCALE)
function GhostlyPet({ position, rotation, scale = 1 }: { position: [number, number, number], rotation: [number, number, number], scale?: number }) {
    const { scene } = useGLTF(ghostPath);
    const ghostRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (ghostRef.current) {
            ghostRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
            const smoothDrift = Math.sin(t * 1.2) * 0.25;
            ghostRef.current.position.x = position[0] + smoothDrift;
        }
    });

    return (
        <group ref={ghostRef} position={position} rotation={rotation} scale={scale}>
            <pointLight intensity={1.5} color="#b829ff" distance={3} />
            <Clone object={scene} scale={0.001} />
        </group>
    );
}

function Model({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: any) {
    const { scene } = useGLTF(url) as { scene: THREE.Group };
    return <Clone object={scene} scale={scale} position={position} rotation={rotation} />;
}

// 🔥 ИЗОГНУТАЯ ПАЛАТКА
function CurvedTent() {
    const geomRef = useRef<THREE.ExtrudeGeometry>(null);

    const tentShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 1.3);        
        shape.lineTo(1, 0);          
        shape.lineTo(0.95, 0);       
        shape.lineTo(0, 1.25);       
        shape.lineTo(-0.95, 0);      
        shape.lineTo(-1, 0);         
        shape.closePath();
        return shape;
    }, []);

    useEffect(() => {
        if (!geomRef.current) return;
        const positions = geomRef.current.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            let y = positions.getY(i);
            const z = positions.getZ(i);
            const distanceFromCenter = Math.abs(z - 1.5);
            const sag = 0.35 * (1 - Math.pow(distanceFromCenter / 1.5, 2));
            if (y > 0.5) positions.setY(i, y - sag);
        }
        geomRef.current.attributes.position.needsUpdate = true;
        geomRef.current.computeVertexNormals(); 
    }, []);

    return (
        <mesh position={[0, 0, -1.5]}> 
            <extrudeGeometry ref={geomRef} args={[tentShape, { depth: 3, steps: 20, bevelEnabled: false }]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
    );
}

// 🔥 ЛАГЕРЬ ФИЛОСОФИИ
function PhilosophyCamp({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    return (
        <group position={position} scale={scale} rotation={rotation}>
            <group position={[0, 0, -0.5]} rotation={[0, Math.PI / 4, 0]}>
                <CurvedTent />
                <mesh position={[0, 0.02, 0]}><boxGeometry args={[1.2, 0.02, 2.2]} /><meshStandardMaterial color="#00e5ff" roughness={0.8} /></mesh>
                <mesh position={[0, 0.65, 1.45]}><cylinderGeometry args={[0.03, 0.03, 1.3, 16]} /><meshStandardMaterial color="#3e2723" roughness={1} /></mesh>
                <mesh position={[0, 0.65, -1.45]}><cylinderGeometry args={[0.03, 0.03, 1.3, 16]} /><meshStandardMaterial color="#3e2723" roughness={1} /></mesh>
            </group>

            <group position={[1.8, 0.2, 1.2]}>
                {[...Array(8)].map((_, i) => (
                    <mesh key={i} position={[Math.cos(i * (Math.PI / 4)) * 0.45, 0.02, Math.sin(i * (Math.PI / 4)) * 0.45]} scale={[1, 0.6, 1]} rotation={[Math.random(), Math.random(), 0]}>
                        <dodecahedronGeometry args={[0.12]} /><meshStandardMaterial color="#333333" roughness={0.9} flatShading />
                    </mesh>
                ))}
                {[...Array(3)].map((_, i) => (
                    <mesh key={`log-${i}`} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, (i * Math.PI) / 1.5]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} /><meshStandardMaterial color="#2d1b15" roughness={1} />
                    </mesh>
                ))}
                <group position={[0, 0.15, 0]}>
                    <mesh position={[0, 0, 0]}><sphereGeometry args={[0.15, 32, 32]} /><meshStandardMaterial color="#ffeb3b" emissive="#ff9100" emissiveIntensity={2.5} /></mesh>
                    <mesh position={[0, 0.15, 0]}><coneGeometry args={[0.15, 0.4, 32]} /><meshStandardMaterial color="#ffeb3b" emissive="#ff9100" emissiveIntensity={2.5} /></mesh>
                </group>
                <pointLight intensity={4} color="#ff9100" distance={6} position={[0, 0.35, 0]} />
            </group>

            <group position={[-1.2, 0.0, 1.5]} rotation={[0, -Math.PI / 5, 0]}>
                <group position={[0, 0.5, 0]}>
                    {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
                        <group key={i} rotation={[0, angle, 0]}>
                            <mesh position={[0, -0.3, 0.15]} rotation={[-0.3, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.6]} /><meshStandardMaterial color="#2c3e50" roughness={0.7} /></mesh>
                        </group>
                    ))}
                    <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.1]} /><meshStandardMaterial color="#1a252f" /></mesh>
                </group>
                <group position={[0, 0.55, 0]} rotation={[0.3, 0, 0]}>
                    <mesh><cylinderGeometry args={[0.1, 0.12, 1.0, 32]} /><meshStandardMaterial color="#00d2ff" roughness={0.2} metalness={0.6} /></mesh>
                    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.11, 0.11, 0.2, 32]} /><meshStandardMaterial color="#1a252f" roughness={0.5} /></mesh>
                    <mesh position={[0, -0.55, 0]}><cylinderGeometry args={[0.05, 0.05, 0.2, 16]} /><meshStandardMaterial color="#1a252f" roughness={0.5} /></mesh>
                    <mesh position={[0, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.1, 16]} /><meshStandardMaterial color="#34495e" roughness={0.3} /></mesh>
                    <mesh position={[0, -0.15, -0.12]}><cylinderGeometry args={[0.02, 0.02, 0.3, 16]} /><meshStandardMaterial color="#1a252f" /></mesh>
                </group>
            </group>
        </group>
    );
}

function SpinningCrystal() {
    const crystalRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (crystalRef.current) {
            crystalRef.current.rotation.y += delta * 1.2;
            crystalRef.current.position.y = Math.sin(state.clock.elapsedTime * 2.5) * 0.15 + 1.5;
        }
    });
    return (
        <group ref={crystalRef} scale={0.75}>
            <group rotation={[0, Math.PI / 4, 0]}>
                <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0, 0.3333, 0.4, 4]} /><meshStandardMaterial color="#050505" roughness={0.1} metalness={0.9} flatShading /></mesh>
                <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.3333, 0.4166, 0.1, 4]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} flatShading /></mesh>
                <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.4166, 0.4166, 0.2, 4]} /><meshStandardMaterial color="#050505" roughness={0.1} metalness={0.9} flatShading /></mesh>
                <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.4166, 0.3333, 0.1, 4]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} flatShading /></mesh>
                <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.3333, 0, 0.4, 4]} /><meshStandardMaterial color="#050505" roughness={0.1} metalness={0.9} flatShading /></mesh>
            </group>
            <pointLight intensity={2} color="#ffffff" distance={4} />
            <pointLight intensity={5} color="#d636c2" distance={8} />
        </group>
    );
}

function NeonChest({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    const chestColor = "#d636c2"; const rimColor = "#8c1a7d";   
    return (
        <group position={position} scale={scale} rotation={rotation}>
            <group position={[0, 0.4, 0]}>
                <mesh><boxGeometry args={[1.9, 0.8, 1.1]} /><meshStandardMaterial color={chestColor} roughness={0.7} /></mesh>
                <mesh position={[0, -0.35, 0]}><boxGeometry args={[2.05, 0.15, 1.25]} /><meshStandardMaterial color={rimColor} roughness={0.9} /></mesh>
                <mesh position={[0, 0.35, 0]}><boxGeometry args={[2.05, 0.15, 1.25]} /><meshStandardMaterial color={rimColor} roughness={0.9} /></mesh>
                <mesh position={[0.95, 0, 0.55]}><boxGeometry args={[0.15, 0.8, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                <mesh position={[-0.95, 0, 0.55]}><boxGeometry args={[0.15, 0.8, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                <mesh position={[0.95, 0, -0.55]}><boxGeometry args={[0.15, 0.8, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                <mesh position={[-0.95, 0, -0.55]}><boxGeometry args={[0.15, 0.8, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                <mesh position={[0, 0.1, 0.6]}><boxGeometry args={[0.3, 0.4, 0.1]} /><meshStandardMaterial color="#1a0a2a" roughness={0.5} /></mesh>
            </group>
            <group position={[0, 0.8, -0.55]} rotation={[-Math.PI / 2.2, 0, 0]}>
                <group position={[0, 0.2, 0.55]}>
                    <mesh><boxGeometry args={[1.9, 0.4, 1.1]} /><meshStandardMaterial color={chestColor} roughness={0.7} /></mesh>
                    <mesh position={[0, -0.15, 0]}><boxGeometry args={[2.05, 0.1, 1.25]} /><meshStandardMaterial color={rimColor} roughness={0.9} /></mesh>
                    <mesh position={[0, 0.15, 0]}><boxGeometry args={[2.05, 0.1, 1.25]} /><meshStandardMaterial color={rimColor} roughness={0.9} /></mesh>
                    <mesh position={[0.95, 0, 0.55]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                    <mesh position={[-0.95, 0, 0.55]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                    <mesh position={[0.95, 0, -0.55]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                    <mesh position={[-0.95, 0, -0.55]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color={rimColor} /></mesh>
                    <mesh position={[0, 0, 0]}><boxGeometry args={[0.25, 0.42, 1.12]} /><meshStandardMaterial color={rimColor} roughness={0.9} /></mesh>
                </group>
            </group>
            <SpinningCrystal />
        </group>
    );
}

const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const sinEaseInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

function AboutScene({ scrollProgress, mouse, active, onImpact }: { scrollProgress: number, mouse: any, active: boolean, onImpact: () => void }) {
    const { camera } = useThree();
    const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
    const impactSent = useRef(false);
    
    const starsStaticRef = useRef<THREE.Group>(null); 
    const starFieldRef = useRef<THREE.Group>(null);
    const starGroupRef = useRef<THREE.Group>(null);

    const cloudsRef = useRef<THREE.Group>(null);
    const cloudsSec3Ref = useRef<THREE.Group>(null);
    const cloudsSec4Ref = useRef<THREE.Group>(null);
    const cloudsSec5Ref = useRef<THREE.Group>(null);

    const introTimer = useRef(0);
    const hasPlayedSound = useRef(false);

    const prevMouse = useRef({ x: 0, y: 0 }); 
    const prevScroll = useRef(0);
    
    const idleZoomFactor = useRef(0); 
    const idleState = useRef<'waiting' | 'zoomingIn' | 'holding' | 'zoomingOut'>('waiting');
    const stateTimer = useRef(0); 

    const prevTargetCamPos = useRef(new THREE.Vector3(0, 1, 18));
    const smoothedWarpVel = useRef(new THREE.Vector3(0, 0, 0));

    // Уход на contact: камера отдаляется с разгоном к концу — та же схема,
    // что и при уходе со stack
    const isWarpingOut = useRef(false);
    const warpStart = useRef<number | null>(null);
    const warpFrom = useRef(new THREE.Vector3());

    useEffect(() => {
        const handleWarpOut = () => { isWarpingOut.current = true; };
        window.addEventListener('about-warp-out', handleWarpOut);
        return () => window.removeEventListener('about-warp-out', handleWarpOut);
    }, []);

    // Звук — только после готовности шейдеров, синхронно с интро-тряской (1.5с)
    useEffect(() => {
        if (!active || hasPlayedSound.current) return;
        const timer = setTimeout(() => {
            playSfx(quakePath, 0.8);
            hasPlayedSound.current = true;
        }, 1500);
        return () => clearTimeout(timer);
    }, [active]);

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        const rawSp = THREE.MathUtils.clamp(scrollProgress, 0, 5); 

        // Интро-время идёт только после готовности шейдеров — до этого камера
        // держится в стартовой (далёкой) позе, а фриз компиляции проходит на
        // статичном кадре, а не на анимации.
        if (active) introTimer.current += delta;
        const lt = introTimer.current;

        // Триггерим ударную волну ровно в момент старта тряски (lt >= 1.5)
        if (active && !impactSent.current && lt >= 1.5) {
            impactSent.current = true;
            onImpact();
        }

        let baseCamX, baseCamY, baseCamZ, angle;

        if (rawSp <= 1.0) {
            const localSp = rawSp; 
            const ease = easeInOutCubic(localSp);
            baseCamX = THREE.MathUtils.lerp(0, -14.0, ease);
            baseCamY = THREE.MathUtils.lerp(1, -1.0, ease);
            baseCamZ = THREE.MathUtils.lerp(18, 15.0, ease);
            angle = THREE.MathUtils.lerp(0, Math.PI / 2, ease); 
        } else if (rawSp <= 2.0) {
            const localSp = rawSp - 1.0; 
            const ease = easeInOutCubic(localSp); 
            baseCamX = THREE.MathUtils.lerp(-14.0, -9.0, ease); 
            baseCamY = THREE.MathUtils.lerp(-1.0, -1.0, ease);
            baseCamZ = THREE.MathUtils.lerp(15.0, 2.0, ease);  
            angle = THREE.MathUtils.lerp(Math.PI / 2, Math.PI + 0.15, ease);
        } else if (rawSp <= 3.0) {
            const localSp = rawSp - 2.0; 
            const ease = easeInOutCubic(localSp); 
            baseCamX = THREE.MathUtils.lerp(-9.0, 4.0, ease); 
            baseCamY = THREE.MathUtils.lerp(-1.0, -1.8, ease);
            baseCamZ = THREE.MathUtils.lerp(2.0, -12.0, ease);  
            angle = THREE.MathUtils.lerp(Math.PI + 0.15, Math.PI * 1.5, ease);
        } else if (rawSp <= 4.0) {
            const localSp = rawSp - 3.0;
            const ease = easeInOutCubic(localSp);
            
            baseCamX = THREE.MathUtils.lerp(4.0, 4.0, ease); 
            baseCamY = THREE.MathUtils.lerp(-1.8, 8.0, ease); 
            baseCamZ = THREE.MathUtils.lerp(-12.0, -12.0, ease); 
            
            angle = THREE.MathUtils.lerp(Math.PI * 1.5, Math.PI * 1.5 + 0.8, ease); 
        } else if (rawSp <= 5.0) {
            const localSp = rawSp - 4.0; 
            const ease = easeInOutCubic(localSp);
            
            baseCamX = THREE.MathUtils.lerp(4.0, -15.0, ease); 
            baseCamY = THREE.MathUtils.lerp(8.0, 1.0, ease); 
            baseCamZ = THREE.MathUtils.lerp(-12.0, -8.0, ease); 
            
            angle = THREE.MathUtils.lerp(Math.PI * 1.5 + 0.8, Math.PI * 1.5 + 0.8 + (Math.PI / 4), ease);
        }

        let introZoomZ = 0;
        let isShakingIntro = false;

        if (lt < 1.5) {
            const p = lt / 1.5;
            const easeOut = 1 - Math.pow(1 - p, 3);
            introZoomZ = THREE.MathUtils.lerp(40, 0, easeOut);
        } else if (lt >= 1.5 && lt < 2.0) {
            isShakingIntro = true;
        }

        const baseTargetCamPos = new THREE.Vector3(baseCamX, baseCamY, baseCamZ + introZoomZ);

        if (starsStaticRef.current) {
            starsStaticRef.current.rotation.y -= 0.01 * delta;
            starsStaticRef.current.rotation.z -= 0.005 * delta;
        }

        const rawCamVelocity = new THREE.Vector3().subVectors(baseTargetCamPos, prevTargetCamPos.current);
        if (rawCamVelocity.length() > 2) rawCamVelocity.set(0, 0, 0); 
        prevTargetCamPos.current.copy(baseTargetCamPos);
        smoothedWarpVel.current.lerp(rawCamVelocity, 0.03); 

        const warpMultiplier = 8; 

        if (starFieldRef.current && starGroupRef.current) {
            starFieldRef.current.position.copy(camera.position);
            starGroupRef.current.position.x -= smoothedWarpVel.current.x * warpMultiplier;
            starGroupRef.current.position.y -= smoothedWarpVel.current.y * warpMultiplier;
            starGroupRef.current.position.z -= smoothedWarpVel.current.z * warpMultiplier;

            const bound = 125;
            if (starGroupRef.current.position.x > bound) starGroupRef.current.position.x -= bound * 2;
            if (starGroupRef.current.position.x < -bound) starGroupRef.current.position.x += bound * 2;
            if (starGroupRef.current.position.y > 75) starGroupRef.current.position.y -= 150;
            if (starGroupRef.current.position.y < -75) starGroupRef.current.position.y += 150;
            if (starGroupRef.current.position.z > bound) starGroupRef.current.position.z -= bound * 2;
            if (starGroupRef.current.position.z < -bound) starGroupRef.current.position.z += bound * 2;
        }

        const mouseDelta = Math.abs(mouse.x - prevMouse.current.x) + Math.abs(mouse.y - prevMouse.current.y);
        const scrollDelta = Math.abs(scrollProgress - prevScroll.current);
        prevMouse.current = mouse;
        prevScroll.current = scrollProgress;

        if (mouseDelta > 0.0001 || scrollDelta > 0.0001 || lt < 3.0) { 
            if (idleState.current !== 'waiting' || idleZoomFactor.current > 0) {
                 idleState.current = 'waiting'; 
                 stateTimer.current = 0;
            }
        }

        stateTimer.current += delta;
        
        const waitDuration = 4;      
        const zoomInDuration = 1.8;  
        const holdDuration = 3;      
        const zoomOutDuration = 2.5; 

        switch (idleState.current) {
            case 'waiting':
                idleZoomFactor.current = THREE.MathUtils.lerp(idleZoomFactor.current, 0, 0.05);
                if (stateTimer.current > waitDuration && mouseDelta === 0 && scrollDelta === 0) { 
                    idleState.current = 'zoomingIn';
                    stateTimer.current = 0;
                }
                break;
            case 'zoomingIn':
                idleZoomFactor.current = sinEaseInOut(THREE.MathUtils.clamp(stateTimer.current / zoomInDuration, 0, 1));
                if (stateTimer.current > zoomInDuration) {
                    idleState.current = 'holding';
                    stateTimer.current = 0;
                }
                break;
            case 'holding':
                idleZoomFactor.current = 1; 
                if (stateTimer.current > holdDuration) { 
                    idleState.current = 'zoomingOut';
                    stateTimer.current = 0;
                }
                break;
            case 'zoomingOut':
                idleZoomFactor.current = 1 - sinEaseInOut(THREE.MathUtils.clamp(stateTimer.current / zoomOutDuration, 0, 1));
                if (stateTimer.current > zoomOutDuration) {
                    idleState.current = 'waiting'; 
                    stateTimer.current = 0;
                }
                break;
        }

        // Параллакс выключен, пока идёт интро (влёт + тряска, ~до 2.2с);
        // сам сдвиг уже truck-типа (добавляется и к камере, и к точке взгляда ниже).
        const paraGate = lt > 2.2 ? 1 : 0;
        const paraX = mouse.x * 0.08 * paraGate;
        const paraY = mouse.y * 0.08 * paraGate;

        const finalCamX = baseCamX + paraX;
        const finalCamY = baseCamY + paraY;
        const finalCamZ = baseCamZ + introZoomZ;

        // 🔥 УХОД НА CONTACT: камера отодвигается НАЗАД по своей же оси взгляда
        // с разгоном к концу (ease-in). Считаем по времени, а не lerp'ом —
        // lerp к цели, наоборот, замедляется к концу.
        if (isWarpingOut.current) {
            if (warpStart.current === null) {
                warpStart.current = t;
                warpFrom.current.copy(camera.position);
            }
            // p НЕ клампим: иначе на p=1 камера упирается в максимум и «виснет»
            // до самой смены страницы (уход занимает 850мс анимации + 500мс
            // размытия в navigateTo). Без плато камера продолжает разгоняться
            // и улетает, пока сцена не размонтируется — при любых таймингах.
            const p = Math.max(0, (t - warpStart.current) / ABOUT_WARP_DURATION);
            const eased = p * p * p;

            const back = new THREE.Vector3()
                .subVectors(warpFrom.current, lookAtTarget.current)
                .normalize();
            camera.position.copy(warpFrom.current).addScaledVector(back, eased * ABOUT_WARP_DISTANCE);
            camera.lookAt(lookAtTarget.current);
            return;
        }

        camera.position.lerp(new THREE.Vector3(finalCamX, finalCamY, finalCamZ), 0.025);

        if (isShakingIntro) {
            const shakeProgress = (lt - 1.5) / 0.5; 
            const intensity = 0.25 * (1 - shakeProgress); 
            camera.position.x += (Math.random() - 0.5) * intensity;
            camera.position.y += (Math.random() - 0.5) * intensity;
        }

        const lookRadius = 10;
        const targetLookX = (baseCamX - Math.sin(angle) * lookRadius) + paraX;
        const targetLookY = baseCamY + paraY; 
        const targetLookZ = baseCamZ - Math.cos(angle) * lookRadius;

        lookAtTarget.current.x = THREE.MathUtils.lerp(lookAtTarget.current.x, targetLookX, 0.025);
        lookAtTarget.current.y = THREE.MathUtils.lerp(lookAtTarget.current.y, targetLookY, 0.025);
        lookAtTarget.current.z = THREE.MathUtils.lerp(lookAtTarget.current.z, targetLookZ, 0.025);
        camera.lookAt(lookAtTarget.current);

        if (cloudsRef.current) {
            cloudsRef.current.position.x += 0.001; 
            if (cloudsRef.current.position.x > 15) cloudsRef.current.position.x = -15; 
        }
        if (cloudsSec3Ref.current) {
            cloudsSec3Ref.current.position.x -= 0.004; 
            if (cloudsSec3Ref.current.position.x < -30) cloudsSec3Ref.current.position.x = 20; 
        }
        if (cloudsSec4Ref.current) {
            cloudsSec4Ref.current.position.x -= 0.003;
            if (cloudsSec4Ref.current.position.x < -10) cloudsSec4Ref.current.position.x = 30; 
        }
        if (cloudsSec5Ref.current) {
            cloudsSec5Ref.current.position.x -= 0.002;
            if (cloudsSec5Ref.current.position.x < -5) cloudsSec5Ref.current.position.x = 25;
        }
    });

    return (
        <group>
            <GlowingBackgroundOrbs />

            <group ref={starsStaticRef}> 
                <group ref={starFieldRef}>
                    <group ref={starGroupRef}>
                        <NeonGlowingStars />
                    </group>
                </group>
            </group>

            {/* СЕКЦИЯ 1 */}
            <group>
                <Float speed={1.5} rotationIntensity={0.1} floatIntensity={1}>
                    <Model url={islandPath} scale={1.8} position={[-5, 0, 8]} rotation={[0.1, 1.5, -0.1]} /> 
                </Float>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={1.5}>
                    <Model url={islandPath} scale={3.5} position={[7, 6, 7]} rotation={[-0.2, 0.5, 0.1]} /> 
                </Float>
                <Float speed={1.2} rotationIntensity={0.15} floatIntensity={1}>
                    <Model url={islandPath} scale={1.5} position={[6, -1, 4]} rotation={[0.2, -1.2, 0.1]} /> 
                </Float>
                <Float speed={1.8} rotationIntensity={0.1} floatIntensity={1}>
                    <Model url={islandPath} scale={2.5} position={[0, -7, 8]} rotation={[0.2, 0, 0]} />
                </Float>

                <group ref={cloudsRef}>
                    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={2}><Model url={skyPath} scale={0.8} position={[-6, 3, 5]} /></Float>
                    <Float speed={2.2} rotationIntensity={0.1} floatIntensity={1.5}><Model url={skyPath} scale={1.2} position={[8, 5, 2]} /></Float>
                    <Float speed={1.8} rotationIntensity={0.08} floatIntensity={1.8}><Model url={skyPath} scale={1} position={[12, 3, -1]} rotation={[0.1, -0.5, 0]} /></Float>
                    <Float speed={2} rotationIntensity={0.1} floatIntensity={1}><Model url={skyPath} scale={0.6} position={[3, 1, 1]} /></Float>
                    <Float speed={1.6} rotationIntensity={0.05} floatIntensity={1.2}><Model url={skyPath} scale={0.9} position={[-8, -2, 7]} /></Float>
                </group>
            </group>

            {/* СЕКЦИЯ 2 */}
            <group>
                <Float speed={1.5} rotationIntensity={0.05} floatIntensity={1}>
                    <Model url={islandPath} scale={2.8} position={[-18, -2.4, 15]} rotation={[0.1, 0, 0.1]} />
                    <NeonBat scale={1.5} position={[-16.95, -2.34, 15]} rotation={[0, Math.PI / 2, 0]} />
                    <GhostlyPet position={[-18.0, -1.2, 15.8]} rotation={[0, Math.PI / 2.2, 0]} />
                </Float>
                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.8}>
                    <Model url={islandPath} scale={2.5} position={[-28, 1, 23]} rotation={[-0.1, 1.2, 0.1]} />
                </Float>
                <Float speed={1.8} rotationIntensity={0.1} floatIntensity={1.2}>
                    <Model url={islandPath} scale={3} position={[-26, 4, 6]} rotation={[0.2, -0.5, 0]} />
                </Float>

                <Float speed={1.5} rotationIntensity={0.05} floatIntensity={2}><Model url={skyPath} scale={1} position={[-26, 4, 11]} /></Float>
                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={1.5}><Model url={skyPath} scale={0.8} position={[-26, -3, 10]} /></Float>
                <Float speed={1.8} rotationIntensity={0.08} floatIntensity={1.8}><Model url={skyPath} scale={1.3} position={[-18, 6, 8]} /></Float>
                <Float speed={2.0} rotationIntensity={0.1} floatIntensity={2}><Model url={skyPath} scale={1.1} position={[-14, 0, 20]} /></Float>
                <Float speed={1.6} rotationIntensity={0.05} floatIntensity={1.2}><Model url={skyPath} scale={1.5} position={[-32, 2, 15]} /></Float>
            </group>

            {/* СЕКЦИЯ 3 */}
            <group ref={cloudsSec3Ref}>
                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={1}>
                    <Model url={islandPath} scale={3.5} position={[10, -3, 22]} rotation={[0.2, 0.5, -0.1]} />
                </Float>
                <Float speed={1.5} rotationIntensity={0.08} floatIntensity={1.2}>
                    <Model url={islandPath} scale={4.5} position={[-18, 15, 25]} rotation={[Math.PI - 0.1, 0.2, 0.1]} />
                </Float>
                <Float speed={2} rotationIntensity={0.1} floatIntensity={1.5}>
                    <Model url={islandPath} scale={0.8} position={[-2, 12, 24]} rotation={[Math.PI, 0, 0]} />
                </Float>
                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={1}>
                    <Model url={islandPath} scale={1.5} position={[-25, 4, 35]} rotation={[0.1, -0.2, 0]} />
                </Float>
                
                <Float speed={1.8} rotationIntensity={0.05} floatIntensity={2}><Model url={skyPath} scale={1.8} position={[6, -6, 18]} rotation={[0, 1, 0]} /></Float>
                <Float speed={1.5} rotationIntensity={0.1} floatIntensity={1.5}><Model url={skyPath} scale={1.5} position={[-12, -8, 20]} rotation={[0, -0.5, 0]} /></Float>
                <Float speed={2.1} rotationIntensity={0.08} floatIntensity={2.5}><Model url={skyPath} scale={2} position={[2, 8, 22]} rotation={[0.2, 0.5, 0]} /></Float>
                <Float speed={1.7} rotationIntensity={0.05} floatIntensity={1.8}><Model url={skyPath} scale={1.2} position={[-22, 10, 30]} rotation={[-0.2, -0.5, 0]} /></Float>
                <Float speed={1.9} rotationIntensity={0.1} floatIntensity={2.2}><Model url={skyPath} scale={1.6} position={[-8, 12, 15]} rotation={[0.1, 1.2, 0]} /></Float>
            </group>

            {/* СЕКЦИЯ 4 */}
            <group>
                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.5}>
                    <group position={[9.0, -2.7, -12]} rotation={[0, -0.96, 0]}>
                        <Model url={islandPath} scale={2.8} position={[0, 0, 0]} rotation={[0.1, 1.2, 0]} />
                        <NeonChest position={[-0.2, 0.22, 0.2]} scale={0.45} rotation={[0.15, -0.1, -0.05]} />
                    </group>
                </Float>

                <Float speed={1.5} rotationIntensity={0.08} floatIntensity={1.2}>
                    <Model url={islandPath} scale={1.5} position={[18, -1.0, -18]} rotation={[0.2, -0.5, 0.1]} />
                </Float>
                <Float speed={1.3} rotationIntensity={0.1} floatIntensity={1}>
                    <Model url={islandPath} scale={2.5} position={[24, -6, -8]} rotation={[-0.1, 0.8, -0.1]} />
                </Float>

                <group ref={cloudsSec4Ref}>
                    <Float speed={1.8} rotationIntensity={0.05} floatIntensity={2}><Model url={skyPath} scale={1.2} position={[8, 4, -14]} rotation={[0, 1, 0]} /></Float>
                    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={1.5}><Model url={skyPath} scale={1.2} position={[14, 5, -16]} rotation={[0, -0.5, 0]} /></Float>
                    <Float speed={2.0} rotationIntensity={0.08} floatIntensity={2.2}><Model url={skyPath} scale={1.5} position={[2, -2, -18]} rotation={[0.2, 0.8, 0]} /></Float>
                    <Float speed={1.6} rotationIntensity={0.05} floatIntensity={1.8}><Model url={skyPath} scale={1.8} position={[22, 2, -12]} rotation={[-0.1, -0.5, 0]} /></Float>
                    <Float speed={1.9} rotationIntensity={0.1} floatIntensity={2.0}><Model url={skyPath} scale={1.4} position={[12, -8, -10]} rotation={[0, 1.5, 0]} /></Float>
                </group>
            </group>

            {/* СЕКЦИЯ 5 */}
            <group>
                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.5}>
                    <group position={[7.0, 7.2, -15.0]} rotation={[0, -0.8, 0]}> 
                        <Model url={islandPath} scale={3.0} position={[0, 0, 0]} rotation={[0.1, -1.2, 0.1]} />
                        <PhilosophyCamp position={[0.2, 0.35, 0]} scale={0.45} rotation={[0, 0, 0]} />
                    </group>
                </Float>

                <group ref={cloudsSec5Ref}>
                    <Float speed={1.8} rotationIntensity={0.05} floatIntensity={2}>
                        <Model url={skyPath} scale={1.5} position={[14, 2, -18]} rotation={[0, 1.5, 0]} />
                    </Float>
                    <Float speed={1.4} rotationIntensity={0.1} floatIntensity={1.5}>
                        <Model url={skyPath} scale={1.2} position={[6, 12, -22]} rotation={[0, -0.8, 0]} />
                    </Float>
                </group>
            </group>

            {/* 🔥 СЕКЦИЯ 6: ДИОРАМА С УВЕЛИЧЕННЫМ ГОСТОМ */}
            <group>
                <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.5}>
                    <group position={[-24, -0.5, -20]}>
                        <Model url={islandPath} scale={3.5} position={[0, 0, 0]} rotation={[0.1, 0.5, -0.1]} />
                        <GhostlyPet position={[-0.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={3} />
                    </group>
                </Float>

                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={1.5}>
                     <Model url={skyPath} scale={1.8} position={[-22, 5, -20]} rotation={[0, 0.5, 0]} />
                </Float>

                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={1}>
                    <group position={[-15, -2.5, -25]}>
                        <Model url={islandPath} scale={2} position={[0, 0, 0]} rotation={[-0.1, 0, 0.1]} />
                        <mesh position={[0, 0.8, 0]}>
                            <coneGeometry args={[0.6, 1.5, 5]} />
                            <meshStandardMaterial color="#ff66b2" emissive="#ff1493" emissiveIntensity={1.5} flatShading />
                        </mesh>
                        <mesh position={[0, 0.2, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 0.5, 5]} />
                            <meshStandardMaterial color="#2d1b15" flatShading />
                        </mesh>
                        <pointLight position={[0, 1, 0]} intensity={3} color="#ff1493" distance={15} />
                    </group>
                </Float>

                <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.8}>
                    <group position={[-6, -1, -22]}>
                        <Model url={islandPath} scale={2.2} position={[0, 0, 0]} rotation={[0.1, -0.5, 0]} />
                        <mesh position={[0, 1.2, 0]}>
                            <dodecahedronGeometry args={[0.7]} />
                            <meshStandardMaterial color="#00e5ff" emissive="#00bfff" emissiveIntensity={1.5} flatShading />
                        </mesh>
                        <mesh position={[0, 0.5, 0]}>
                            <cylinderGeometry args={[0.1, 0.15, 0.8, 5]} />
                            <meshStandardMaterial color="#2d1b15" flatShading />
                        </mesh>
                        <pointLight position={[0, 1.5, 0]} intensity={3} color="#00e5ff" distance={15} />
                    </group>
                </Float>
            </group>

            {/* ОСВЕЩЕНИЕ — прежние 12 глобальных ламп слиты в 7: тройки white/
                purple/pink по секциям сильно перекрывались, поэтому оставлены
                1–2 на кластер с поднятыми intensity/distance, чтобы охват и цвет
                сохранились (перф: каждый фрагмент шейдится по всем лампам). */}
            <ambientLight intensity={0.5} />

            {/* Секция 1 (у начала координат): белый филл + фиолетовый ключ */}
            <pointLight position={[1, 2, 6]} intensity={4} color="#ffffff" distance={36} />
            <pointLight position={[4, 3, 3]} intensity={7} color="#b829ff" distance={36} />

            {/* Секция 2 (левые острова): фиолетовый ключ + розовый акцент */}
            <pointLight position={[-16, 3, 15]} intensity={8} color="#b829ff" distance={30} />
            <pointLight position={[-17, -1, 18]} intensity={5} color="#ff1493" distance={28} />

            {/* Дальняя белая */}
            <pointLight position={[6, -3, 20]} intensity={7} color="#ffffff" distance={32} />

            {/* Задние секции: фиолетовый + белый сверху */}
            <pointLight position={[12, 0, -11]} intensity={5} color="#b829ff" distance={26} />
            <pointLight position={[-4, 10, -12]} intensity={7} color="#ffffff" distance={34} />
        </group>
    );
}

const AboutBg = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [ready, setReady] = useState(false);          // шейдеры скомпилированы
    const [impactFired, setImpactFired] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollProgress(window.scrollY / window.innerHeight);
        };
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            });
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 w-full h-full bg-[#130b2e] overflow-hidden pointer-events-none">
            <Canvas dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: true }} camera={{ position: [0, 1, 18], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <Environment preset="night" />
                <AboutScene scrollProgress={scrollProgress} mouse={mouse} active={ready} onImpact={() => setImpactFired(true)} />
                {/* Ударная волна — триггерится ровно в момент интро-тряски (см. impactFired) */}
                <ShockwaveDistortion trigger={impactFired} />
                <WarmUpCompile onReady={() => setReady(true)} />
                <Preload all />
            </Canvas>
        </div>
    );
};

export default AboutBg;