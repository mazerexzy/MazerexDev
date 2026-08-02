/**
 * Проигрывание разовых звуков (тряска/удар) в обход Howler.
 *
 * Зачем: Howler.mute() глушит только то, что играется через Howler (use-sound).
 * Звуки сцен создавались как нативные new Audio(...) — их мьют не касался,
 * из-за чего кнопка звука не отключала тряску.
 *
 * Здесь держим общий флаг мьюта и реестр играющих сейчас элементов, чтобы
 * выключение звука срабатывало и на уже запущенных звуках.
 */

let muted = false;
const active = new Set<HTMLAudioElement>();

export function isSfxMuted() {
    return muted;
}

/** Вызывается из SoundToggle вместе с Howler.mute(). */
export function setSfxMuted(value: boolean) {
    muted = value;
    for (const a of active) a.muted = value;
}

/**
 * Играет разовый звук с учётом текущего мьюта.
 * Возвращает элемент (может пригодиться для fade/stop).
 */
export function playSfx(src: string, volume = 1): HTMLAudioElement {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.muted = muted;

    active.add(audio);
    const cleanup = () => active.delete(audio);
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });

    audio.play().catch(() => cleanup());
    return audio;
}
