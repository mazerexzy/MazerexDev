import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface ShockwaveDistortionProps {
    /**
     * Секунда на часах сцены, когда стартует волна (= момент тряски).
     * Подходит, если тряска идёт по фиксированному времени от старта сцены.
     */
    startAt?: number;
    /**
     * Альтернатива startAt: волна стартует в момент, когда сюда пришло true.
     * Нужно там, где момент удара не привязан жёстко к часам сцены
     * (например, на главной время сцены сдвигается при возврате на страницу).
     */
    trigger?: boolean;
    /** Длительность жизни волны, сек */
    duration?: number;
    /** Сила преломления (смещение UV на гребне) */
    strength?: number;
    /** Сила блочного глитча по гребню (0 — выключить) */
    glitch?: number;
    /** Толщина барьера */
    width?: number;
    /** Как далеко уходит волна (1.15 ≈ за край экрана) */
    reach?: number;
}

/**
 * Ударная (звуковая) волна как ЭКРАННОЕ искажение: прозрачный БЕСЦВЕТНЫЙ
 * "барьер", который только преломляет картинку за собой — никакой подсветки
 * и хроматики, иначе гребень, проезжая через весь экран, читается как
 * изменение цвета на всё время волны.
 *
 * ЦВЕТА НЕ МЕНЯЮТСЯ ПО ПОСТРОЕНИЮ. Сцена всегда рендерится штатным путём прямо
 * в канвас — то есть со всеми стадиями three (тон-маппинг + linear->sRGB).
 * Затем УЖЕ ГОТОВЫЙ кадр копируется с канваса в текстуру и выводится через
 * шейдер со смещением UV. Шейдер не делает никаких цветовых конверсий (и
 * текстура не декодируется), поэтому это точный passthrough.
 *
 * Так было не всегда: раньше сцена рендерилась в render target, а шейдер пытался
 * ВОСПРОИЗВЕСТИ пайплайн three вручную — в render target three пишет линейные
 * значения без тон-маппинга, и повторить это один-в-один не получалось, из-за
 * чего на время волны кадр менял оттенок.
 *
 * ВАЖНО: компонент забирает рендер на себя (useFrame с priority 1), поэтому на
 * один <Canvas> должен быть только ОДИН такой компонент.
 */
