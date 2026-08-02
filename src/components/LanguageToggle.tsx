import useSound from 'use-sound';
import hoverSound from '../assets/sounds/hover.mp3';
import clickSound from '../assets/sounds/click.mp3';
import { useLanguage, type Lang } from '../context/LanguageContext';

/**
 * Переключатель языка в правом нижнем углу (симметрично SoundToggle слева).
 * Активный язык — белый, неактивный приглушён; между ними разделитель.
 */
export default function LanguageToggle() {
    const { lang, setLang } = useLanguage();

    const [playHover] = useSound(hoverSound, { volume: 0.5, sprite: { trimmedClick: [100, 2000] } });
    const [playClick] = useSound(clickSound, { volume: 0.8, sprite: { trimmedClick: [100, 2000] } });

    const pick = (l: Lang) => {
        if (l === lang) return;
        playClick({ id: 'trimmedClick' });
        setLang(l);
    };

    const cls = (l: Lang) =>
        `font-gdblack text-[13px] tracking-wider transition-all duration-300 cursor-pointer ${
            lang === l ? 'text-white' : 'text-white/40 hover:text-white/70'
        }`;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none [text-shadow:1px_1px_3px_#000,_0_0_1px_#000]">
            <button
                onClick={() => pick('en')}
                onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                className={cls('en')}
                aria-label="Switch to English"
            >
                EN
            </button>

            <span className="w-px h-3 bg-white/25" />

            <button
                onClick={() => pick('ru')}
                onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                className={cls('ru')}
                aria-label="Переключить на русский"
            >
                RU
            </button>
        </div>
    );
}
