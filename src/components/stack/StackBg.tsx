import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

import laptopPath from '../../assets/models/laptop.glb?url';
import platformPath from '../../assets/models/platform.glb?url';
import spaceFirePath from '../../assets/models/spaceFire.glb?url'; 
import serverPath from '../../assets/models/server.glb?url';
import databasesPath from '../../assets/models/databases.glb?url';
import devopsPath from '../../assets/models/devops.glb?url'; 
import apiPath from '../../assets/models/ApiIntegration.glb?url'; 
import quakePath from '../../assets/sounds/quake.mp3';
import cityHdr from '../../assets/hdri/potsdamer_platz_1k.hdr?url'; 
import ShockwaveDistortion from '../effects/ShockwaveDistortion';
import WarmUpCompile from '../effects/WarmUpCompile';
import { playSfx } from '../../utils/sfx';

// Уход со Stack: камера улетает назад в космос. Длительность совпадает с
// задержкой перед navigate-about в PromoStackTwo (800мс), чтобы переход
// случился ровно в момент, когда камера набрала максимальную скорость.
const WARP_OUT_DURATION = 0.8;
const WARP_OUT_Z = 70;

function Model({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: { url: string; scale?: number; position?: [number, number, number]; rotation?: [number, number, number] }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={scale} position={position} rotation={rotation} />;
}

function SpaceFireModel({ url, scale = 1, position = [0, 0, 0] }: { url: string; scale?: number; position?: [number, number, number] }) {
    const { scene, animations } = useGLTF(url);
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        if (actions) {
            Object.values(actions).forEach((action) => {
                if (action) action.play();
            });
        }
    }, [actions]);

    return <primitive object={scene} scale={scale} position={position} />;
}

function SpaceFireBackground({ phase, isMobile }: { phase: string, isMobile: boolean }) {
    const bgRef = useRef<THREE.Group>(null);
    const currentZ = useRef(-300); 

    useFrame(() => {
        if (!bgRef.current) return;
        
        const baseX = isMobile ? 0 : 9;
        const baseY = isMobile ? -3.5 : -1; 
        const baseZ = -35;

        if (phase === 'bg-warp') {
            currentZ.current = THREE.MathUtils.lerp(currentZ.current, baseZ, 0.08);
        } else {
            currentZ.current = THREE.MathUtils.lerp(currentZ.current, baseZ, 0.1);
        }

        bgRef.current.position.z = currentZ.current;
        bgRef.current.position.x = baseX;
        bgRef.current.position.y = baseY;
    });

    return (
        <group ref={bgRef} position={[0, 0, -300]} rotation={[0, -Math.PI / 8, 0]}>
            <SpaceFireModel url={spaceFirePath} scale={4.5} position={[0, 0, 0]} />
        </group>
    );
}

function FloatingTechParticles() {
    return (
        <group>
            <Float speed={2} rotationIntensity={2} floatIntensity={3}>
                <group position={[-2.5, 1.5, 1]}>
                    <mesh><boxGeometry args={[0.5, 0.1, 0.1]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                    <mesh><boxGeometry args={[0.1, 0.5, 0.1]} /><meshBasicMaterial color="#00FFFF" /></mesh>
                </group>
            </Float>
            <Float speed={1.5} rotationIntensity={4} floatIntensity={2}>
                <mesh position={[2.5, 2, -1]} rotation={[Math.PI / 4, 0, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.1, 3]} />
                    <meshBasicMaterial color="#b829ff" />
                </mesh>
            </Float>
            <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
                <group position={[2, -0.5, 1.5]} rotation={[0, 0, -Math.PI / 4]}>
                    <mesh position={[0.15, 0, 0]}><boxGeometry args={[0.4, 0.1, 0.1]} /><meshBasicMaterial color="#ffffff" /></mesh>
                    <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.1, 0.4, 0.1]} /><meshBasicMaterial color="#ffffff" /></mesh>
                </group>
            </Float>
            <Float speed={3} rotationIntensity={3} floatIntensity={1}>
                <mesh position={[-2, -0.2, 2]}>
                    <boxGeometry args={[0.25, 0.25, 0.25]} />
                    <meshBasicMaterial color="#00FFFF" />
                </mesh>
            </Float>
            <Float speed={1} rotationIntensity={2} floatIntensity={4}>
                <group position={[1.5, 3, -2]}>
                    <mesh><boxGeometry args={[0.35, 0.08, 0.08]} /><meshBasicMaterial color="#b829ff" /></mesh>
                    <mesh><boxGeometry args={[0.08, 0.35, 0.08]} /><meshBasicMaterial color="#b829ff" /></mesh>
                </group>
            </Float>
        </group>
    );
}