export default function ShockwaveDistortion({
    startAt,
    trigger = false,
    duration = 1.9,
    strength = 0.13,
    glitch = 1,
    width = 0.42,
    reach = 1.55,
}: ShockwaveDistortionProps) {
    const { gl, scene, camera } = useThree();
    const startedAt = useRef<number | null>(null);
    const frameTex = useRef<THREE.FramebufferTexture | null>(null);
    const bufSize = useMemo(() => new THREE.Vector2(), []);

    const { quadScene, quadCam, material } = useMemo(() => {
        const m = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uCenter: { value: new THREE.Vector2(0.5, 0.5) },
                uRadius: { value: -1 },
                uWidth: { value: 0.2 },
                uStrength: { value: 0 },
                uAspect: { value: 1 },
                uGlitch: { value: 1 },
                uSeed: { value: 0 },
            },
            depthTest: false,
            depthWrite: false,
            // NoBlending => RGBA фрагмента пишется в буфер КАК ЕСТЬ, без
            // смешивания. Иначе скопированный кадр композитился бы поверх
            // самого себя и прозрачность/цвет поехали бы.
            blending: THREE.NoBlending,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 uCenter;
                uniform float uRadius;
                uniform float uWidth;
                uniform float uStrength;
                uniform float uAspect;
                uniform float uGlitch;
                uniform float uSeed;
                varying vec2 vUv;

                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
                }

                void main() {
                    vec2 uv = vUv;

                    // расстояние до центра с поправкой на пропорции экрана,
                    // иначе волна будет эллипсом
                    vec2 d = uv - uCenter;
                    d.x *= uAspect;
                    float dist = length(d);

                    // мягкая полоса-гребень вокруг текущего радиуса
                    float band = smoothstep(uWidth, 0.0, abs(dist - uRadius));

                    vec2 dir = d / max(dist, 1e-5);
                    dir.x /= uAspect;

                    // Рябь: внутри гребня не одна гладкая полоса, а несколько
                    // концентрических колец. Частота низкая => кольца широкие,
                    // волна читается крупнее.
                    float ripple = sin((dist - uRadius) * 30.0);
                    vec2 off = dir * band * uStrength * (0.5 + 0.5 * ripple);

                    // Блочный глитч: рвём кадр прямоугольными плитками у гребня.
                    // Порог высокий => рвётся лишь небольшая часть плиток,
                    // поэтому глитч заметен, но не забивает картинку.
                    vec2 cell = floor(uv * vec2(14.0, 9.0));
                    float torn = step(0.8, hash(cell + uSeed)) * band;
                    vec2 glitchOff = vec2(
                        (hash(cell.yx + uSeed * 1.7) - 0.5) * 0.045,
                        (hash(cell + uSeed * 2.3) - 0.5) * 0.009
                    ) * torn * uGlitch;

                    // Волна БЕСЦВЕТНАЯ: только смещаем пиксели, ничего не
                    // подмешиваем и не разводим по каналам. Вне гребня band = 0,
                    // значит пиксель берётся один-в-один с исходного кадра.
                    // Альфу ОБЯЗАТЕЛЬНО сохраняем: канвас прозрачный, и сквозь
                    // alpha = 0 просвечивает CSS-фон страницы. Если выводить
                    // alpha = 1, фон становится тёмным на всё время волны.
                    gl_FragColor = texture2D(tDiffuse, uv + off + glitchOff);
                }
            `,
        });

        const s = new THREE.Scene();
        s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
        return { quadScene: s, quadCam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), material: m };
    }, []);

    // priority > 0 => берём рендер на себя (R3F перестаёт рендерить сам)
    useFrame((state) => {
        const now = state.clock.getElapsedTime();

        // Момент старта: либо фиксированное время, либо момент прихода trigger
        if (startedAt.current === null) {
            if (typeof startAt === 'number') startedAt.current = startAt;
            else if (trigger) startedAt.current = now;
        }

        const local = startedAt.current === null ? -1 : now - startedAt.current;
        const active = local >= 0 && local <= duration;

        // 1. Всегда обычный рендер в канвас — цвета родные, без вариантов
        gl.setRenderTarget(null);
        gl.render(scene, camera);

        if (!active) return;

        // 2. Забираем готовый кадр с канваса
        gl.getDrawingBufferSize(bufSize);
        const w = Math.max(1, Math.floor(bufSize.x));
        const h = Math.max(1, Math.floor(bufSize.y));

        if (!frameTex.current || frameTex.current.image.width !== w || frameTex.current.image.height !== h) {
            frameTex.current?.dispose();
            frameTex.current = new THREE.FramebufferTexture(w, h);
        }
        gl.copyFramebufferToTexture(frameTex.current);

        // 3. Рисуем его же поверх, но со смещением UV по гребню волны
        const p = local / duration;
        const eased = 1 - Math.pow(1 - p, 3); // резко расходится, плавно тормозит
        material.uniforms.uRadius.value = eased * reach;
        material.uniforms.uWidth.value = width * (1 - p * 0.45);
        material.uniforms.uStrength.value = strength * Math.pow(1 - p, 1.4);
        material.uniforms.uAspect.value = w / h;
        material.uniforms.tDiffuse.value = frameTex.current;
        // Глитч сильнее в начале и быстро спадает; seed квантуем (~16 раз/сек),
        // чтобы блоки рвались ступенчато, а не мерцали каждый кадр
        material.uniforms.uGlitch.value = glitch * Math.pow(1 - p, 2.2);
        material.uniforms.uSeed.value = Math.floor(local * 16);

        gl.render(quadScene, quadCam);
    }, 1);

    return null;
}
