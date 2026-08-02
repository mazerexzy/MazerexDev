import * as THREE from 'three';

/** Мягкий радиальный «пух» — для огня, дыма, искр, вспышки. */
export function radialTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.35)', outer = 'rgba(255,255,255,0)') {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(0.4, mid);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}