const _pulseVec = new THREE.Vector3();

function AnimatedScene({ phase, scrollRef }: { phase: string, scrollRef: React.MutableRefObject<number> }) {
    const parentRef = useRef<THREE.Group>(null);
    const laptopRef = useRef<THREE.Group>(null);
    const serverRef = useRef<THREE.Group>(null);
    const dbRef = useRef<THREE.Group>(null);
    const devopsRef = useRef<THREE.Group>(null);
    const apiRef = useRef<THREE.Group>(null);
    
    const currentY = useRef(-40);
    const currentScale = useRef(0.01);
    const currentRotX = useRef(-Math.PI / 3);
    const currentRotZ = useRef(Math.PI / 6);
    
    const smoothProgress = useRef(0);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollRef.current, 0.05);
        
        const sp = smoothProgress.current; 
        
        const sp1 = THREE.MathUtils.clamp(sp, 0, 1);      
        const sp2 = THREE.MathUtils.clamp(sp - 1, 0, 1);  
        const sp3 = THREE.MathUtils.clamp(sp - 2, 0, 1);  
        const sp4 = THREE.MathUtils.clamp(sp - 3, 0, 1);  
        const sp5 = THREE.MathUtils.clamp(sp - 4, 0, 1); 

        if (parentRef.current) {
            // 🔥 Во время варпа платформа крутится чуть быстрее для динамики
            parentRef.current.rotation.y += phase === 'warp-out' ? 0.02 : 0.003;

            if (phase === 'sliding' || phase === 'idle' || phase === 'warp-out') {
                currentY.current = THREE.MathUtils.lerp(currentY.current, 0, 0.04);
                currentScale.current = THREE.MathUtils.lerp(currentScale.current, 1, 0.04);
                currentRotX.current = THREE.MathUtils.lerp(currentRotX.current, 0, 0.04);
                currentRotZ.current = THREE.MathUtils.lerp(currentRotZ.current, 0, 0.04);
            }

            const shrinkFactor = Math.max(0, 1 - sp5);
            const baseS = currentScale.current * shrinkFactor;

            parentRef.current.position.y = currentY.current;
            parentRef.current.scale.set(baseS, baseS, baseS);
            parentRef.current.rotation.x = currentRotX.current;
            parentRef.current.rotation.z = currentRotZ.current;

            if (phase === 'idle') {
                const pulse = 1 + Math.sin(t * 1.5) * 0.01;
                const finalScale = pulse * shrinkFactor;
                _pulseVec.set(finalScale, finalScale, finalScale);
                parentRef.current.scale.lerp(_pulseVec, 0.1);
            }
        }

        if (laptopRef.current) {
            laptopRef.current.position.y = 0.5 + Math.sin(t) * 0.15 + (sp1 * 15);
            laptopRef.current.rotation.y = sp1 * Math.PI; 
            laptopRef.current.scale.setScalar(Math.max(0, 1 - sp1 * 0.5)); 
        }

        if (serverRef.current) {
            serverRef.current.position.y = -15 + (sp1 * 15.5) + (sp2 * 15) + Math.sin(t + 2) * 0.15;
            serverRef.current.rotation.y = (1 - sp1) * -Math.PI + (sp2 * Math.PI); 
            serverRef.current.scale.setScalar(Math.max(0, 0.5 + sp1 * 0.5 - sp2 * 0.5)); 
        }

        if (dbRef.current) {
            dbRef.current.position.y = -15 + (sp2 * 15.5) + (sp3 * 15) + Math.sin(t + 4) * 0.15;
            dbRef.current.rotation.y = (1 - sp2) * -Math.PI + (sp3 * Math.PI); 
            dbRef.current.scale.setScalar(Math.max(0, 0.5 + sp2 * 0.5 - sp3 * 0.5)); 
        }

        if (devopsRef.current) {
            devopsRef.current.position.y = -15 + (sp3 * 15.5) + (sp4 * 15) + Math.sin(t + 6) * 0.15;
            devopsRef.current.rotation.y = (1 - sp3) * -Math.PI + (sp4 * Math.PI); 
            devopsRef.current.scale.setScalar(Math.max(0, 0.5 + sp3 * 0.5 - sp4 * 0.5)); 
        }

        if (apiRef.current) {
            apiRef.current.position.y = -15 + (sp4 * 15.5) + (sp5 * 15) + Math.sin(t + 8) * 0.15;
            apiRef.current.rotation.y = (1 - sp4) * -Math.PI + (sp5 * Math.PI); 
            apiRef.current.scale.setScalar(0.5 + sp4 * 0.5); 
        }
    });

    return (
        <group ref={parentRef} position={[0, -40, 0]} scale={[0.01, 0.01, 0.01]}>
            <Model url={platformPath} scale={6} position={[0, -2.0, 0]} />
            <FloatingTechParticles /> 
            
            <group ref={laptopRef}>
                <Model url={laptopPath} scale={2} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
                <pointLight position={[0, 0.2, 0]} intensity={6} color="#ffaa00" distance={3} />
            </group>

            <group ref={serverRef}>
                <Model url={serverPath} scale={2.5} position={[0, 0, 0]} />
                <pointLight position={[0, 0.2, 0]} intensity={8} color="#00ff88" distance={4} />
            </group>

            <group ref={dbRef}>
                <Model url={databasesPath} scale={2.5} position={[0, -1.5, 0]} rotation={[0, Math.PI, 0]} />
                <pointLight position={[0, 0.2, 0]} intensity={8} color="#8A2BE2" distance={4} />
            </group>

            <group ref={devopsRef}>
                <Model url={devopsPath} scale={2.5} position={[0, 0, 0]} />
                <pointLight position={[0, 0.2, 0]} intensity={8} color="#ff3300" distance={4} />
            </group>

            <group ref={apiRef}>
                <Model url={apiPath} scale={2.5} position={[0, 0, 0]} />
                <pointLight position={[0, 0.2, 0]} intensity={8} color="#00FFFF" distance={4} />
            </group>
        </group>
    );
}

