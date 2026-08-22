import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import GalaxyPhone, { type GalaxyPhoneHandle } from './GalaxyPhone';
import quakePath from '../../assets/sounds/quake.mp3';
import nightHdr from '../../assets/hdri/dikhololo_night_1k.hdr?url';
import ShockwaveDistortion from '../effects/ShockwaveDistortion';
import WarmUpCompile from '../effects/WarmUpCompile';
import { playSfx } from '../../utils/sfx';

const INTRO_WARP_DURATION = 1.3; // сек — искажение объектива быстро уходит, тормозя к концу
const SHAKE_DURATION = 0.5; // сек, тряска идёт СРАЗУ ПОСЛЕ интро-искажения (как на About)
// Телефон раскрывается ПОД звук удара — на полсекунды раньше самой волны,
// чтобы движение крышки успело начаться к моменту удара
const PHONE_REVEAL_DELAY = INTRO_WARP_DURATION - 0.5;

// Параллакс камеры: слабый, ленивый (низкий lerp = задержка/лаг за курсором),
// и ВКЛЮЧАЕТСЯ только после того, как отыграют все интро-анимации (искажение,
// тряска, раскрытие телефона ~1.875s). До этого и во время ухода — камера
// стоит по центру.
const PARALLAX_START = PHONE_REVEAL_DELAY + 2.9; // с запасом после раскрытия (~2.7s)
const PARALLAX_STRENGTH_X = 0.15;
const PARALLAX_STRENGTH_Y = 0.08;
const PARALLAX_LERP = 0.02; // мягкий, с ощутимой задержкой

const BASE_CAM_Z = 7;
const BASE_FOV = 45;
// 45° -> 95° почти не отличался от обычного наезда камеры на глаз — на тёмной
// малозаполненной сцене небольшая смена FOV не читается как "искажение".
// Разница должна быть радикальной (настоящий fish-eye/portal-эффект), иначе
// это просто выглядит как обычный зум.
const WARP_FOV = 130;
const CLOSE_ANIM_DURATION = 1.4; // сек, длительность искажения при уходе

// Экспоненциальный ease вместо кубического: у cubic быстрая фаза слишком
// короткая и на глаз кажется равномерно-медленной. Expo даёт РЕЗКИЙ рывок в
// начале (~90% движения за первую треть времени) и длинный плавный докат.
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)); // появление: резко -> плавно тормозит
const easeInExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 14 * (t - 1))); // уход: очень плавно копит -> ОЧЕНЬ резко в конце

function GlowOrbs() {
    const glowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(255, 47, 214, 0.35)');
        gradient.addColorStop(0.5, 'rgba(140, 26, 125, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            <sprite position={[3, 1, -4]} scale={[14, 14, 1]}>
                <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.9} />
            </sprite>
            <sprite position={[-5, -2, -6]} scale={[16, 16, 1]}>
                <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.6} />
            </sprite>
        </group>
    );
}

