import { useEffect } from 'react';
import quakePath from '../../assets/sounds/quake.mp3';
import { playSfx } from '../../utils/sfx';

/**
 * Звук удара. Управляется из SceneController: как только impacted стал true,
 * проигрываем громкий удар (quake). Живёт отдельным компонентом, чтобы вся
 * звуковая логика была в одном месте.
 */
export default function SoundManager({ impacted }: { impacted: boolean }) {
    useEffect(() => {
        if (!impacted) return;
        playSfx(quakePath, 1);
    }, [impacted]);

    return null;
}