function SceneWrapper({ mouseRef, phase, shakeRef, scrollRef, isMobile }: any) {
    const rootRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    
    const lookAtTarget = useRef(new THREE.Vector3(0, -0.5, 0));
    const warpStart = useRef<number | null>(null);
    const warpFrom = useRef(new THREE.Vector3());

    useFrame((state) => {
        if (!rootRef.current) return;
        
        const shake = shakeRef.current;
        if (shake > 0.01) {
            rootRef.current.position.x = (Math.random() - 0.5) * shake;
            rootRef.current.position.y = (Math.random() - 0.5) * shake;
            shakeRef.current = THREE.MathUtils.lerp(shake, 0, 0.05);
        } else {
            rootRef.current.position.x = 0;
            rootRef.current.position.y = 0;
        }

        // 🔥 УХОД В КОСМОС: камера отдаляется НАЗАД с разгоном к концу —
        // зеркально появлению about, где камера, наоборот, влетает издалека и
        // плавно тормозит. Считаем по времени, а не lerp'ом: lerp к цели всегда
        // ЗАМЕДЛЯЕТСЯ к концу, то есть даёт ровно обратное ощущение.
        if (phase === 'warp-out') {
            const now = state.clock.getElapsedTime();
            if (warpStart.current === null) {
                warpStart.current = now;
                warpFrom.current.copy(camera.position);
            }
            const p = THREE.MathUtils.clamp((now - warpStart.current) / WARP_OUT_DURATION, 0, 1);
            const eased = p * p * p; // ease-in — разгон к концу

            camera.position.x = THREE.MathUtils.lerp(warpFrom.current.x, 0, eased);
            camera.position.y = THREE.MathUtils.lerp(warpFrom.current.y, 2, eased);
            camera.position.z = THREE.MathUtils.lerp(warpFrom.current.z, WARP_OUT_Z, eased);

            // Продолжаем смотреть вперёд, чтобы сцена именно УДАЛЯЛАСЬ
            lookAtTarget.current.x = THREE.MathUtils.lerp(lookAtTarget.current.x, 0, 0.08);
            lookAtTarget.current.y = THREE.MathUtils.lerp(lookAtTarget.current.y, 0, 0.08);
            lookAtTarget.current.z = -35;
            camera.lookAt(lookAtTarget.current);
            return;
        }

        const flyProgress = THREE.MathUtils.clamp((scrollRef.current - 4) / 2, 0, 1);

        // Параллакс: слабый truck (сдвиг и на камеру, И на точку взгляда, чтобы
        // сцена не вращалась) и только в состоянии покоя (idle) — во время
        // варпа/слайда/варп-аута параллакса нет.
        const paraX = phase === 'idle' ? mouseRef.current.x * 0.22 : 0;
        const paraY = phase === 'idle' ? mouseRef.current.y * 0.12 : 0;

        let targetCamX = THREE.MathUtils.lerp(0, isMobile ? 0 : 7.5, flyProgress) + paraX;
        let targetCamY = THREE.MathUtils.lerp(1, isMobile ? -1.5 : -0.2, flyProgress) + paraY;
        let targetCamZ = THREE.MathUtils.lerp(9, isMobile ? -22 : -26, flyProgress);

        const targetLookX = THREE.MathUtils.lerp(0, isMobile ? 0 : 9, flyProgress) + paraX;
        const targetLookY = THREE.MathUtils.lerp(-0.5, isMobile ? -3.5 : -1, flyProgress) + paraY;
        const targetLookZ = THREE.MathUtils.lerp(0, -35, flyProgress);

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.03);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.03);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.03);

        lookAtTarget.current.x = THREE.MathUtils.lerp(lookAtTarget.current.x, targetLookX, 0.03);
        lookAtTarget.current.y = THREE.MathUtils.lerp(lookAtTarget.current.y, targetLookY, 0.03);
        lookAtTarget.current.z = THREE.MathUtils.lerp(lookAtTarget.current.z, targetLookZ, 0.03);

        camera.lookAt(lookAtTarget.current);
    });

    return (
        <group ref={rootRef}>
            <SpaceFireBackground phase={phase} isMobile={isMobile} />
            <group position={isMobile ? [0, -1.5, -2] : [-2.5, 0, 0]} scale={isMobile ? 0.75 : 1}>
                <AnimatedScene phase={phase} scrollRef={scrollRef} />
            </group>
        </group>
    );
}

