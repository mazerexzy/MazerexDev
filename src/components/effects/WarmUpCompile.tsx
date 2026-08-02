import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Прогрев шейдеров ДО старта интро-анимации.
 *
 * Проблема: у каждого <Canvas> свой WebGL-контекст со своим кешем шейдерных
 * программ. Home/Contact не фризят, потому что монтируются под прелоудером и
 * успевают скомпилироваться заранее. Stack/About монтируются в момент клика —
 * и десятки программ (модели + лампы) компилируются синхронно прямо на первых
 * кадрах интро => фриз.
 *
 * Решение: gl.compileAsync компилирует все материалы сцены в ФОНЕ
 * (KHR_parallel_shader_compile), не блокируя главный поток. Пока идёт компиляция,
 * держим статичный кадр, а onReady запускает интро только по готовности.
 *
 * Модели уже предзагружены (useGLTF.preload в App), поэтому к моменту этого
 * эффекта они уже в сцене — compileAsync видит их материалы.
 */
export default function WarmUpCompile({ onReady }: { onReady: () => void }) {
    const { gl, scene, camera } = useThree();

    useEffect(() => {
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            onReady();
        };

        const anyGl = gl as unknown as {
            compileAsync?: (s: typeof scene, c: typeof camera) => Promise<unknown>;
            compile: (s: typeof scene, c: typeof camera) => void;
        };

        if (typeof anyGl.compileAsync === 'function') {
            anyGl.compileAsync(scene, camera).then(finish).catch(finish);
        } else {
            anyGl.compile(scene, camera);
            finish();
        }

        // Подстраховка: если compileAsync завис/не поддержан — не держим сцену вечно
        const t = setTimeout(finish, 2500);
        return () => { done = true; clearTimeout(t); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
