import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type * as THREE from 'three';

/**
 * Прогрев сцены ДО старта интро-анимации.
 *
 * Проблема: у каждого <Canvas> свой WebGL-контекст со своим кешем шейдерных
 * программ и своей видеопамятью. Home/Contact не фризят, потому что монтируются
 * под прелоудером и успевают подготовиться. Stack/About монтируются в момент
 * клика — и вся подготовка приходится на первые кадры интро => фриз.
 *
 * Подготовка состоит из двух разных вещей:
 *
 * 1. Компиляция шейдеров. gl.compileAsync собирает все программы сцены в фоне
 *    (KHR_parallel_shader_compile), не блокируя главный поток.
 *
 * 2. Заливка текстур в видеопамять. Её compileAsync НЕ делает: текстура уходит
 *    на GPU при первой отрисовке материала. В проекте 51 текстура 1024x1024 —
 *    это ~200 МБ распакованных данных, и при смене страницы всё заливается
 *    заново, потому что старый контекст уничтожен вместе со своей памятью.
 *    Одним куском это заметный фриз, поэтому грузим порциями по кадрам:
 *    суммарное время то же, но оно уходит в статичное ожидание, а не в рывок
 *    посреди анимации.
 *
 * onReady вызывается, только когда готово и то, и другое.
 */

/** Сколько текстур заливаем за кадр. Больше — быстрее старт, но заметнее рывок. */
const TEX_PER_FRAME = 4;

/** Страховка: если прогрев завис или не поддержан — не держим сцену вечно. */
const MAX_WAIT_MS = 2500;

function collectTextures(scene: THREE.Object3D): THREE.Texture[] {
    const found = new Set<THREE.Texture>();

    scene.traverse((obj) => {
        const withMat = obj as unknown as { material?: unknown };
        if (!withMat.material) return;

        const mats = Array.isArray(withMat.material) ? withMat.material : [withMat.material];
        for (const mat of mats) {
            if (!mat) continue;
            // Карты материала не перечислены отдельным списком — забираем все
            // поля, которые оказались текстурой (map, normalMap, emissiveMap, …)
            for (const key of Object.keys(mat)) {
                const value = (mat as Record<string, unknown>)[key] as THREE.Texture | undefined;
                if (value && (value as { isTexture?: boolean }).isTexture) found.add(value);
            }
        }
    });

    return [...found];
}

export default function WarmUpCompile({ onReady }: { onReady: () => void }) {
    const { gl, scene, camera } = useThree();

    const shadersDone = useRef(false);
    const queue = useRef<THREE.Texture[] | null>(null);
    const finished = useRef(false);

    const finish = useRef(() => {
        if (finished.current) return;
        finished.current = true;
        onReady();
    });

    useEffect(() => {
        const anyGl = gl as unknown as {
            compileAsync?: (s: typeof scene, c: typeof camera) => Promise<unknown>;
            compile: (s: typeof scene, c: typeof camera) => void;
        };

        const markCompiled = () => { shadersDone.current = true; };

        if (typeof anyGl.compileAsync === 'function') {
            anyGl.compileAsync(scene, camera).then(markCompiled).catch(markCompiled);
        } else {
            anyGl.compile(scene, camera);
            markCompiled();
        }

        const t = setTimeout(finish.current, MAX_WAIT_MS);
        return () => { finished.current = true; clearTimeout(t); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFrame(() => {
        if (finished.current || !shadersDone.current) return;

        // Очередь собираем после компиляции: к этому моменту сцена уже собрана
        // целиком, и в обход не попадут модели, доехавшие позже.
        if (queue.current === null) queue.current = collectTextures(scene);

        const initTexture = (gl as unknown as { initTexture?: (t: THREE.Texture) => void }).initTexture;
        if (!initTexture) { finish.current(); return; }

        for (let i = 0; i < TEX_PER_FRAME; i++) {
            const tex = queue.current.pop();
            if (!tex) { finish.current(); return; }
            try {
                initTexture.call(gl, tex);
            } catch {
                // Битую текстуру просто пропускаем — прогрев важнее
            }
        }
    });

    return null;
}