const StackBg = () => {
    // Мышь, скролл и тряска живут в ref, а не в useState. Это не косметика:
    // каждый setState перерисовывал всё дерево сцены (модели, лампы, Float),
    // то есть на каждое движение мыши и каждый кадр тряски. Значения читаются
    // только внутри useFrame, поэтому на картинку переход на ref не влияет.
    const mouseRef = useRef({ x: 0, y: 0 });
    const scrollRef = useRef(0);
    const shakeRef = useRef(0);
    const [phase, setPhase] = useState<'bg-warp' | 'impact' | 'sliding' | 'idle' | 'warp-out'>('bg-warp');
    const [ready, setReady] = useState(false);      // шейдеры скомпилированы
    const [impactFired, setImpactFired] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Слушатели — на маунте (безвредны до готовности)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        const handleScroll = () => {
            scrollRef.current = Math.max(0, window.scrollY / window.innerHeight);
        };
        const handleWarpOut = () => setPhase('warp-out');

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('stack-warp-out', handleWarpOut);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('stack-warp-out', handleWarpOut);
        };
    }, []);

    // Интро СТАРТУЕТ только когда шейдеры готовы — иначе фриз на компиляции
    // пришёлся бы прямо на анимацию удара
    useEffect(() => {
        if (!ready) return;
        const t1 = setTimeout(() => {
            setPhase('impact');
            shakeRef.current = 2.0;
            setImpactFired(true); // синхронно триггерим ударную волну
            playSfx(quakePath, 0.8);
        }, 700);
        const t2 = setTimeout(() => setPhase('sliding'), 1300);
        const t3 = setTimeout(() => {
            setPhase('idle');
            window.dispatchEvent(new Event('show-frontend-text'));
        }, 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [ready]);

    return (
        <div className="fixed inset-0 z-0 w-full h-full bg-[#0a0510] overflow-hidden">
            <Canvas dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: true }} camera={{ position: [0, 1, 9], fov: 45 }}>
                <ambientLight intensity={0.3} />
                {/* Свой файл вместо preset: preset тянет 1.5 МБ HDR с raw.githack.com
                    при каждом монтаже страницы — это ложилось прямо в переход. */}
                <Environment files={cityHdr} />
                <SceneWrapper mouseRef={mouseRef} phase={phase} shakeRef={shakeRef} scrollRef={scrollRef} isMobile={isMobile} />
                {/* Ударная волна — триггерится ровно в момент удара (см. impactFired) */}
                <ShockwaveDistortion trigger={impactFired} />
                <WarmUpCompile onReady={() => setReady(true)} />
            </Canvas>
        </div>
    );
};

export default StackBg;