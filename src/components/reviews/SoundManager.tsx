import { useEffect } from 'react';
import quakePath from '../../assets/sounds/quake.mp3';
import fallPath from '../../assets/sounds/meteorite_fall.mp3';
import { playSfx } from '../../utils/sfx';

/** Рёв падения тише удара, иначе quake в момент столкновения теряется. */
const FALL_VOLUME = 0.55;

/**
 * Задержка старта рёва относительно появления сцены, сек.
 *
 * Дорожка (~4.0с) обрывается резко, без затухания в конце. Со стартом в ноль
 * этот обрыв приходился на момент, когда на экране ещё идёт падение, и звук
 * будто заканчивался раньше события. Сдвиг отодвигает обрыв за удар
 * (FLIGHT_DURATION = 2.4с), а начало полёта остаётся под тишину разгона.
 */
const FALL_DELAY = 0.8;

/**
 * Звук сцены. Живёт отдельным компонентом, чтобы вся звуковая логика была
 * в одном месте. Падение — по таймеру от монтажа (сцена появляется вместе
 * с началом полёта), удар — по impacted из SceneController.
 */
export default function SoundManager({ impacted }: { impacted: boolean }) {
    useEffect(() => {
        let fall: HTMLAudioElement | null = null;
        const timer = setTimeout(() => {
            fall = playSfx(fallPath, FALL_VOLUME);
        }, FALL_DELAY * 1000);

        // Уход со страницы посреди полёта не должен оставлять звук висеть
        return () => {
            clearTimeout(timer);
            if (fall) {
                fall.pause();
                fall.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        if (!impacted) return;
        playSfx(quakePath, 1);
    }, [impacted]);

    return null;
}
