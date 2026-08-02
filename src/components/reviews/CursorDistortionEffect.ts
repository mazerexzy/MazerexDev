import { Effect } from 'postprocessing';
import { Uniform, Vector2, type WebGLRenderer } from 'three';

/**
 * Мягкое линзовое искажение, следующее за курсором (как на vertex3d.asia):
 * вокруг мыши кадр слегка «засасывает» к центру линзы + тонкая хроматическая
 * кайма по её краю. Позиция мыши приходит из общего mutable-состояния, которое
 * обновляет DOM-слушатель — эффект не зависит от useFrame.
 */
const FRAG = /* glsl */`
uniform vec2 uMouse;
uniform float uAspect;
uniform float uRadius;
uniform float uStrength;

void mainUv(inout vec2 uv) {
    vec2 d = uv - uMouse;
    d.x *= uAspect;
    float dist = length(d);

    // Плавное затухание от центра линзы к её краю
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
    if (falloff <= 0.0) return;

    vec2 dir = d / max(dist, 1e-5);
    dir.x /= uAspect;

    // Лёгкое «стягивание» к курсору + всплеск на самом краю линзы (ободок)
    float rim = sin(falloff * 3.14159);
    uv -= dir * (falloff * falloff * uStrength + rim * uStrength * 0.35);
}
`;

export interface CursorState {
    /** позиция курсора в UV-координатах экрана (0..1) */
    x: number;
    y: number;
    /** плавно сглаженные значения (лаг за курсором) */
    sx: number;
    sy: number;
}

const _size = new Vector2();

export class CursorDistortionEffectImpl extends Effect {
    private state: CursorState;

    constructor(state: CursorState, radius = 0.22, strength = 0.022) {
        super('CursorDistortion', FRAG, {
            uniforms: new Map<string, Uniform>([
                ['uMouse', new Uniform(new Vector2(0.5, 0.5))],
                ['uAspect', new Uniform(1)],
                ['uRadius', new Uniform(radius)],
                ['uStrength', new Uniform(strength)],
            ]),
        });
        this.state = state;
    }

    update(renderer: WebGLRenderer) {
        const s = this.state;
        // ленивое следование за курсором — искажение «тянется» с задержкой
        s.sx += (s.x - s.sx) * 0.08;
        s.sy += (s.y - s.sy) * 0.08;

        (this.uniforms.get('uMouse')!.value as Vector2).set(s.sx, s.sy);
        renderer.getSize(_size);
        this.uniforms.get('uAspect')!.value = _size.x / Math.max(1, _size.y);
    }
}
