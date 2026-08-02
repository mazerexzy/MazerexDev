import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import SceneController from './SceneController';
import ShockwavePass from './ShockwavePass';
import CursorDistortionPass from './CursorDistortionPass';
import type { WaveState } from './ShockwaveEffect';
import type { CursorState } from './CursorDistortionEffect';

/**
 * Фон страницы reviews: тёмный космос + кинематографичная сцена падения
 * метеорита. Физика осколков — Rapier, свечение/огонь/трещины вытягивает Bloom,
 * лёгкая хроматика и виньетка добавляют «дорогой» кадр.
 *
 * key-ремонтирование извне (из App) перезапускает всю анимацию с нуля при
 * повторном заходе на страницу.
 */
const ReviewsBg = ({ onImpact }: { onImpact?: () => void }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    // Общий якорь для ударной волны в композере (эффект читает его в update())
    const waveState = useRef<WaveState>({ impactTime: null }).current;
    // Позиция курсора для линзового искажения (в UV-координатах экрана)
    const cursorState = useRef<CursorState>({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 }).current;

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        // Курсор читаем напрямую с окна: канвас pointer-events:none, а эффекту
        // нужны экранные UV (0..1, y снизу вверх — как в шейдере).
        const onMove = (e: MouseEvent) => {
            cursorState.x = e.clientX / window.innerWidth;
            cursorState.y = 1 - e.clientY / window.innerHeight;
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMove);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMove);
        };
    }, [cursorState]);

    return (
        <div className="fixed inset-0 z-0 w-full h-full bg-black overflow-hidden pointer-events-none">
            <Canvas
                shadows
                dpr={[1, 1.5]}
                gl={{ powerPreference: 'high-performance', antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                camera={{ position: [-3, 8.5, 26], fov: 42 }}
            >
                <color attach="background" args={['#03030a']} />
                <fog attach="fog" args={['#03030a', 30, 90]} />

                <Suspense fallback={null}>
                    <Physics gravity={[0, -26, 0]}>
                        <SceneController
                            isMobile={isMobile}
                            cursor={cursorState}
                            onImpact={() => {
                                waveState.impactTime = performance.now();
                                onImpact?.(); // сигнал наружу — по нему появляется текст
                            }}
                        />
                    </Physics>
                </Suspense>

                <EffectComposer>
                    {/* Ударная волна — как на других страницах, но эффектом
                        композера (первой в цепочке, чтобы искажение шло до блума). */}
                    <ShockwavePass state={waveState} />
                    {/* Линзовое искажение, следующее за курсором */}
                    <CursorDistortionPass state={cursorState} />
                    {/* Порог высокий (0.95) => блумят только реально яркие
                        объекты, а не вся эмиссия сцены — иначе после удара
                        яркие ядро/трещины/свет размазывались в белую пелену,
                        которая не уходит. Сила умеренная. */}
                    <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.95} luminanceSmoothing={0.12} />
                    <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0006, 0.0006]} radialModulation={false} modulationOffset={0} />
                    <Vignette eskil={false} offset={0.28} darkness={0.85} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};

export default ReviewsBg;
