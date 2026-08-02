import * as THREE from 'three';
import { createContext, useContext } from 'react';

export type Phase = 'flight' | 'impact' | 'aftermath' | 'settled';

/**
 * Единое мутируемое состояние сцены. Живёт в ref — читается/пишется в useFrame
 * без re-render'ов React. Так вся анимация (метеор, хвост, дым, искры, свет)
 * синхронизируется по одному таймеру и не дёргает реконсиляцию.
 */
export interface SceneState {
    elapsed: number;        // «сценическое» время (масштабируется slow-mo)
    slowmo: number;         // 1 = норма, <1 = замедление
    phase: Phase;
    impacted: boolean;
    impactElapsed: number;  // elapsed в момент удада
    realSinceImpact: number;// реальные секунды с удара (для окна slow-mo)
    meteor: THREE.Vector3;  // текущая позиция метеорита
    colorShift: number;     // 0 = оранжевая гамма (полёт) -> 1 = фиолетовая (после удара)
}

export const FLIGHT_DURATION = 2.4;           // сек полёта до удара
export const START = new THREE.Vector3(21, 54, -20);
export const IMPACT = new THREE.Vector3(7, 0.15, 0);
export const GROUND_Y = 0;

const _s = new THREE.Vector3();
const _e = new THREE.Vector3();

/**
 * Детерминированная траектория падения: любой компонент может вычислить позицию
 * метеорита для заданного времени без привязки к порядку выполнения useFrame.
 * Ускорение квадратичное (как под гравитацией): distance ∝ t².
 */
export function getMeteorPos(elapsed: number, out: THREE.Vector3): THREE.Vector3 {
    const p = Math.min(elapsed / FLIGHT_DURATION, 1);
    const ease = p * p; // ease-in — быстрее к земле
    out.lerpVectors(_s.copy(START), _e.copy(IMPACT), ease);
    return out;
}

export function createSceneState(): SceneState {
    return {
        elapsed: 0,
        slowmo: 1,
        phase: 'flight',
        impacted: false,
        impactElapsed: 0,
        realSinceImpact: 0,
        meteor: getMeteorPos(0, new THREE.Vector3()),
        colorShift: 0,
    };
}

export const SceneCtx = createContext<SceneState>(null!);
export const useScene = () => useContext(SceneCtx);

// Палитра
export const COLD = '#5b6cff';      // холодный космический свет
export const FIRE = '#ff6a1a';      // огонь/полёт
export const FIRE_HOT = '#ffd08a';  // раскал
export const PURPLE = '#b829ff';    // фиолетовое свечение трещин/ядра
export const PURPLE_DEEP = '#7a1fd0';
