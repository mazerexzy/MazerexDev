import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

import laptopPath from '../../assets/models/laptop.glb?url';
import platformPath from '../../assets/models/platform.glb?url';
import spaceFirePath from '../../assets/models/spaceFire.glb?url'; 
import serverPath from '../../assets/models/server.glb?url';
import databasesPath from '../../assets/models/databases.glb?url';
import devopsPath from '../../assets/models/devops.glb?url'; 
import apiPath from '../../assets/models/ApiIntegration.glb?url'; 
import quakePath from '../../assets/sounds/quake.mp3'; 

// 🔥 ДОБАВИЛИ ПАРАМЕТР ROTATION В ЗАГРУЗЧИК
function Model({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: { url: string; scale?: number; position?: [number, number, number]; rotation?: [number, number, number] }) {
    const [model, setModel] = useState<THREE.Group | null>(null);
    useEffect(() => {
        new GLTFLoader().load(url, (gltf) => setModel(gltf.scene));
    }, [url]);
    return model ? <primitive object={model} scale={scale} position={position} rotation={rotation} /> : null;
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

function SpaceFireBackground({ phase }: { phase: string }) {
    const bgRef = useRef<THREE.Group>(null);
    const currentZ = useRef(-300); 

    useFrame(() => {
        if (!bgRef.current) return;
        const baseX = 9;
        const baseY = -1;
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

function AnimatedScene({ phase, scrollProgress }: { phase: string, scrollProgress: number }) {
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
        smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.05);
        
        const sp = smoothProgress.current; 
        
        const sp1 = THREE.MathUtils.clamp(sp, 0, 1);      
        const sp2 = THREE.MathUtils.clamp(sp - 1, 0, 1);  
        const sp3 = THREE.MathUtils.clamp(sp - 2, 0, 1);  
        const sp4 = THREE.MathUtils.clamp(sp - 3, 0, 1);  

        if (parentRef.current) {
            parentRef.current.rotation.y += 0.003;

            if (phase === 'sliding' || phase === 'idle') {
                currentY.current = THREE.MathUtils.lerp(currentY.current, 0, 0.04);
                currentScale.current = THREE.MathUtils.lerp(currentScale.current, 1, 0.04);
                currentRotX.current = THREE.MathUtils.lerp(currentRotX.current, 0, 0.04);
                currentRotZ.current = THREE.MathUtils.lerp(currentRotZ.current, 0, 0.04);
            }

            parentRef.current.position.y = currentY.current;
            parentRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);
            parentRef.current.rotation.x = currentRotX.current;
            parentRef.current.rotation.z = currentRotZ.current;

            if (phase === 'idle') {
                const pulse = 1 + Math.sin(t * 1.5) * 0.01;
                parentRef.current.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), 0.1);
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
            apiRef.current.position.y = -15 + (sp4 * 15.5) + Math.sin(t + 8) * 0.15;
            apiRef.current.rotation.y = (1 - sp4) * -Math.PI; 
            apiRef.current.scale.setScalar(0.5 + sp4 * 0.5); 
        }
    });

    return (
        <group ref={parentRef} position={[0, -40, 0]} scale={[0.01, 0.01, 0.01]}>
            <Model url={platformPath} scale={6} position={[0, -2.0, 0]} />
            <FloatingTechParticles /> 
            
            <group ref={laptopRef}>
                {/* 🔥 РАЗВЕРНУЛИ НОУТ НА 180 ГРАДУСОВ (Math.PI) */}
                <Model url={laptopPath} scale={2} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
                <spotLight position={[0, 0.2, 0]} angle={0.5} penumbra={1} intensity={6} color="#ffaa00" distance={3} />
            </group>

            <group ref={serverRef}>
                <Model url={serverPath} scale={2.5} position={[0, 0, 0]} />
                <spotLight position={[0, 0.2, 0]} angle={0.5} penumbra={1} intensity={8} color="#00ff88" distance={4} />
            </group>

            <group ref={dbRef}>
                {/* 🔥 РАЗВЕРНУЛИ БАЗУ ДАННЫХ НА 180 ГРАДУСОВ (Math.PI) */}
                <Model url={databasesPath} scale={2.5} position={[0, -1.5, 0]} rotation={[0, Math.PI, 0]} />
                <spotLight position={[0, 0.2, 0]} angle={0.5} penumbra={1} intensity={8} color="#8A2BE2" distance={4} />
            </group>

            <group ref={devopsRef}>
                <Model url={devopsPath} scale={2.5} position={[0, 0, 0]} />
                <spotLight position={[0, 0.2, 0]} angle={0.5} penumbra={1} intensity={8} color="#ff3300" distance={4} />
            </group>

            <group ref={apiRef}>
                <Model url={apiPath} scale={2.5} position={[0, 0, 0]} />
                <spotLight position={[0, 0.2, 0]} angle={0.5} penumbra={1} intensity={8} color="#00FFFF" distance={4} />
            </group>
        </group>
    );
}

function SceneWrapper({ mouse, phase, shakeIntensity, setShakeIntensity, scrollProgress }: any) {
    const rootRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    
    useFrame(() => {
        if (!rootRef.current) return;
        
        if (shakeIntensity > 0.01) {
            rootRef.current.position.x = (Math.random() - 0.5) * shakeIntensity;
            rootRef.current.position.y = (Math.random() - 0.5) * shakeIntensity;
            setShakeIntensity(THREE.MathUtils.lerp(shakeIntensity, 0, 0.05));
        } else {
            rootRef.current.position.x = 0;
            rootRef.current.position.y = 0;
        }

        const targetCamX = mouse.x * 0.6; 
        const targetCamY = 1 + mouse.y * 0.4;
        
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.03);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.03);
        camera.lookAt(0, -0.5, 0);
    });

    return (
        <group ref={rootRef}>
            <SpaceFireBackground phase={phase} />
            <group position={[-2.5, 0, 0]}>
                <AnimatedScene phase={phase} scrollProgress={scrollProgress} />
            </group>
        </group>
    );
}

const StackBg = () => {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [phase, setPhase] = useState<'bg-warp' | 'impact' | 'sliding' | 'idle'>('bg-warp');
    const [shakeIntensity, setShakeIntensity] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1 
            });
        };

        const handleScroll = () => {
            setScrollProgress(Math.max(0, window.scrollY / window.innerHeight));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        const t1 = setTimeout(() => {
            setPhase('impact');
            setShakeIntensity(2.0); 
            const quakeAudio = new Audio(quakePath);
            quakeAudio.volume = 0.8;
            quakeAudio.play().catch(err => console.log("Audio block:", err));
        }, 700);

        const t2 = setTimeout(() => {
            setPhase('sliding');
        }, 1300);

        const t3 = setTimeout(() => {
            setPhase('idle');
            window.dispatchEvent(new Event('show-frontend-text'));
        }, 2800);

        return () => { 
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 w-full h-full bg-[#0a0510] overflow-hidden">
            <Canvas camera={{ position: [0, 1, 9], fov: 45 }}> 
                <ambientLight intensity={0.3} />
                <Environment preset="city" />
                <SceneWrapper mouse={mouse} phase={phase} shakeIntensity={shakeIntensity} setShakeIntensity={setShakeIntensity} scrollProgress={scrollProgress} />
            </Canvas>
        </div>
    );
};

export default StackBg;