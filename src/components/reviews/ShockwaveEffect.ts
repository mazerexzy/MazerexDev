import { Effect } from 'postprocessing';
import { Uniform, Vector2, Vector3, type Camera, type WebGLRenderer } from 'three';
import { IMPACT } from './sceneState';

/**
 * Та же ударная волна, что и на остальных страницах (радиальное искажение +
 * рябь + блочный глитч), но как postprocessing-Effect — чтобы жить внутри
 * <EffectComposer> reviews (кастомный ShockwaveDistortion сам рендерит кадр и
 * конфликтовал бы с композером).
 *
 * Вся анимация — в update(), который EffectPass вызывает каждый кадр сам.
 * Так эффект не зависит от порядка/наличия внешнего useFrame.
 */
const FRAG = /* glsl */`
uniform float uRadius;
uniform float uWidth;
uniform float uStrength;
uniform float uGlitch;
uniform float uSeed;
uniform float uAspect;
uniform vec2 uCenter;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void mainUv(inout vec2 uv) {
    if (uStrength <= 0.0) return;

    vec2 d = uv - uCenter;
    d.x *= uAspect;
    float dist = length(d);

    float band = smoothstep(uWidth, 0.0, abs(dist - uRadius));
    vec2 dir = d / max(dist, 1e-5);
    dir.x /= uAspect;

    // несколько концентрических колец
    float ripple = sin((dist - uRadius) * 30.0);
    uv += dir * band * uStrength * (0.5 + 0.5 * ripple);

    // редкий блочный глитч у гребня
    vec2 cell = floor(uv * vec2(14.0, 9.0));
    float torn = step(0.8, hash(cell + uSeed)) * band;
    uv += vec2(
        (hash(cell.yx + uSeed * 1.7) - 0.5) * 0.045,
        (hash(cell + uSeed * 2.3) - 0.5) * 0.009
    ) * torn * uGlitch;
}
`;

export interface WaveState {
    /** performance.now() в момент удара; null — волна ещё не запускалась */
    impactTime: number | null;
}

const DURATION = 1.9; // сек реального времени (не зависит от slow-mo)
const _v = new Vector3();
const _size = new Vector2();

export class ShockwaveEffectImpl extends Effect {
    private camera: Camera;
    private state: WaveState;

    constructor(camera: Camera, state: WaveState) {
        super('ReviewShockwave', FRAG, {
            uniforms: new Map<string, Uniform>([
                ['uRadius', new Uniform(-1)],
                ['uWidth', new Uniform(0.42)],
                ['uStrength', new Uniform(0)],
                ['uGlitch', new Uniform(1)],
                ['uSeed', new Uniform(0)],
                ['uAspect', new Uniform(1)],
                ['uCenter', new Uniform(new Vector2(0.5, 0.5))],
            ]),
        });
        this.camera = camera;
        this.state = state;
    }

    /** Вызывается EffectPass каждый кадр автоматически. */
    update(renderer: WebGLRenderer) {
        const u = this.uniforms;
        const it = this.state.impactTime;

        if (it == null) {
            u.get('uStrength')!.value = 0;
            return;
        }

        const since = (performance.now() - it) / 1000;
        if (since < 0 || since > DURATION) {
            u.get('uStrength')!.value = 0;
            return;
        }

        const p = since / DURATION;
        const eased = 1 - Math.pow(1 - p, 3); // резко расходится, плавно тормозит

        u.get('uRadius')!.value = eased * 1.55;
        u.get('uWidth')!.value = 0.42 * (1 - p * 0.45);
        u.get('uStrength')!.value = 0.2 * Math.pow(1 - p, 1.4);
        u.get('uGlitch')!.value = Math.pow(1 - p, 2.2);
        u.get('uSeed')!.value = Math.floor(since * 16);

        renderer.getSize(_size);
        u.get('uAspect')!.value = _size.x / Math.max(1, _size.y);

        // центр волны = точка удара в экранных координатах
        _v.copy(IMPACT).project(this.camera);
        (u.get('uCenter')!.value as Vector2).set(_v.x * 0.5 + 0.5, _v.y * 0.5 + 0.5);
    }
}