function Scene({ mouseRef, isMobile, phoneRef, active, isClosing }: { mouseRef: React.MutableRefObject<{ x: number; y: number }>; isMobile: boolean; phoneRef: React.RefObject<GalaxyPhoneHandle | null>; active: boolean; isClosing: boolean }) {
    const { camera } = useThree() as { camera: THREE.PerspectiveCamera };
    const phoneGroupRef = useRef<THREE.Group>(null);
    const closingStart = useRef<number | null>(null);
    const wasClosing = useRef(false);
    const baseCam = useRef(new THREE.Vector2(0, 0)); // позиция камеры БЕЗ тряски

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (isClosing && !wasClosing.current) closingStart.current = t;
        wasClosing.current = isClosing;

        // Параллакс — ТОЛЬКО у камеры (truck): камера смещается за мышью, но
        // смотрит строго вперёд (look-точка = baseCam), поэтому это чистый сдвиг
        // кадра, а телефон визуально НЕ поворачивается. Базу держим отдельно от
        // тряски, чтобы джиттер её не накапливал.
        // Пока идут анимации (интро до PARALLAX_START или уход) — параллакса нет,
        // цель = центр (0,0); включается плавно и с задержкой только после.
        const parallaxActive = !isClosing && t > PARALLAX_START;
        const targetX = parallaxActive ? mouseRef.current.x * PARALLAX_STRENGTH_X : 0;
        const targetY = parallaxActive ? mouseRef.current.y * PARALLAX_STRENGTH_Y : 0;
        baseCam.current.x = THREE.MathUtils.lerp(baseCam.current.x, targetX, PARALLAX_LERP);
        baseCam.current.y = THREE.MathUtils.lerp(baseCam.current.y, targetY, PARALLAX_LERP);

        let camX = baseCam.current.x;
        let camY = baseCam.current.y;

        // Тряска: джиттер только на ПОЗИЦИЮ (не на look-точку) — даёт поворотную
        // встряску, а не просто сдвиг. Многослойная: быстрый рандом + две
        // синусоиды разной частоты (низкочастотный "гул" + высокочастотная
        // дрожь) => читается детализированно, а не как белый шум.
        let shakeRoll = 0;
        if (t >= INTRO_WARP_DURATION && t < INTRO_WARP_DURATION + SHAKE_DURATION) {
            const shakeProgress = (t - INTRO_WARP_DURATION) / SHAKE_DURATION;
            const falloff = Math.pow(1 - shakeProgress, 1.6); // чуть более резкий спад
            const amp = 0.4 * falloff;

            const rumbleX = Math.sin(t * 94) * 0.5 + Math.sin(t * 41) * 0.32;
            const rumbleY = Math.cos(t * 79) * 0.5 + Math.cos(t * 33) * 0.32;

            camX += ((Math.random() - 0.5) * 0.85 + rumbleX * 0.65) * amp;
            camY += ((Math.random() - 0.5) * 0.85 + rumbleY * 0.65) * amp;

            // лёгкий крен камеры — добавляет "веса" удару
            shakeRoll = (Math.sin(t * 61) * 0.6 + (Math.random() - 0.5) * 0.4) * 0.05 * falloff;
        }

        camera.position.set(camX, camY, BASE_CAM_Z);

        // Кинематографичное искажение объектива (FOV) вместо приближения/
        // отдаления камеры — без пауз, один непрерывный тюн в обе стороны.
        // Появление: WARP_FOV -> BASE_FOV, быстро потом медленно (ease-out).
        // Уход: BASE_FOV -> WARP_FOV, медленно потом быстро (ease-in, зеркально).
        let targetFov = BASE_FOV;
        if (isClosing && closingStart.current !== null) {
            const progress = THREE.MathUtils.clamp((t - closingStart.current) / CLOSE_ANIM_DURATION, 0, 1);
            targetFov = THREE.MathUtils.lerp(BASE_FOV, WARP_FOV, easeInExpo(progress));
        } else if (t < INTRO_WARP_DURATION) {
            const progress = THREE.MathUtils.clamp(t / INTRO_WARP_DURATION, 0, 1);
            targetFov = THREE.MathUtils.lerp(WARP_FOV, BASE_FOV, easeOutExpo(progress));
        }
        if (Math.abs(camera.fov - targetFov) > 0.001) {
            camera.fov = targetFov;
            camera.updateProjectionMatrix();
        }

        // Смотрим на точку прямо перед базовой позицией камеры (ось взгляда
        // параллельна -Z) => параллакс = чистое смещение, телефон не крутится.
        // Джиттер тряски в look НЕ входит, поэтому встряска остаётся поворотной.
        camera.lookAt(baseCam.current.x, baseCam.current.y, 0);

        // Крен применяем ПОСЛЕ lookAt — иначе lookAt его перезатирает
        if (shakeRoll !== 0) camera.rotation.z += shakeRoll;

        if (phoneGroupRef.current) {
            phoneGroupRef.current.position.y = (isMobile ? -2.1 : -1.05) + Math.sin(t * 0.7) * 0.12;
        }
    });

    return (
        <group>
            <GlowOrbs />

            <group ref={phoneGroupRef} position={[isMobile ? 0 : -0.8, isMobile ? -2.1 : -1.05, 0]} rotation={[0.12, -0.55, -0.1]}>
                <GalaxyPhone ref={phoneRef} active={active} scale={isMobile ? 0.62 : 0.85} />
            </group>

            <ambientLight intensity={0.45} />
            <pointLight position={[3, 2, 4]} intensity={4} color="#ff2fd6" distance={20} />
            <pointLight position={[-4, -2, 3]} intensity={2.5} color="#b829ff" distance={20} />
            <pointLight position={[0, 4, -4]} intensity={2} color="#ffffff" distance={25} />
        </group>
    );
}

interface ContactBgProps {
    isClosing?: boolean;
}

const ContactBg = ({ isClosing = false }: ContactBgProps) => {
    // Мышь в ref: setState на каждое движение перерисовывал всю сцену с телефоном.
    const mouseRef = useRef({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [revealed, setRevealed] = useState(false);
    const phoneRef = useRef<GalaxyPhoneHandle>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        const handleResize = () => setIsMobile(window.innerWidth < 768);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Сначала отыгрывает интро-искажение объектива (INTRO_WARP_DURATION),
    // потом тряска (+ звук, SHAKE_DURATION), и только потом раскрывается телефон
    useEffect(() => {
        const soundTimer = setTimeout(() => {
            playSfx(quakePath, 0.8);
        }, INTRO_WARP_DURATION * 1000);
        const revealTimer = setTimeout(() => setRevealed(true), PHONE_REVEAL_DELAY * 1000);
        return () => {
            clearTimeout(soundTimer);
            clearTimeout(revealTimer);
        };
    }, []);

    // Один и тот же уход при любом переходе со страницы: крышка закрывается +
    // объектив искажается (см. Scene) + текст размывается (см. ContactSection)
    useEffect(() => {
        if (isClosing) phoneRef.current?.close();
    }, [isClosing]);

    return (
        <div className="fixed inset-0 z-0 w-full h-full bg-[#0c0620] overflow-hidden pointer-events-none">
            <Canvas dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: true }} camera={{ position: [0, 0, BASE_CAM_Z], fov: WARP_FOV }}>
                <Environment files={nightHdr} />
                <Scene mouseRef={mouseRef} isMobile={isMobile} phoneRef={phoneRef} active={revealed} isClosing={isClosing} />
                {/* Ударная волна — синхронно с тряской */}
                <ShockwaveDistortion startAt={INTRO_WARP_DURATION} />
                {/* Прогрев вместо <Preload all />: тот делал синхронную компиляцию
                    и 6 полных рендеров сцены через CubeCamera прямо в useLayoutEffect. */}
                <WarmUpCompile onReady={() => {}} />
            </Canvas>
        </div>
    );
};

export default ContactBg;
